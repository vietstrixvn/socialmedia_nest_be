import { PostDocument } from 'src/entities/post.entity';

export interface CreatePostResponse {
  status: string;
  result: PostDocument;
}
