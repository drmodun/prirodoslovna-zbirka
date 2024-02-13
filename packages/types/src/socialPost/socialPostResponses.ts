export interface ShortSocialPostResponse {
  id: string;
  title: string;
  text: string;
  image: string;
  organisationId: string;
  organisationName: string;
  organisationMainImage: string;
  createdAt: Date;
  isApproved?: boolean;
  updatedAt: Date;
}
