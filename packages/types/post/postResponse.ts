export interface PostResponse {
  id: string;
  title: string;
  images: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  likeScore: number;
  exponatId: string;
  exponatName: string;
  // add likes and stuff
}

export interface PostApprovalResponse {
  id: string;
  approved: boolean;
}
