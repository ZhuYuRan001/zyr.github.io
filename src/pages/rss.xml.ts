import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: { site: string }) {
  const posts = await getCollection("blog");
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: "ZYR Blog",
    description: "A personal blog about frontend, design, and life.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}`,
    })),
  });
}
