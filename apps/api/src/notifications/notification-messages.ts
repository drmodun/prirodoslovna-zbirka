import { Language } from '@prisma/client';

export type NotificationParams = Record<string, string>;

type Template = (params: NotificationParams) => string;

interface Message {
  title: Template;
  text?: Template;
}

const ROLE_NAMES: Record<Language, Record<string, string>> = {
  EN: {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
    REQUESTED: 'request (not a member)',
  },
  HR: {
    OWNER: 'vlasnik',
    ADMIN: 'admin',
    MEMBER: 'član',
    REQUESTED: 'zahtjev (nije član)',
  },
};

const roleName = (language: Language, role: string) =>
  ROLE_NAMES[language][role] ?? role.toLowerCase();

// Notifications are stored as a key plus parameters and rendered in each
// reader's language: in the list, on the live stream and in the e-mail.
export const NOTIFICATION_MESSAGES = {
  postApproved: {
    EN: {
      title: () => 'Post update',
      text: (p) => `Your post ${p.title} was approved`,
    },
    HR: {
      title: () => 'Obavijest o objavi',
      text: (p) => `Vaša objava ${p.title} je odobrena`,
    },
  },
  postRejected: {
    EN: {
      title: () => 'Post update',
      text: (p) => `Your post ${p.title} was rejected`,
    },
    HR: {
      title: () => 'Obavijest o objavi',
      text: (p) => `Vaša objava ${p.title} je odbijena`,
    },
  },
  newPost: {
    EN: {
      title: (p) => `New post by ${p.author}: ${p.title}`,
      text: (p) => p.excerpt,
    },
    HR: {
      title: (p) => `Nova objava od korisnika ${p.author}: ${p.title}`,
      text: (p) => p.excerpt,
    },
  },
  newPostRequest: {
    EN: {
      title: () => 'New post request',
      text: (p) => `New request to publish the post ${p.title}`,
    },
    HR: {
      title: () => 'Novi zahtjev za objavu',
      text: (p) => `Novi zahtjev za objavu ${p.title}`,
    },
  },
  newExponatRequest: {
    EN: {
      title: (p) =>
        `The organisation ${p.organisation} got a new request for the exhibit ${p.name}`,
      text: (p) =>
        `New request for the exhibit ${p.name} (${p.alternateName}) of the organisation ${p.organisation}`,
    },
    HR: {
      title: (p) =>
        `Organizacija ${p.organisation} je dobila novi zahtjev za eksponat ${p.name}`,
      text: (p) =>
        `Novi zahtjev za eksponat ${p.name} (${p.alternateName}) organizacije ${p.organisation}`,
    },
  },
  newExponat: {
    EN: {
      title: (p) => `New exhibit from ${p.organisation}`,
      text: (p) =>
        `The organisation ${p.organisation} added the new exhibit ${p.name}`,
    },
    HR: {
      title: (p) => `Novi eksponat organizacije ${p.organisation}`,
      text: (p) =>
        `Organizacija ${p.organisation} je dodala novi eksponat ${p.name}`,
    },
  },
  newFollower: {
    EN: {
      title: () => 'New follower',
      text: (p) => `${p.username} is now following you`,
    },
    HR: {
      title: () => 'Novi pratitelj',
      text: (p) => `Korisnik ${p.username} te sada prati`,
    },
  },
  membershipChange: {
    EN: {
      title: () => 'Membership status changed',
      text: (p) =>
        `Your membership status in the organisation ${p.organisation} was changed to ${roleName('EN', p.role)}`,
    },
    HR: {
      title: () => 'Promjena statusa članstva',
      text: (p) =>
        `Vaš status članstva u organizaciji ${p.organisation} je promijenjen u ${roleName('HR', p.role)}`,
    },
  },
  membershipRequest: {
    EN: {
      title: () => 'Membership request',
      text: (p) =>
        `${p.username} asked to join the organisation ${p.organisation}`,
    },
    HR: {
      title: () => 'Zahtjev za članstvo',
      text: (p) =>
        `Korisnik ${p.username} je poslao zahtjev za članstvo u organizaciji ${p.organisation}`,
    },
  },
  organisationApproved: {
    EN: {
      title: (p) => `The organisation ${p.organisation} was approved`,
      text: (p) => `The organisation ${p.organisation} was approved`,
    },
    HR: {
      title: (p) => `Organizacija ${p.organisation} je odobrena`,
      text: (p) => `Organizacija ${p.organisation} je odobrena`,
    },
  },
  organisationRejected: {
    EN: {
      title: (p) => `The organisation ${p.organisation} was rejected`,
      text: (p) => `The organisation ${p.organisation} was rejected`,
    },
    HR: {
      title: (p) => `Organizacija ${p.organisation} je odbijena`,
      text: (p) => `Organizacija ${p.organisation} je odbijena`,
    },
  },
  newSocialPost: {
    EN: {
      title: (p) => `New announcement from ${p.organisation}`,
      text: (p) => `New announcement from ${p.organisation}: ${p.title}`,
    },
    HR: {
      title: (p) => `Nova najava organizacije ${p.organisation}`,
      text: (p) => `Nova najava organizacije ${p.organisation}: ${p.title}`,
    },
  },
  apiTokenRateLimitWarning: {
    EN: {
      title: (p) => `API token ${p.name} is close to its rate limit`,
      text: (p) =>
        `Your API token ${p.name} made ${p.used} of the ${p.limit} requests it may make in a minute.`,
    },
    HR: {
      title: (p) => `API token ${p.name} se približava ograničenju`,
      text: (p) =>
        `Vaš API token ${p.name} poslao je ${p.used} od ${p.limit} zahtjeva koje smije poslati u minuti.`,
    },
  },
  apiTokenRateLimitReached: {
    EN: {
      title: (p) => `API token ${p.name} reached its rate limit`,
      text: (p) =>
        `Your API token ${p.name} made all ${p.limit} requests it may make in a minute. Further requests in that minute were refused.`,
    },
    HR: {
      title: (p) => `API token ${p.name} dosegnuo je ograničenje`,
      text: (p) =>
        `Vaš API token ${p.name} poslao je svih ${p.limit} zahtjeva koje smije poslati u minuti. Daljnji zahtjevi u toj minuti su odbijeni.`,
    },
  },
} satisfies Record<string, Record<Language, Message>>;

export type NotificationMessageKey = keyof typeof NOTIFICATION_MESSAGES;

export const isNotificationMessageKey = (
  key: unknown,
): key is NotificationMessageKey =>
  typeof key === 'string' && key in NOTIFICATION_MESSAGES;

export const renderNotificationMessage = (
  key: NotificationMessageKey,
  params: NotificationParams,
  language: Language = 'EN',
) => {
  const message: Message = NOTIFICATION_MESSAGES[key][language];
  return { title: message.title(params), text: message.text?.(params) ?? '' };
};

interface StoredNotification {
  title: string;
  text?: string | null;
  messageKey?: string | null;
  params?: unknown;
}

// A stored notification with its title and text in the reader's language.
// Rows without a known key keep the text they were stored with.
export const localiseNotification = <T extends StoredNotification>(
  notification: T,
  language: Language = 'EN',
): T => {
  if (!isNotificationMessageKey(notification.messageKey)) return notification;
  return {
    ...notification,
    ...renderNotificationMessage(
      notification.messageKey,
      (notification.params ?? {}) as NotificationParams,
      language,
    ),
  };
};
