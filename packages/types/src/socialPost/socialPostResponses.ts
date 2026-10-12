import { SocialPostTypeEnumType } from "../enums";
import { AuthorshipInfo } from "../authorshipInfo/responses";
export interface ShortSocialPostResponse {
  id: string;
  title: string;
  text: string;
  type: SocialPostTypeEnumType;
  images: string[];
  organisationId: string;
  organisationName: string;
  organisationMainImage: string;
  authorshipInfoId: string;
  authorhipInfo?: AuthorshipInfo;
  createdAt: Date;
  isApproved?: boolean;
  updatedAt: Date;
}
