import { getCreatePostRequest, getPostQuery } from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from '@prisma/client';

const _createPostRequest = getCreatePostRequest(ApiProperty);
export class CreatePostDto extends _createPostRequest {}

const _updatePostRequest = getCreatePostRequest(ApiProperty);
export class UpdatePostDto extends _updatePostRequest {}

const _postQuery = getPostQuery(ApiProperty);
export class PostQuery extends _postQuery {}

export type PostSQL = Post & {
  exponatName: string;
  authorName: string;
  organisationName?: string;
  amountOfLikes?: number;
  organisationId?: string;
  hasProfileImage?: boolean;
};
