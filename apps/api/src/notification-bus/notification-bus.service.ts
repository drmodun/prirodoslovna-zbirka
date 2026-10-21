import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationResponse } from '@biosfera/types';
import { Client } from 'pg';

export const NOTIFICATION_CHANNEL = 'user_notifications';

// Postgres refuses NOTIFY payloads of 8000 bytes or more.
const MAX_PAYLOAD_BYTES = 7900;
const RECONNECT_DELAY_MS = 5000;

type BusMessage = { userId: string; message: NotificationResponse };

/**
 * Delivers live notifications to every API instance.
 *
 * Each instance keeps one Postgres connection that LISTENs on
 * NOTIFICATION_CHANNEL. Publishing sends a NOTIFY, Postgres hands it to every
 * listening instance (this one included), and each re-emits it on the local
 * EventEmitter, where the SSE streams of its connected browsers pick it up.
 *
 * If the listener connection is down, notifications are emitted locally only,
 * so browsers on this instance still get them; the stored notification is
 * shown everywhere on the next page load either way.
 */
@Injectable()
export class NotificationBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationBusService.name);
  private client: Client | null = null;
  private connected = false;
  private closing = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    this.closing = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const client = this.client;
    this.client = null;
    this.connected = false;
    await client?.end().catch(() => undefined);
  }

  async publish(userId: string, message: NotificationResponse) {
    const payload = JSON.stringify({ userId, message } as BusMessage);

    if (
      this.connected &&
      Buffer.byteLength(payload, 'utf8') < MAX_PAYLOAD_BYTES
    ) {
      try {
        await this.client.query('SELECT pg_notify($1, $2)', [
          NOTIFICATION_CHANNEL,
          payload,
        ]);
        return;
      } catch (error) {
        this.logger.warn(
          `NOTIFY failed, delivering locally only: ${error?.message ?? error}`,
        );
      }
    }

    this.deliver(userId, message);
  }

  private deliver(userId: string, message: NotificationResponse) {
    this.eventEmitter.emit(userId, message);
  }

  private handleNotification(payload?: string) {
    if (!payload) return;
    try {
      const { userId, message } = JSON.parse(payload) as BusMessage;
      if (userId) this.deliver(userId, message);
    } catch (error) {
      this.logger.warn(`Ignoring malformed notification: ${error?.message}`);
    }
  }

  private async connect() {
    const connectionString = listenerConnectionString(process.env.DATABASE_URL);
    if (!connectionString || this.closing) return;

    const client = new Client({ connectionString });
    client.on('notification', (msg) => {
      if (msg.channel === NOTIFICATION_CHANNEL)
        this.handleNotification(msg.payload);
    });
    client.on('error', (error) => {
      this.logger.warn(`Listener connection error: ${error.message}`);
      this.scheduleReconnect(client);
    });
    client.on('end', () => this.scheduleReconnect(client));

    try {
      await client.connect();
      await client.query(`LISTEN ${NOTIFICATION_CHANNEL}`);
      this.client = client;
      this.connected = true;
    } catch (error) {
      this.logger.warn(
        `Could not listen for notifications, retrying: ${error?.message}`,
      );
      await client.end().catch(() => undefined);
      this.scheduleReconnect(client);
    }
  }

  private scheduleReconnect(client: Client) {
    if (this.closing || this.reconnectTimer) return;
    if (this.client && this.client !== client) return;

    this.connected = false;
    this.client = null;
    client.removeAllListeners('end');
    client.end().catch(() => undefined);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, RECONNECT_DELAY_MS);
    this.reconnectTimer.unref();
  }
}

// Prisma connection strings may carry Prisma-only parameters (`schema`,
// `connection_limit`, ...) that Postgres would reject as startup options.
export const listenerConnectionString = (url?: string) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()])
      if (key !== 'sslmode') parsed.searchParams.delete(key);
    return parsed.toString();
  } catch {
    return null;
  }
};
