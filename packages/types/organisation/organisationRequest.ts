import { County } from "../enums";

export interface CreateOrganisationRequest {
  name: string;
  description: string;
  location: County;
  websiteUrl: string;
  mainImage: string;
  otherImages: string[];
}

export interface UpdateOrganisationRequest {
  name?: string;
  description?: string;
  location?: County;
  websiteUrl?: string;
  mainImage?: string;
  otherImages?: string[];
}
