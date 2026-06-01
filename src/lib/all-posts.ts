import { posts, interactivePosts, type Post, type InteractivePost } from "#site/content";

/**
 * Unified list of blog posts across both collections:
 * - `posts` (markdown body, compiled to HTML)
 * - `interactivePosts` (MDX body with embedded React components)
 *
 * Consumers (page, sitemap, RSS) should prefer this list and stay agnostic
 * to which collection a post belongs to. `MdxContent` auto-detects the body
 * format (HTML vs compiled MDX) at render time.
 */
export type AnyPost = Post | InteractivePost;

export const allPosts: AnyPost[] = [...posts, ...interactivePosts];
