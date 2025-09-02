import { PostDocument } from 'src/entities/post.entity';
import { PostResponse } from 'src/modules/post/responses/data.response';

export function toPostResponse(post: PostDocument): PostResponse {
  return {
    id: post._id?.toString() ?? '',
    text: post.text ?? '',
    media_urls: post.media_urls ?? [],
    status: post.status,
    created_by: post.created_by?.toString() ?? '',
    platforms: post.platforms?.map((p) => p.toString()) ?? [],
    schedules: post.schedules?.map((s) => s.toString()) ?? [],
    attempts: post.attempts ?? 0,
    lastAttempt_at: post.lastAttempt_at ?? undefined,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
  };
}
