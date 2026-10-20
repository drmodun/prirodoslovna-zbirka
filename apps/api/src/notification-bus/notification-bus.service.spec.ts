import { EventEmitter } from 'events';
import {
  listenerConnectionString,
  NOTIFICATION_CHANNEL,
  NotificationBusService,
} from './notification-bus.service';

const clients: FakeClient[] = [];

class FakeClient extends EventEmitter {
  connect = jest.fn().mockResolvedValue(undefined);
  end = jest.fn().mockResolvedValue(undefined);
  query = jest.fn().mockResolvedValue({});
  constructor(public readonly config: any) {
    super();
    clients.push(this);
  }
}

jest.mock('pg', () => ({
  Client: jest.fn().mockImplementation((config) => new FakeClient(config)),
}));

describe('NotificationBusService', () => {
  const original = process.env.DATABASE_URL;
  let emitter: { emit: jest.Mock };
  let bus: NotificationBusService;
  const msg = { id: 'n1', title: 'Hi' } as any;

  beforeEach(() => {
    clients.length = 0;
    process.env.DATABASE_URL =
      'postgresql://u:p@db:5432/biosfera?schema=public';
    emitter = { emit: jest.fn() };
    bus = new NotificationBusService(emitter as any);
    jest.spyOn((bus as any).logger, 'warn').mockImplementation();
  });

  afterEach(async () => {
    await bus.onModuleDestroy();
    process.env.DATABASE_URL = original;
  });

  it('listens on the notification channel at startup', async () => {
    await bus.onModuleInit();
    expect(clients).toHaveLength(1);
    expect(clients[0].config.connectionString).toBe(
      'postgresql://u:p@db:5432/biosfera',
    );
    expect(clients[0].query).toHaveBeenCalledWith(
      `LISTEN ${NOTIFICATION_CHANNEL}`,
    );
  });

  it('publishes through NOTIFY instead of emitting locally', async () => {
    await bus.onModuleInit();
    await bus.publish('u1', msg);

    expect(clients[0].query).toHaveBeenCalledWith('SELECT pg_notify($1, $2)', [
      NOTIFICATION_CHANNEL,
      JSON.stringify({ userId: 'u1', message: msg }),
    ]);
    expect(emitter.emit).not.toHaveBeenCalled();
  });

  it('re-emits notifications from any instance on the local emitter', async () => {
    await bus.onModuleInit();
    clients[0].emit('notification', {
      channel: NOTIFICATION_CHANNEL,
      payload: JSON.stringify({ userId: 'u1', message: msg }),
    });
    expect(emitter.emit).toHaveBeenCalledWith('u1', msg);
  });

  it('ignores other channels and malformed payloads', async () => {
    await bus.onModuleInit();
    clients[0].emit('notification', { channel: 'other', payload: '{}' });
    clients[0].emit('notification', {
      channel: NOTIFICATION_CHANNEL,
      payload: 'not json',
    });
    expect(emitter.emit).not.toHaveBeenCalled();
  });

  it('delivers locally when the listener could not connect', async () => {
    jest.useFakeTimers();
    try {
      const pg = jest.requireMock('pg');
      pg.Client.mockImplementationOnce((config: any) => {
        const c = new FakeClient(config);
        c.connect.mockRejectedValue(new Error('down'));
        return c;
      });
      await bus.onModuleInit();
      await bus.publish('u1', msg);
      expect(emitter.emit).toHaveBeenCalledWith('u1', msg);

      // and it tries again later
      await jest.runOnlyPendingTimersAsync();
      expect(clients).toHaveLength(2);
      expect(clients[1].query).toHaveBeenCalledWith(
        `LISTEN ${NOTIFICATION_CHANNEL}`,
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('delivers locally when NOTIFY fails', async () => {
    await bus.onModuleInit();
    clients[0].query.mockRejectedValueOnce(new Error('boom'));
    await bus.publish('u1', msg);
    expect(emitter.emit).toHaveBeenCalledWith('u1', msg);
  });

  it('delivers payloads too large for NOTIFY locally', async () => {
    await bus.onModuleInit();
    clients[0].query.mockClear();
    await bus.publish('u1', { ...msg, text: 'x'.repeat(9000) });
    expect(clients[0].query).not.toHaveBeenCalled();
    expect(emitter.emit).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ id: 'n1' }),
    );
  });

  it('reconnects after the listener connection drops', async () => {
    jest.useFakeTimers();
    try {
      await bus.onModuleInit();
      clients[0].emit('error', new Error('terminated'));

      await bus.publish('u1', msg);
      expect(emitter.emit).toHaveBeenCalledWith('u1', msg);

      await jest.runOnlyPendingTimersAsync();
      expect(clients).toHaveLength(2);
      await bus.publish('u2', msg);
      expect(clients[1].query).toHaveBeenCalledWith(
        'SELECT pg_notify($1, $2)',
        expect.any(Array),
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('closes the connection on shutdown and does not reconnect', async () => {
    await bus.onModuleInit();
    await bus.onModuleDestroy();
    expect(clients[0].end).toHaveBeenCalled();
    clients[0].emit('end');
    expect(clients).toHaveLength(1);
  });

  it('stays local-only without a DATABASE_URL', async () => {
    delete process.env.DATABASE_URL;
    await bus.onModuleInit();
    expect(clients).toHaveLength(0);
    await bus.publish('u1', msg);
    expect(emitter.emit).toHaveBeenCalledWith('u1', msg);
  });
});

describe('listenerConnectionString', () => {
  it('keeps sslmode and drops Prisma-only parameters', () => {
    expect(
      listenerConnectionString(
        'postgresql://u:p@h:5432/db?schema=public&sslmode=require&connection_limit=5',
      ),
    ).toBe('postgresql://u:p@h:5432/db?sslmode=require');
  });

  it('returns null for missing or invalid urls', () => {
    expect(listenerConnectionString(undefined)).toBeNull();
    expect(listenerConnectionString('not a url')).toBeNull();
  });
});
