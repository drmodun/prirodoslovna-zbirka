import { ExponatResponseShort } from '@biosfera/types';
import { LinkObject } from 'views/admin/dataTables/components/DevelopmentTable';
import {
  CategorizationQuery,
  CreateCategorizationDto,
  CreateExponatDto,
  CreateOrganisationDto,
  ExponatQuery,
  OrganisationQuery,
  RegisterUserDto,
  UpdateCategorizationDto,
  UpdateExponatDto,
  UpdateOrganisationDto,
  UpdateUserDto,
  UserQuery,
} from './dto';

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
    dto: [CreateOrganisationDto, UpdateOrganisationDto, OrganisationQuery],
  },
  users: {
    fields: ['firstName', 'lastName', 'email', 'location'],
    links: [
      {
        label: 'firstName',
        type: 'users',
        link: 'id',
      },
    ],
    dto: [RegisterUserDto, UpdateUserDto, UserQuery],
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
    dto: [CreateExponatDto, UpdateExponatDto, ExponatQuery],
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
    dto: [
      CreateCategorizationDto,
      UpdateCategorizationDto,
      CategorizationQuery,
    ],
  },
};

adminTableMappings.likedPosts = adminTableMappings.posts;
adminTableMappings.favouriteExponats = adminTableMappings.exponats;
adminTableMappings.favouriteOrganisations = adminTableMappings.organisations;
adminTableMappings.members = adminTableMappings.users;
