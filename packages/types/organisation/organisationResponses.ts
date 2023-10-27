import { Role } from "../enums";
import { ExponatResponseShort } from "../exponat/exponatResponses";

export interface ExtendedOrganisationResponse {
  id: string;
  name: string;
  email: string;
  description: string;
  location: string;
  websiteUrl: string;
  mainImage: string;
  otherImages: string[];
  createdAt: Date;
  updatedAt: Date;
  followersAmount: number;
  membersAmount: number;
  isFollowing: boolean;
  exponats: ExponatResponseShort[];
  points: number;
}

export interface OrganisationResponseShort {
  id: string;
  name: string;
  location: string;
  websiteUrl: string;
  mainImage: string;
  updatedAt: Date;
  isFollowed?: boolean;
  exponatCount: number;
  followerCount: number;
  memberCount: number;
  points: number;
}
