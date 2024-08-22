import { ShortUserResponse } from "../user/userResponses";
import { Role } from "../enums";
import { ExponatResponseShort } from "../exponat/exponatResponses";
import { ShortSocialPostResponse } from "../socialPost/socialPostResponses";
import { PostResponse } from "../post/postResponse";
export interface ExtendedOrganisationResponse {
  id: string;
  name: string;
  email: string;
  description: string;
  location: string;
  websiteUrl: string;
  mainImage: string;
  createdAt: Date;
  updatedAt: Date;
  followersAmount: number;
  membersAmount: number;
  members: ShortUserResponse[];
  exponats: ExponatResponseShort[];
  points: number;
  posts: PostResponse[];
  socialPosts?: ShortSocialPostResponse[];
}

export interface OrganisationResponseShort {
  id: string;
  name: string;
  location: string;
  websiteUrl: string;
  mainImage: string;
  updatedAt: Date;
  exponatCount: number;
  followerCount: number;
  memberCount: number;
  points: number;
  description?: string;
  isApproved?: boolean;
  role?: string;
}
