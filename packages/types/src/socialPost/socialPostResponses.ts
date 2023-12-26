export interface ShortSocialPostResponse {
  id: string;
  title: string;
  text: string;
  images: string[];
  organisationId: string;
  organisationName: string;
  organisationMainImage: string;
  createdAt: Date;
  isApproved?: boolean;
  updatedAt: Date;
}
