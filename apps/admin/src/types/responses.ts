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

export type AdminUserResponseShort = {
  id: string;
  name: string;
  email: string;
  role: number;
  organisation: AdminOrganisationResponseShort;
};
    