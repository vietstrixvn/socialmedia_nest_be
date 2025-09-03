import { PostDocument } from 'src/entities/post.entity';
import {
  PostResponse,
  PublishStatus,
} from 'src/modules/post/responses/data.response';

export function toPostResponse(post: PostDocument): PostResponse {
  const publishResults =
    post.publishResults?.map((r) => ({
      platform: r.platform.toString(),
      status: r.status,
      publishedAt: r.publishedAt,
      platformPostId: r.platformPostId,
      errorMessage: r.errorMessage,
      errorCode: r.errorCode,
      retryCount: r.retryCount ?? 0, // fix undefined
      lastRetryAt: r.lastRetryAt,
    })) ?? [];

  const successCount = publishResults.filter(
    (r) => r.status === PublishStatus.SUCCESS,
  ).length;

  const failedCount = publishResults.filter(
    (r) => r.status === PublishStatus.FAILED,
  ).length;

  const pendingCount = publishResults.filter(
    (r) => r.status === PublishStatus.PENDING,
  ).length;

  const countAll = publishResults.length;

  return {
    id: post._id?.toString() ?? '',
    text: post.text ?? '',
    media_urls: post.media_urls ?? [],
    status: post.status,
    created_by: post.created_by?.toString() ?? '',
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    publishResults,
    successCount,
    failedCount,
    pendingCount,
    countAll,
  };
}
