export interface PostResponse {
  id: string;
  title: string;
  images: string[];
  authorId: string;
  authorName: string;
  likeScore: number;
  exponatId: string;
  exponatName: string;
  updatedAt: Date;
  hasProfilePicture: boolean;
  // add likes and stuff
  //author profile picutre is supposed ti be findable by authorId
}

export interface PostApprovalResponse {
  id: string;
  approved: boolean;
}

export interface PostResponseExtended{  
   
}

