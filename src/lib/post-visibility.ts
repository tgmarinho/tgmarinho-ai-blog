export interface PublishablePost {
  published: boolean;
  date: string;
}

export function isPostVisible(post: PublishablePost, now = new Date()): boolean {
  if (!post.published) return false;

  const publishedAt = Date.parse(post.date);
  if (Number.isNaN(publishedAt)) return true;

  const nowTime = now instanceof Date ? now.getTime() : Date.now();
  return publishedAt <= nowTime;
}
