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
  bio: string;
  followerCount: number;
  followingCount: number;
  location: string;
  //TODO: Update this thing
  likedPosts: PostResponse[];
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  hasProfileImage: boolean;
  posts: PostResponse[];
  //organisations: the organisations the user is a member of
  //maybe add liked exponats or something
}

export interface ShortUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: boolean;
  role?: string;
  followerCount: number;
  postCount: number;
}
