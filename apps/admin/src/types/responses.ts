import { ExponatResponseShort } from '@biosfera/types';

export enum Role {
  Admin = 'admin',
  User = 'user',
  SuperAdmin = 'superAdmin',
}

export type AdminOrganisationResponseShort = {
  id: string;
  name: string;
  location: string;
  updatedAt: Date;
  exponatCount: number;
  followerCount: number;
  memberCount: number;
  points: number;
};

export type AdminTableMappings = {
  [key: string]: {
    fields: string[];
    links: {
      label: string;
      link: string;
    }[];
  };
};

export const adminTableMappings: AdminTableMappings = {
  organisations: {
    fields: ['name', 'location', 'exponatCount', 'memberCount'],
    links: [
      {
        label: 'name',
        link: 'id',
      },
    ],
  },
  users: {
    fields: ['firstName', 'lastName', 'email', 'location'],
    links: [
      {
        label: 'firstName',
        link: 'id',
      },
    ],
  },
  exponats: {
    fields: ['name', 'alternateName', 'organizationName', 'postCount'],
    links: [
      {
        label: 'name',
        link: 'id',
      },
      {
        label: 'organizationName',
        link: 'organizationId',
      },
    ],
  },
  posts: {
    fields: ['title', 'authorName', 'exponatName', 'likesCount'],
    links: [
      {
        label: 'title',
        link: 'id',
      },
      {
        label: 'authorName',
        link: 'authorId',
      },
      {
        label: 'exponatName',
        link: 'exponatId',
      },
    ],
  },
  categorizations: {
    fields: ['family', 'numberOfExponats'],
    links: [
      {
        label: 'name',
        link: 'id',
      },
    ],
  },
};
