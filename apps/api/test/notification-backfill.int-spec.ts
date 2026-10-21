import { NotificationType } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import { localiseNotification } from 'src/notifications/notification-messages';
import { createTestContext, TestContext } from './helpers/app';
import { TEST_DATABASE_URL } from './helpers/env';

const BACKFILL = join(
  __dirname,
  '../prisma/migrations/20261021140000_backfill_notification_message_keys/migration.sql',
);

// The rows the API stored before notifications had message keys, written with
// the templates it used then. Names deliberately contain the words around them.
const OLD_ROWS: {
  type: NotificationType;
  title: string;
  text: string;
  english: { title: string; text: string };
}[] = [
  {
    type: 'POST_APPROVAL',
    title: 'Obavijest o objavi',
    text: 'Vaša objava Ptice je odobrena je odobrena',
    english: {
      title: 'Post update',
      text: 'Your post Ptice je odobrena was approved',
    },
  },
  {
    type: 'POST_APPROVAL',
    title: 'Obavijest o objavi',
    text: 'Vaša objava Ptice je odbijena',
    english: { title: 'Post update', text: 'Your post Ptice was rejected' },
  },
  {
    type: 'POST_BY_FOLLOWED_ACCOUNT',
    title: 'Nova objava od korisnika 5f0c-user: Ptice: selice',
    text: 'Prvih dvadeset riječi...',
    english: {
      title: 'New post by 5f0c-user: Ptice: selice',
      text: 'Prvih dvadeset riječi...',
    },
  },
  {
    type: 'NEW_POST_REQUEST',
    title: 'Novi zahtjev za objavu',
    text: 'Novi zahtjev za objavu Ptice korisnika',
    english: {
      title: 'New post request',
      text: 'New request to publish the post Ptice',
    },
  },
  {
    type: 'NEW_EXPONAT_REQUEST',
    title:
      'Organizacija Muzej (Zagreb) je dobila novi zahtev za eksponat Vuk (sivi)',
    text: 'Novi zahtev za eksponat Vuk (sivi) (Canis lupus) organizacije Muzej (Zagreb)',
    english: {
      title:
        'The organisation Muzej (Zagreb) got a new request for the exhibit Vuk (sivi)',
      text: 'New request for the exhibit Vuk (sivi) (Canis lupus) of the organisation Muzej (Zagreb)',
    },
  },
  {
    type: 'EXPONAT_BY_FOLLOWED_ORGANISATION',
    title: 'Novi eksponat organizacije Muzej',
    text: 'Organizacija Muzej je dodala novi eksponat Vuk',
    english: {
      title: 'New exhibit from Muzej',
      text: 'The organisation Muzej added the new exhibit Vuk',
    },
  },
  {
    type: 'NEW_FOLLOWER',
    title: 'Novi pratitelj',
    text: 'Korisnik ana te sada prati',
    english: { title: 'New follower', text: 'ana is now following you' },
  },
  {
    type: 'MEMBERSHIP_CHANGE',
    title: 'Promjena statusa članstva',
    text: 'Vaš status članstva u organizaciji Muzej je promijenjen u admin',
    english: {
      title: 'Membership status changed',
      text: 'Your membership status in the organisation Muzej was changed to admin',
    },
  },
  {
    type: 'MEMBERSHIP_REQUEST',
    title: 'Zahtjev za članstvo',
    text: 'Korisnik ana je poslao zahtjev za članstvo u organizaciji Muzej',
    english: {
      title: 'Membership request',
      text: 'ana asked to join the organisation Muzej',
    },
  },
  {
    type: 'ORGANISATION_APPROVAL',
    title: 'Organizacija Muzej je odbijena',
    text: 'Organizacija Muzej je odbijena',
    english: {
      title: 'The organisation Muzej was rejected',
      text: 'The organisation Muzej was rejected',
    },
  },
  {
    type: 'NEW_SOCIAL_POST',
    title: 'Nova najava organizacije Muzej: Zagreb',
    text: 'Nova najava organizacije Muzej: Zagreb: Noć muzeja',
    english: {
      title: 'New announcement from Muzej: Zagreb',
      text: 'New announcement from Muzej: Zagreb: Noć muzeja',
    },
  },
];

describe('notification message key backfill (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  // The migration already ran on the empty test database; run it again on
  // the rows below. pg sends it as one simple query, statements and all.
  const backfill = async () => {
    const client = new Client({ connectionString: TEST_DATABASE_URL });
    await client.connect();
    try {
      await client.query(readFileSync(BACKFILL, 'utf8'));
    } finally {
      await client.end();
    }
  };

  it('gives old notifications a key, so they render in English', async () => {
    const rows = await Promise.all(
      OLD_ROWS.map(({ type, title, text }) =>
        ctx.prisma.notification.create({ data: { type, title, text } }),
      ),
    );
    await backfill();

    for (const [i, row] of rows.entries()) {
      const stored = await ctx.prisma.notification.findUniqueOrThrow({
        where: { id: row.id },
      });
      expect(stored.messageKey).not.toBeNull();
      expect(localiseNotification(stored, 'EN')).toMatchObject(
        OLD_ROWS[i].english,
      );
      // Rendering it in Croatian gives back what was stored, apart from the
      // old templates' typos, which the new ones fixed.
      const croatian = localiseNotification(stored, 'HR');
      expect(croatian.title).toBe(stored.title.replace('zahtev', 'zahtjev'));
      if (stored.type !== 'NEW_POST_REQUEST')
        expect(croatian.text).toBe(stored.text.replace('zahtev', 'zahtjev'));
    }
  });

  it('leaves rows that do not match their template alone', async () => {
    const odd = await ctx.prisma.notification.create({
      data: {
        type: 'NEW_FOLLOWER',
        title: 'Novi pratitelj',
        text: 'Netko te sada prati',
      },
    });
    const keyed = await ctx.prisma.notification.create({
      data: {
        type: 'NEW_FOLLOWER',
        title: 'New follower',
        text: 'ana is now following you',
        messageKey: 'newFollower',
        params: { username: 'ana' },
      },
    });
    await backfill();

    await expect(
      ctx.prisma.notification.findUniqueOrThrow({ where: { id: odd.id } }),
    ).resolves.toMatchObject({ messageKey: null, text: 'Netko te sada prati' });
    await expect(
      ctx.prisma.notification.findUniqueOrThrow({ where: { id: keyed.id } }),
    ).resolves.toMatchObject({
      messageKey: 'newFollower',
      params: { username: 'ana' },
    });
  });
});
