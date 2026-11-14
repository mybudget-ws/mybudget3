
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const blogFiles = import.meta.glob('../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const parsePost = (filePath, source) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  const frontmatter = match?.[1] || '';
  const content = match?.[2] || source;

  const metadata = Object.fromEntries(
    frontmatter.split(/\r?\n/).map((line) => {
      const [, key, value] = line.match(/^([\w-]+):\s*(.*)$/) || [];

      if (!key) return [];

      return [
        key,
        value.replace(/^(['"])(.*)\1$/, '$2'),
      ];
    }).filter(Boolean),
  );

  const slug = filePath.split('/').pop().replace(/\.md$/, '');

  return {
    ...metadata,
    slug,
    content,
    html: markdown.render(content),
  };
};

const posts = Object.entries(blogFiles)
  .map(([path, source]) => parsePost(path, source))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export const useBlog = () => {
  const getPost = (slug) => {
    return posts.find((post) => post.slug === slug) || null;
  };

  return {
    posts,
    getPost,
  };
};
