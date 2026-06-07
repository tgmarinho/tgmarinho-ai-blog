# GitHub repos cleanup — verificar antes de deletar

> Referência pessoal para faxina em github.com/tgmarinho (300 repos, 0 privados, 148 forks).
> Levantamento: 2026-06-07. Lista bruta em `.context/repos-delete-candidates.md`.
>
> **Regra de ouro:** deletar um fork nunca afeta o repositório original — você só perde o clone.
> **Deletar é irreversível** (apaga stars, issues e histórico). Marque `[x]` quando confirmar.
>
> Comando por repo: `gh repo delete tgmarinho/<nome> --yes`

---

## ⚠️ Investigar antes (não deletar ainda)

- [ ] `3d-print-management-system` — peça de portfólio mas está **0 KB** (código não pushado?). Conferir.
- [ ] `english-learning-tools` — é **fork com 35★** (incomum). Verificar se vale manter.

---

## 🟢 Tier A — Forks abandonados, 0★, ≤2023 (deletar sem dó · 93)

- [ ] Meteor-Learning
- [ ] mobile-packages
- [ ] cerebro
- [ ] react-native-tetris
- [ ] word-list
- [ ] spring-boot
- [ ] dotfiles
- [ ] react-dataflow-example
- [ ] ReactNativeUniversal
- [ ] UberExercise
- [ ] mercado-dev
- [ ] task-tool
- [ ] public-apis
- [ ] jobs
- [ ] dev-practice
- [ ] react-pdf
- [ ] pdfjs
- [ ] workflow-reactjs
- [ ] jsPDF-AutoTable
- [ ] javascript-algorithms
- [ ] mattermost-webapp
- [ ] jsPDF
- [ ] JavaScript30
- [ ] pdfmake
- [ ] js-design-patterns
- [ ] keiko-corp
- [ ] Front-End-Checklist
- [ ] Free-Courses
- [ ] react-boilerplate
- [ ] react-admin
- [ ] react-developer-roadmap
- [ ] code-splitting-exercise
- [ ] reveal.js
- [ ] setec
- [ ] meteor-buildpack-horse
- [ ] typeorm
- [ ] ydkjs-exercises
- [ ] dotfiles-1
- [ ] Challenge
- [ ] ZtM-Job-Board
- [ ] website
- [ ] preview-link
- [ ] react-native-plus-web
- [ ] cursonodebr01
- [ ] functional-programming-learning-path
- [ ] spectrum
- [ ] rocketseat-vscode-react-native-snippets
- [ ] rocketseat-bootcamp-challenges
- [ ] react-native-web-monorepo
- [ ] devhub
- [ ] meetapp-mobile
- [ ] join
- [ ] relay-examples
- [ ] node-express-realworld-example-app
- [ ] golden-stack
- [ ] site-rsxp-basic
- [ ] react-bits
- [ ] redux-context-reducers
- [ ] regex-guide
- [ ] matx-react
- [ ] TOVD
- [ ] replacing-redux-to-hooks
- [ ] react-native-firebase
- [ ] react-redux-realworld-example-app
- [ ] mostly-adequate-guide
- [ ] covid19india-react
- [ ] tgmarinho-1
- [ ] expo-boilerplate
- [ ] git-and-github-guide
- [ ] workshop-performance-react
- [ ] nextjs-notion-starter-kit
- [ ] ethereum-frontend
- [ ] tabelataco
- [ ] remote-jobs-brazil
- [ ] nextui
- [ ] eattheblocks
- [ ] noemia
- [ ] tiny-koa-graphql
- [ ] taco-api
- [ ] letswritecode
- [ ] full-stack-web3
- [ ] mdBook
- [ ] portfolio
- [ ] ccsseraphini
- [ ] relay-realworld
- [ ] streamlabs-obs
- [ ] rocketredis
- [ ] react-use
- [ ] breaknews_app
- [ ] relay-workshop
- [ ] codesandbox-template-vite-react
- [ ] react
- [ ] webtorrent

## 🟡 Tier B — Forks com ★ residuais + próprios vazios (deletar · ~53)

### Forks com estrelas (estrela em fork = ruído)
- [ ] covid-19-app (6★)
- [ ] awesome-1 (4★)
- [ ] You-Dont-Know-JS (3★)
- [ ] app-ideas (3★)
- [ ] docker-para-desenvolvedores (2★)
- [ ] virtual-event-starter-kit (2★)
- [ ] Advanced-React (2★)
- [ ] aprenda-frontend (2★)
- [ ] dictionary (1★)
- [ ] soobdoo (1★)
- [ ] robofriends-redux (1★)
- [ ] enegrecer-web (1★)
- [ ] future-web (1★)
- [ ] graphql-example (1★)
- [ ] takenote (1★)
- [ ] nodebestpractices (1★)
- [ ] startbootstrap-sb-admin (1★)
- [ ] react-native-notifier (1★)
- [ ] AdminBSBMaterialDesign (1★)
- [ ] algorithms.js (1★)
- [ ] anki (1★)
- [ ] api-rsxp (1★)
- [ ] awesome-br.github.io (1★)
- [ ] awesome (1★)
- [ ] awesome-algorithms (1★)
- [ ] awesome-nodejs (1★)
- [ ] awesome-mac (1★)
- [ ] awesome-mongodb (1★)
- [ ] awesome-readme (1★)
- [ ] best-practices (1★)
- [ ] bigbluebutton (1★)
- [ ] bibleapi (1★)
- [ ] blockchain-academy (1★)
- [ ] site_renata (1★)
- [ ] swr-firestore (1★)
- [ ] AndEngine (1★)
- [ ] curso-angular-rest-spring-boot-api (1★)
- [ ] whatsapp-web.js (1★)

### Próprios vazios / auto-gerados
- [ ] bot-whatsapp-deb1
- [ ] suspense
- [ ] suspense-react
- [ ] react-suspense-test
- [ ] README
- [ ] robofriend-css-flexbox
- [ ] shoppingList
- [ ] image-gallery-flexbox-css3
- [ ] ai-stuff
- [ ] hr-agent-bondy-clone
- [ ] bonus-typescript
- [ ] background-generate
- [ ] working-with-assets
- [ ] web-fullscreen-api
- [ ] members-new

## 🟠 Tier C — Cursos/bootcamp/exercícios próprios (decisão em lote · ~85)

> Repos de aprendizado (Rocketseat GoStack/OmniStack/NLW, Algaworks, Udemy, playgrounds).
> Não ajudam o perfil profissional; deletar apaga histórico de aprendizado. Decidir tudo-ou-nada.

- [ ] gostack-template-conceitos-react-native-desafio
- [ ] gostack-template-conceitos-reactjs-desafio
- [ ] gostack-template-fundamentos-node-desafio
- [ ] gostack-template-fundamentos-react-native-desafio
- [ ] gostack-template-fundamentos-reactjs-desafio
- [ ] gostack-template-reactjs-crud-desafio
- [ ] gostack-template-typeorm-relations-desafio
- [ ] conceitos-nodejs-desafio
- [ ] try-recoil
- [ ] try-jest
- [ ] intro-react
- [ ] intro-react-native
- [ ] intro-relay-step-by-step
- [ ] proffy
- [ ] rocketshoes
- [ ] rocketfinisher
- [ ] happy-nlw
- [ ] oministack
- [ ] frontend-omnistack
- [ ] mobile-omnistack
- [ ] backend-omnistack
- [ ] next13-app-router
- [ ] next-13-server-components-app-playground
- [ ] next-netlify-starter
- [ ] next-js-daisy
- [ ] smart-brain
- [ ] smart-brain-api
- [ ] twit
- [ ] AlgaMoney
- [ ] Alurinha-CSS-FlexBox
- [ ] 3rd-party-with-react
- [ ] apollo
- [ ] apps-for-android
- [ ] blog-next-firebase
- [ ] bora-ajudar
- [ ] challenge-30-days-of-cedv
- [ ] compromisso
- [ ] cra-hasura-relay
- [ ] curso-bonus-nextjs-rocketseat
- [ ] custom-react-select
- [ ] facebook-auth
- [ ] faceseat
- [ ] firebase-rn-integrated
- [ ] front-react
- [ ] futiba-club
- [ ] future-web-no-grapqhl
- [ ] github-slideshow
- [ ] gobarber-react-native-ts
- [ ] graphql-node-blog
- [ ] ignite-reactjs-conceitos
- [ ] infinite-observer-scroll
- [ ] jest-react-web
- [ ] js-tdd-course-wj
- [ ] markdown-editor-nj
- [ ] movies-app-nextjs-mongodb
- [ ] my-awesome-stars
- [ ] nextjs-youtube-videos-api
- [ ] nft-mkt-krytobirdz
- [ ] nft-project
- [ ] node_basico
- [ ] parcel
- [ ] pg-prisma-storage-vercel
- [ ] primeiro-projeto-react-ts-11
- [ ] projetafacil
- [ ] pwa-push-notification-cra
- [ ] react-hooks
- [ ] react-selector-crypto
- [ ] recipes-codenation
- [ ] relay-starter-kit
- [ ] relay-todo
- [ ] robofriends
- [ ] spring-boot-demo
- [ ] taskbox-storybook-tutorial
- [ ] tests-node
- [ ] titom
- [ ] tsnode
- [ ] tsreact
- [ ] webpack-project
- [ ] wongames-api
- [ ] workflow-reactjs-da2k
- [ ] Goat-Beat-
- [ ] Images
- [ ] LyricsSongs
- [ ] PracticingCSSGrid

## 🔴 NÃO deletar (manter)

- **Portfólio curado:** pi-tg · itop-lgnd · canetaco · tgmarinho-ai-blog · 3d-print-management-system ·
  dale-carnegie-principles · investidor-calc · calc-rentabilidade · members · be-the-hero ·
  gobarber-api · gobarber-api-gostack11 · meetapp · README-ecoleta (223★) · Ecoleta (72★)
- **Forks de estudo de IA (2026, referência ativa):** pi-mono · orca · zed · hermes-agent · dokploy ·
  compozy · openclaude · claude-code-fork · ai-memory · odysseus · agent-skills · stela · pi-tools ·
  monorepo · awesome-agent-harness · learn-harness-engineering
- **Reais/pessoais:** csmpsicologia · cspsicologia-new (sites da esposa) · resume · avivashalom
- **Originais com tração:** authrn (36★) · bootcamp (23★) · react-testes (10★) ·
  gobarber-design-patterns-and-security (10★) · gobarberRN (8★) · nextjs-ssr (5★) · node-ts-path-mapping (5★)
