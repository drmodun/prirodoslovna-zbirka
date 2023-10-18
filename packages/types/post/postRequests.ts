export interface CreatePostRequest {
  title: string;
  images: string[];
  //the id of the exponat will be in the url, and the author Id will be in the request headers
}

export interface UpdatePostRequest {
  title?: string;
  images?: string[];
}

export interface setApprovalRequest {
  approved: boolean;
}
