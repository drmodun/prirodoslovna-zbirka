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
  avatar: string;
  role: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollower: boolean;
  //not sure if this is needed here
  likedPosts: PostResponse[];
  favouriteExponats: ExponatResponseShort[];

  createdAt: Date;
  updatedAt: Date;

  memberOrganisations: OrganisationResponseShort[];

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
