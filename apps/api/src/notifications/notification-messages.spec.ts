import {
  localiseNotification,
  NOTIFICATION_MESSAGES,
  renderNotificationMessage,
} from './notification-messages';

describe('notification messages', () => {
  const params = {
    title: 'T',
    author: 'ana',
    excerpt: 'e',
    name: 'N',
    alternateName: 'A',
    organisation: 'O',
    username: 'ana',
    role: 'MEMBER',
    used: '96',
    limit: '120',
  };

  it.each(Object.keys(NOTIFICATION_MESSAGES))(
    '%s has a title in both languages and fills every parameter',
    (key) => {
      for (const language of ['EN', 'HR'] as const) {
        const { title, text } = renderNotificationMessage(
          key as any,
          params,
          language,
        );
        expect(title).toBeTruthy();
        expect(`${title} ${text}`).not.toContain('undefined');
      }
    },
  );

  it('names membership roles in the reader language', () => {
    const render = (language: 'EN' | 'HR') =>
      renderNotificationMessage(
        'membershipChange',
        { organisation: 'O', role: 'OWNER' },
        language,
      ).text;
    expect(render('EN')).toContain('changed to owner');
    expect(render('HR')).toContain('promijenjen u vlasnik');
  });

  it('keeps the stored text of notifications without a key', () => {
    const old = { title: 'Novi pratitelj', text: 'stari tekst' };
    expect(localiseNotification(old, 'EN')).toBe(old);
  });

  it('defaults to English', () => {
    expect(
      localiseNotification({
        title: 'x',
        messageKey: 'newFollower',
        params: { username: 'ana' },
      }).title,
    ).toBe('New follower');
  });
});
