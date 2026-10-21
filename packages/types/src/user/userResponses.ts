import {
  SavedLiteratureResponse,
  WorkResponseShort,
} from "../works/workResponses";
import { ExponatResponseShort } from "../exponat/exponatResponses";
import { OrganisationResponseShort } from "../organisation/organisationResponses";
import { PostResponse } from "../post/postResponse";
import { Language } from "../enums";

export interface ExtendedUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  // Present for the user themself and for super users.
  email?: string;
  role?: string;
  // Present only on the user's own profile.
  language?: Language;
  bio: string;
  followerCount: number;
  username: string;
  followingCount: number;
  location: string;
  likedPosts: PostResponse[];
  likeCount: number;
  savedLiterature: SavedLiteratureResponse[];
  createdAt: Date;
  updatedAt: Date;
  hasProfileImage: boolean;
  posts: PostResponse[];
  works: WorkResponseShort[];
  savedWorks: WorkResponseShort[];
  favouriteExponats: ExponatResponseShort[];
  memberships: OrganisationResponseShort[];
}

export interface ShortUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  // Only on responses meant for the user themself or organisation admins.
  email?: string;
  avatar?: boolean;
  role?: string;
  followerCount: number;
  postCount: number;
  username: string;
}
