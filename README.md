# tgmarinho-ai-website

Website pessoal e blog de Thiago Marinho - AI Product Engineer, Full-Stack Developer e criador de conteúdo sobre desenvolvimento de software, AI, blockchain e carreira.

## 📋 Sobre o Projeto

Este é um website moderno construído com Next.js que serve como portfólio pessoal e blog técnico. O site apresenta artigos sobre desenvolvimento de software, inteligência artificial, blockchain, carreira e muito mais.

### Características

- **Blog Técnico**: Mais de 60 artigos sobre desenvolvimento, AI, blockchain e carreira
- **Portfólio**: Apresentação de projetos e experiência profissional
- **Performance**: Otimizado para velocidade e SEO
- **Responsivo**: Design adaptável para todos os dispositivos
- **Busca**: Sistema de busca e filtros por categoria

## 🛠️ Stack Tecnológica

### Core Framework
- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática

### Content Management
- **[Velite](https://velite.js.org/)** - Sistema de gerenciamento de conteúdo baseado em MDX
- **MDX** - Markdown com suporte a componentes React

### Styling
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Framer Motion](https://www.framer.com/motion/)** - Animações fluidas

### UI Components
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis e sem estilo
- **[Lucide React](https://lucide.dev/)** - Ícones modernos
- **[React Icons](https://react-icons.github.io/react-icons/)** - Biblioteca de ícones

### Features
- **[Fuse.js](https://fusejs.io/)** - Busca fuzzy nos posts
- **[Reading Time](https://github.com/ngryman/reading-time)** - Cálculo de tempo de leitura
- **[Rehype Pretty Code](https://rehype-pretty-code.netlify.app/)** - Syntax highlighting
- **[Shiki](https://shiki.matsu.io/)** - Syntax highlighter baseado em TextMate

### Data & Storage
- **[Upstash Redis](https://upstash.com/)** - Cache e armazenamento de dados

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
tgmarinho-ai-website/
├── content/
│   └── posts/          # Posts do blog em formato MDX
├── src/
│   ├── app/            # App Router do Next.js
│   │   ├── blog/       # Páginas do blog
│   │   ├── about/      # Página sobre
│   │   ├── projects/   # Página de projetos
│   │   └── contact/    # Página de contato
│   ├── components/     # Componentes React reutilizáveis
│   │   ├── blog/       # Componentes específicos do blog
│   │   ├── home/       # Componentes da homepage
│   │   └── ui/         # Componentes UI base
│   └── lib/            # Utilitários e helpers
├── public/             # Arquivos estáticos
├── .velite/            # Output gerado pelo Velite
└── velite.config.ts    # Configuração do Velite
```

### Fluxo de Dados

1. **Content Layer (Velite)**
   - Posts MDX em `content/posts/` são processados pelo Velite
   - Validação de schema e transformação em dados tipados
   - Geração de slugs e metadados
   - Output em `.velite/posts.json`

2. **Application Layer (Next.js)**
   - Importação dos posts via `#site/content`
   - Filtragem e ordenação por data
   - Renderização server-side e client-side

3. **Presentation Layer (React)**
   - Componentes reutilizáveis
   - Busca e filtros client-side
   - Animações e interações

### Processamento de Posts

- **Frontmatter**: YAML com metadados (title, description, date, categories, etc.)
- **Body**: Conteúdo MDX com suporte a componentes React
- **Plugins Rehype**:
  - `rehype-slug`: Geração de IDs para headings
  - `rehype-pretty-code`: Syntax highlighting
  - `rehype-autolink-headings`: Links automáticos em headings

## 📝 Blog

### Estrutura dos Posts

Cada post é um arquivo MDX em `content/posts/` com o seguinte formato:

```mdx
---
title: "Título do Post"
description: "Descrição do post"
date: "2024-01-15"
published: true
categories: ["Categoria 1", "Categoria 2"]
image: "/assets/img/image.jpg"
---

Conteúdo do post em MDX...
```

### Funcionalidades do Blog

- **Busca**: Busca fuzzy por título, descrição e categorias
- **Filtros**: Filtro por categorias
- **Ordenação**: Posts ordenados por data (mais recentes primeiro)
- **Syntax Highlighting**: Código com syntax highlighting
- **Reading Time**: Tempo estimado de leitura
- **RSS Feed**: Feed RSS disponível em `/rss.xml`

### Categorias

- Desenvolvimento
- React
- TypeScript
- AI/ML
- Blockchain/Web3
- Carreira
- Mobile
- Database
- E mais...

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+ 
- npm, yarn, pnpm ou bun

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd tgmarinho-ai-website

# Instale as dependências
npm install
# ou
yarn install
# ou
pnpm install
```

### Desenvolvimento

```bash
# Inicia o servidor de desenvolvimento
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

O site estará disponível em [http://localhost:3000](http://localhost:3000)

### Build

```bash
# Gera o build de produção
npm run build
# ou
yarn build
# ou
pnpm build
```

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento (processa Velite + Next.js)
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run velite` - Processa apenas o conteúdo (Velite)
- `npm run lint` - Executa o linter

## 📦 Dependências Principais

### Runtime
- `next` - Framework Next.js
- `react` & `react-dom` - React
- `velite` - Content management
- `fuse.js` - Busca fuzzy
- `reading-time` - Cálculo de tempo de leitura

### Development
- `typescript` - TypeScript
- `tailwindcss` - Tailwind CSS
- `eslint` - Linter

## 🌐 Deploy

O projeto está configurado para deploy na [Vercel](https://vercel.com), mas pode ser deployado em qualquer plataforma que suporte Next.js:

- **Vercel** (recomendado)
- **Netlify**
- **AWS Amplify**
- **Railway**
- **Self-hosted**

### Variáveis de Ambiente

Nenhuma variável de ambiente é necessária para o funcionamento básico. O Redis (Upstash) é opcional para features avançadas.

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Velite Documentation](https://velite.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MDX Documentation](https://mdxjs.com/)

## 📄 Licença

Este projeto é privado e pessoal.

## 👤 Autor

**Thiago Marinho**
- Website: [tgmarinhopro.com](https://tgmarinhopro.com)
- GitHub: [@tgmarinho](https://github.com/tgmarinho)
- Twitter: [@tgmarinho](https://twitter.com/tgmarinho)
- LinkedIn: [Thiago Marinho](https://linkedin.com/in/tgmarinho)

---

Feito com ❤️ usando Next.js, React e TypeScript
