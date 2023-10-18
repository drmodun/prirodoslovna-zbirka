export interface PostResponse {
  id: string;
  title: string;
  content: string;
  images: string[];
  authorId: string;
  authorName: string;
  approved: boolean;
  authorAvatar: string;
  likeScore: number;
  isLiked?: boolean;
  // add likes and stuff
}

export interface PostApprovalResponse {
  id: string;
  approved: boolean;
}
