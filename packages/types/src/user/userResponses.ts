import {
  ExponatExtendedResponse,
  ExponatResponseShort,
} from "../exponat/exponatResponses";
import { OrganisationResponseShort } from "../organisation/organisationResponses";
import { PostResponse } from "../post/postResponse";

export interface ExtendedUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  followerCount: number;
  followingCount: number;
  location: string;
  //not sure if this is needed here
  likedPosts: PostResponse[];

  createdAt: Date;
  updatedAt: Date;

  posts: PostResponse[];
}

export interface ShortUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role?: number;
  followerCount: number;
  postCount: number;
}
