export interface ShortSocialPostResponse {
  id: string;
  title: string;
  text: string;
  images: string[];
  isApproved: boolean;
  organisationId: string;
  organisationName: string;
  organisationMainImage: string;
  createdAt: Date;
  updatedAt: Date;
}
