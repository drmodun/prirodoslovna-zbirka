import {
  ExponatQuery,
  ExponatResponseShort,
  OrganisationQuery,
  UserQuery,
} from '@biosfera/types';
import { LinkObject } from 'views/admin/dataTables/components/DevelopmentTable';

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
    links: LinkObject[];
    dto?: any[];
    query?: any;
    hasApproval?: boolean;
  };
};

export const adminTableMappings: AdminTableMappings = {
  organisations: {
    fields: ['name', 'location', 'exponatCount', 'memberCount'],
    links: [
      {
        label: 'name',
        type: 'organisations',
        link: 'id',
      },
    ],
    hasApproval: true,
    query: {
      location: '',
      name: '',
      attribute: '',
      direction: 'asc',
    },
    //    dto: [CreateOrganisationDto, UpdateOrganisationDto, OrganisationQuery],
  },
  users: {
    fields: ['firstName', 'lastName', "username",  'email', 'location'],
    links: [
      {
        label: 'firstName',
        type: 'users',
        link: 'id',
      },
    ],
    query: {
      name: '',
      email: '',
      location: '',
      organisation: '',
      attribute: '',
      direction: 'asc',
      role: -1,
    },
    //    dto: [RegisterUserDto, UpdateUserDto, UserQuery],
  },
  exponats: {
    fields: ['name', 'alternateName', 'organizationName', 'postCount'],
    links: [
      {
        label: 'name',
        type: 'exponats',
        link: 'id',
      },
      {
        label: 'organizationName',
        type: 'organisations',
        link: 'organizationId',
      },
    ],
    query: {
      name: '',
      alternateName: '',
      organisationId: '',
      minFavoriteCount: -1,
      maxFavoriteCount: -1,
      attribute: '',
      direction: 'asc',
    } as ExponatQuery,
    //    dto: [CreateExponatDto, UpdateExponatDto, ExponatQuery],
  },
  posts: {
    fields: ['title', 'authorName', 'exponatName', 'likeScore'],
    links: [
      {
        label: 'title',
        type: 'posts',
        link: 'id',
      },
      {
        type: 'users',
        label: 'authorName',
        link: 'authorId',
      },
      {
        label: 'exponatName',
        type: 'exponats',
        link: 'exponatId',
      },
    ],
    query: {
      title: '',
      authorId: '',
      exponatId: '',
      attribute: '',
      direction: 'asc',
    },
  },
  categorizations: {
    fields: ['family', 'numberOfExponats'],
    links: [
      {
        label: 'name',
        type: 'categotizations',
        link: 'id',
      },
    ],
    query: {
      genus: '',
      kingdom: '',
      domain: '',
      phylum: '',
      class: '',
      order: '',
      family: '',
      attribute: '',
      direction: 'asc',
    },
    /*    dto: [
      CreateCategorizationDto,
      UpdateCategorizationDto,
      CategorizationQuery,
    ],*/
  },
  'social-posts': {
    fields: ['title', 'organisationName', 'updatedAt'],
    links: [
      {
        label: 'title',
        type: 'socialPosts',
        link: 'id',
      },
      {
        label: 'organisationName',
        type: 'organisations',
        link: 'organisationId',
      },
    ],
    hasApproval: true,
    query: {
      authorId: '',
      title: '',
      attribute: '',
      direction: 'asc',
    },
  },
};

adminTableMappings.likedPosts = adminTableMappings.posts;
adminTableMappings.favouriteExponats = adminTableMappings.exponats;
adminTableMappings.favouriteOrganisations = adminTableMappings.organisations;
adminTableMappings.members = adminTableMappings.users;
