// Helper to access Velite-generated data
// Posts are imported from the velite output directory

export function sortPostsByDate<T extends { date: string; published: boolean }>(
  posts: T[]
): T[] {
  return posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllCategories(
  posts: Array<{ categories: string[]; published: boolean }>
): string[] {
  const categories = new Set<string>();
  posts
    .filter((p) => p.published)
    .forEach((post) =>
      post.categories.forEach((cat) => categories.add(cat))
    );
  return Array.from(categories).sort();
}
