import { getCreatePostRequest } from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';

const _createPostRequest = getCreatePostRequest(ApiProperty);
export class CreatePostRequest extends _createPostRequest {}

const _updatePostRequest = getCreatePostRequest(ApiProperty);
export class UpdatePostRequest extends _updatePostRequest {}
