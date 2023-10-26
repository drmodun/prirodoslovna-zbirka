import { Role } from "../enums";
import { ExponatResponseShort } from "../exponat/exponatResponses";

export interface ExtendedOrganisationResponse {
  id: string;
  name: string;
  description: string;
  location: string;
  websiteUrl: string;
  mainImage: string;
  otherImages: string[];
  createdAt: Date;
  updatedAt: Date;
  followersAmount: number;
  isFollowing: boolean;
  role?: Role;
  isFavorite?: boolean;
  favouriteCount: number;
  exponats: ExponatResponseShort[];
}

export interface OrganisationResponseShort {
  id: string;
  name: string;
  location: string;
  websiteUrl: string;
  mainImage: string;
  updatedAt: Date;
  isFavorite?: boolean;
  exponatCount: number;
  points: number;
}
