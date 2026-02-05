# tgmarinho-ai-website

Personal website and blog of Thiago Marinho - AI Product Engineer, Full-Stack Developer, and content creator focused on software development, AI, blockchain, and career.

## 📋 About the Project

This is a modern website built with Next.js that serves as a personal portfolio and technical blog. The site features articles about software development, artificial intelligence, blockchain, career, and more.

### Features

- **Technical Blog**: Over 60 articles about development, AI, blockchain, and career
- **Portfolio**: Showcase of projects and professional experience
- **Performance**: Optimized for speed and SEO
- **Responsive**: Adaptive design for all devices
- **Search**: Search system and category filters

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Static typing

### Content Management
- **[Velite](https://velite.js.org/)** - MDX-based content management system
- **MDX** - Markdown with React component support

### Styling
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations

### UI Components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible, unstyled components
- **[Lucide React](https://lucide.dev/)** - Modern icon library
- **[React Icons](https://react-icons.github.io/react-icons/)** - Icon library

### Features
- **[Fuse.js](https://fusejs.io/)** - Fuzzy search for posts
- **[Reading Time](https://github.com/ngryman/reading-time)** - Reading time calculation
- **[Rehype Pretty Code](https://rehype-pretty-code.netlify.app/)** - Syntax highlighting
- **[Shiki](https://shiki.matsu.io/)** - TextMate-based syntax highlighter

### Data & Storage
- **[Upstash Redis](https://upstash.com/)** - Caching and data storage

## 🏗️ Architecture

### Directory Structure

```
tgmarinho-ai-website/
├── content/
│   └── posts/          # Blog posts in MDX format
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── blog/       # Blog pages
│   │   ├── about/      # About page
│   │   ├── projects/   # Projects page
│   │   └── contact/    # Contact page
│   ├── components/     # Reusable React components
│   │   ├── blog/       # Blog-specific components
│   │   ├── home/       # Homepage components
│   │   └── ui/         # Base UI components
│   └── lib/            # Utilities and helpers
├── public/             # Static files
├── .velite/            # Velite generated output
└── velite.config.ts    # Velite configuration
```

### Data Flow

1. **Content Layer (Velite)**
   - MDX posts in `content/posts/` are processed by Velite
   - Schema validation and transformation into typed data
   - Slug and metadata generation
   - Output to `.velite/posts.json`

2. **Application Layer (Next.js)**
   - Posts imported via `#site/content`
   - Filtering and sorting by date
   - Server-side and client-side rendering

3. **Presentation Layer (React)**
   - Reusable components
   - Client-side search and filters
   - Animations and interactions

### Post Processing

- **Frontmatter**: YAML with metadata (title, description, date, categories, etc.)
- **Body**: MDX content with React component support
- **Rehype Plugins**:
  - `rehype-slug`: Heading ID generation
  - `rehype-pretty-code`: Syntax highlighting
  - `rehype-autolink-headings`: Automatic heading links

## 📝 Blog

### Post Structure

Each post is an MDX file in `content/posts/` with the following format:

```mdx
---
title: "Post Title"
description: "Post description"
date: "2024-01-15"
published: true
categories: ["Category 1", "Category 2"]
image: "/assets/img/image.jpg"
---

Post content in MDX...
```

### Blog Features

- **Search**: Fuzzy search by title, description, and categories
- **Filters**: Filter by categories
- **Sorting**: Posts sorted by date (newest first)
- **Syntax Highlighting**: Code with syntax highlighting
- **Reading Time**: Estimated reading time
- **RSS Feed**: RSS feed available at `/rss.xml`

### Categories

- Development
- React
- TypeScript
- AI/ML
- Blockchain/Web3
- Career
- Mobile
- Database
- And more...

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tgmarinho-ai-website

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

The site will be available at [http://localhost:3000](http://localhost:3000)

### Build

```bash
# Generate production build
npm run build
# or
yarn build
# or
pnpm build
```

### Available Scripts

- `npm run dev` - Start development server (processes Velite + Next.js)
- `npm run build` - Generate production build
- `npm run start` - Start production server
- `npm run velite` - Process content only (Velite)
- `npm run lint` - Run linter

## 📦 Main Dependencies

### Runtime
- `next` - Next.js framework
- `react` & `react-dom` - React
- `velite` - Content management
- `fuse.js` - Fuzzy search
- `reading-time` - Reading time calculation

### Development
- `typescript` - TypeScript
- `tailwindcss` - Tailwind CSS
- `eslint` - Linter

## 🌐 Deploy

The project is configured for deployment on [Vercel](https://vercel.com), but can be deployed on any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Railway**
- **Self-hosted**

### Environment Variables

No environment variables are required for basic functionality. Redis (Upstash) is optional for advanced features.

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Velite Documentation](https://velite.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MDX Documentation](https://mdxjs.com/)

## 📄 License

This project is private and personal.

## 👤 Author

**Thiago Marinho**
- Website: [tgmarinhopro.com](https://tgmarinhopro.com)
- GitHub: [@tgmarinho](https://github.com/tgmarinho)
- Twitter: [@tgmarinho](https://twitter.com/tgmarinho)
- LinkedIn: [Thiago Marinho](https://linkedin.com/in/tgmarinho)

---

Made with ❤️ using Next.js, React, and TypeScript
