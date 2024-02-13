export interface PostResponse {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  likeScore: number;
  exponatId: string;
  exponatName: string;
  updatedAt: Date;
  thumbnail: string;
  hasProfilePicture: boolean;
  // add likes and stuff
  //author profile picutre is supposed ti be findable by authorId
}

export interface PostApprovalResponse {
  id: string;
  approved: boolean;
}

export interface PostResponseExtended {
  id: string;
  title: string;
  image: string;
  authorId: string;
  authorName: string;
  likeScore: number;
  exponatId: string;
  exponatName: string;
  updatedAt: Date;
  content: string;
}
