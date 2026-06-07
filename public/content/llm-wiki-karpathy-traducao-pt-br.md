# LLM Wiki

> **Tradução** do texto "LLM Wiki" de Andrej Karpathy.
>
> Original: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
>
> Anúncio original (X): https://x.com/karpathy/status/2039805659525644595
>
> Cobertura: VentureBeat, "Karpathy shares 'LLM Knowledge Base' architecture that bypasses RAG": https://venturebeat.com/data/karpathy-shares-llm-knowledge-base-architecture-that-bypasses-rag-with-an
>
> Leitura e implementações relacionadas:
> - Fabio Akita, "Memória de Agentes, Karpathy LLM Wiki e AgentMemory": https://akitaonrails.com/2026/05/18/memoria-agentes-karpathy-llm-wiki-agentmemory/
> - Fabio Akita, "Criei um sistema de memória para agentes de código: ai-memory": https://akitaonrails.com/2026/05/23/criei-sistema-memoria-agentes-codigo-ai-memory/
> - `agentmemory` (rohitg00): https://github.com/rohitg00/agentmemory
> - `ai-memory` (akitaonrails), sucessor em Rust: https://github.com/akitaonrails/ai-memory

Um padrão para construir bases de conhecimento pessoais usando LLMs.

Este é um arquivo de ideia, feito para ser copiado e colado no seu próprio agente de LLM (por exemplo, OpenAI Codex, Claude Code, OpenCode / Pi etc.). O objetivo é comunicar a ideia em alto nível, mas o seu agente vai construir os detalhes em colaboração com você.

## A ideia central

A experiência da maioria das pessoas com LLMs e documentos se parece com RAG: você sobe uma coleção de arquivos, a LLM recupera trechos relevantes no momento da pergunta e gera uma resposta. Isso funciona, mas a LLM está redescobrindo o conhecimento do zero a cada pergunta. Não há acúmulo. Faça uma pergunta sutil que exige sintetizar cinco documentos, e a LLM precisa encontrar e juntar os fragmentos relevantes toda vez. Nada é construído de forma cumulativa. NotebookLM, upload de arquivos no ChatGPT e a maioria dos sistemas de RAG funcionam assim.

A ideia aqui é diferente. Em vez de apenas recuperar dos documentos brutos no momento da pergunta, a LLM constrói e mantém de forma incremental uma wiki persistente: uma coleção estruturada e interligada de arquivos markdown que fica entre você e as fontes brutas. Quando você adiciona uma nova fonte, a LLM não se limita a indexá-la para recuperação futura. Ela lê a fonte, extrai a informação principal e a integra à wiki existente, atualizando páginas de entidades, revisando resumos de tópicos, anotando onde dados novos contradizem afirmações antigas, reforçando ou questionando a síntese em evolução. O conhecimento é compilado uma vez e mantido atualizado, não rederivado a cada consulta.

Essa é a diferença central: a wiki é um artefato persistente e cumulativo. As referências cruzadas já estão lá. As contradições já foram sinalizadas. A síntese já reflete tudo o que você leu. A wiki fica mais rica a cada fonte que você adiciona e a cada pergunta que você faz.

Você nunca (ou raramente) escreve a wiki você mesmo: a LLM escreve e mantém tudo. Você é responsável pela curadoria de fontes, pela exploração e por fazer as perguntas certas. A LLM faz todo o trabalho braçal: resumir, cruzar referências, arquivar e a contabilidade que torna uma base de conhecimento realmente útil ao longo do tempo. Na prática, eu deixo o agente de LLM aberto de um lado e o Obsidian do outro. A LLM faz as edições com base na nossa conversa, e eu navego pelos resultados em tempo real, seguindo links, conferindo a visão de grafo, lendo as páginas atualizadas. O Obsidian é a IDE; a LLM é a programadora; a wiki é o código-fonte.

Isso se aplica a muitos contextos diferentes. Alguns exemplos:

**Pessoal:** acompanhar seus próprios objetivos, saúde, psicologia, autoaperfeiçoamento, arquivando entradas de diário, artigos, notas de podcast, e construindo uma imagem estruturada de si mesmo ao longo do tempo.

**Pesquisa:** se aprofundar em um tópico por semanas ou meses, lendo papers, artigos, relatórios, e construindo de forma incremental uma wiki abrangente com uma tese em evolução.

**Lendo um livro:** arquivando cada capítulo à medida que avança, criando páginas para personagens, temas, fios da trama, e como tudo se conecta. Ao final, você tem uma rica wiki companheira. Pense em fan wikis como o Tolkien Gateway: milhares de páginas interligadas cobrindo personagens, lugares, eventos, idiomas, construídas por uma comunidade de voluntários ao longo de anos. Você poderia construir algo assim de forma pessoal enquanto lê, com a LLM cuidando de todas as referências cruzadas e da manutenção.

**Negócios/equipe:** uma wiki interna mantida por LLMs, alimentada por threads do Slack, transcrições de reuniões, documentos de projeto, ligações com clientes. Possivelmente com humanos no circuito revisando as atualizações. A wiki se mantém atualizada porque a LLM faz a manutenção que ninguém na equipe quer fazer.

**Análise competitiva, due diligence, planejamento de viagem, notas de curso, mergulhos em hobbies:** qualquer coisa em que você esteja acumulando conhecimento ao longo do tempo e queira ter tudo organizado em vez de espalhado.

## Arquitetura

São três camadas:

**Fontes brutas:** sua coleção curada de documentos de origem. Artigos, papers, imagens, arquivos de dados. São imutáveis: a LLM lê deles, mas nunca os modifica. Esta é a sua fonte da verdade.

**A wiki:** um diretório de arquivos markdown gerados pela LLM. Resumos, páginas de entidades, páginas de conceitos, comparações, uma visão geral, uma síntese. A LLM é dona total dessa camada. Ela cria páginas, atualiza quando chegam novas fontes, mantém as referências cruzadas e mantém tudo consistente. Você lê; a LLM escreve.

**O schema:** um documento (por exemplo, `CLAUDE.md` para o Claude Code ou `AGENTS.md` para o Codex) que diz à LLM como a wiki está estruturada, quais são as convenções e quais fluxos seguir ao ingerir fontes, responder perguntas ou manter a wiki. Este é o arquivo de configuração central: é o que faz da LLM uma mantenedora disciplinada da wiki em vez de um chatbot genérico. Você e a LLM coevoluem esse documento ao longo do tempo, conforme descobrem o que funciona para o seu domínio.

## Operações

**Ingestão.** Você coloca uma nova fonte na coleção bruta e pede à LLM para processá-la. Um fluxo de exemplo: a LLM lê a fonte, discute os pontos principais com você, escreve uma página de resumo na wiki, atualiza o índice, atualiza páginas relevantes de entidades e conceitos pela wiki, e acrescenta uma entrada ao log. Uma única fonte pode tocar de 10 a 15 páginas da wiki. Pessoalmente, prefiro ingerir as fontes uma de cada vez e permanecer envolvido: leio os resumos, confiro as atualizações e oriento a LLM sobre o que enfatizar. Mas você também pode ingerir muitas fontes em lote com menos supervisão. Cabe a você desenvolver o fluxo que combina com o seu estilo e documentá-lo no schema para sessões futuras.

**Consulta.** Você faz perguntas à wiki. A LLM busca as páginas relevantes, lê e sintetiza uma resposta com citações. As respostas podem assumir formas diferentes dependendo da pergunta: uma página markdown, uma tabela comparativa, uma apresentação de slides (Marp), um gráfico (matplotlib), um canvas. O insight importante: boas respostas podem ser arquivadas de volta na wiki como novas páginas. Uma comparação que você pediu, uma análise, uma conexão que você descobriu, isso é valioso e não deveria sumir no histórico do chat. Assim, suas explorações se acumulam na base de conhecimento, exatamente como as fontes ingeridas.

**Lint.** Periodicamente, peça à LLM para fazer um check-up de saúde da wiki. Procure por: contradições entre páginas, afirmações desatualizadas que fontes mais novas já superaram, páginas órfãs sem links de entrada, conceitos importantes mencionados, mas sem página própria, referências cruzadas faltando, lacunas de dados que poderiam ser preenchidas com uma busca na web. A LLM é boa em sugerir novas perguntas a investigar e novas fontes a procurar. Isso mantém a wiki saudável à medida que cresce.

## Indexação e log

Dois arquivos especiais ajudam a LLM (e você) a navegar pela wiki conforme ela cresce. Eles têm propósitos diferentes:

`index.md` é orientado a conteúdo. É um catálogo de tudo o que há na wiki: cada página listada com um link, um resumo de uma linha e, opcionalmente, metadados como data ou contagem de fontes. Organizado por categoria (entidades, conceitos, fontes etc.). A LLM o atualiza a cada ingestão. Ao responder uma consulta, a LLM lê o índice primeiro para encontrar as páginas relevantes e depois se aprofunda nelas. Isso funciona surpreendentemente bem em escala moderada (cerca de 100 fontes, algumas centenas de páginas) e evita a necessidade de uma infraestrutura de RAG baseada em embeddings.

`log.md` é cronológico. É um registro do tipo append-only do que aconteceu e quando: ingestões, consultas, passagens de lint. Uma dica útil: se cada entrada começa com um prefixo consistente (por exemplo, `## [2026-04-02] ingest | Título do Artigo`), o log se torna processável com ferramentas unix simples. `grep "^## \[" log.md | tail -5` te dá as últimas 5 entradas. O log te dá uma linha do tempo da evolução da wiki e ajuda a LLM a entender o que foi feito recentemente.

## Opcional: ferramentas de CLI

Em algum momento, você pode querer construir pequenas ferramentas que ajudem a LLM a operar a wiki de forma mais eficiente. Um motor de busca sobre as páginas da wiki é a mais óbvia. Em pequena escala, o arquivo de índice basta, mas conforme a wiki cresce você vai querer uma busca de verdade. O `qmd` é uma boa opção: é um motor de busca local para arquivos markdown com busca híbrida BM25/vetorial e re-ranking por LLM, tudo no próprio dispositivo. Ele tem tanto uma CLI (para a LLM acioná-lo via shell) quanto um servidor MCP (para a LLM usá-lo como ferramenta nativa). Você também poderia construir algo mais simples por conta própria: a LLM pode te ajudar a fazer um script de busca ingênuo conforme a necessidade surgir.

## Dicas e truques

O **Obsidian Web Clipper** é uma extensão de navegador que converte artigos da web em markdown. Muito útil para colocar fontes rapidamente na sua coleção bruta.

**Baixe as imagens localmente.** No Obsidian, em Settings → Files and links, defina "Attachment folder path" para um diretório fixo (por exemplo, `raw/assets/`). Depois, em Settings → Hotkeys, busque por "Download" para encontrar "Download attachments for current file" e associe a um atalho (por exemplo, Ctrl+Shift+D). Depois de clipar um artigo, aperte o atalho e todas as imagens são baixadas para o disco local. Isso é opcional, mas útil: permite que a LLM veja e referencie as imagens diretamente, em vez de depender de URLs que podem quebrar. Note que as LLMs não conseguem ler nativamente markdown com imagens inline de uma só vez. A solução é a LLM ler o texto primeiro e depois visualizar algumas ou todas as imagens referenciadas separadamente para ganhar contexto adicional. É um pouco desajeitado, mas funciona bem o suficiente.

A **visão de grafo** do Obsidian é a melhor forma de ver o formato da sua wiki: o que está conectado a quê, quais páginas são hubs, quais são órfãs.

O **Marp** é um formato de apresentação de slides baseado em markdown. O Obsidian tem um plugin para ele. Útil para gerar apresentações diretamente do conteúdo da wiki.

O **Dataview** é um plugin do Obsidian que roda consultas sobre o frontmatter das páginas. Se a sua LLM adicionar frontmatter YAML às páginas da wiki (tags, datas, contagem de fontes), o Dataview consegue gerar tabelas e listas dinâmicas.

A wiki é apenas um repositório git de arquivos markdown. Você ganha histórico de versões, branches e colaboração de graça.

## Por que isso funciona

A parte tediosa de manter uma base de conhecimento não é a leitura nem o raciocínio: é a contabilidade. Atualizar referências cruzadas, manter os resumos em dia, anotar quando dados novos contradizem afirmações antigas, manter a consistência entre dezenas de páginas. Os humanos abandonam wikis porque a carga de manutenção cresce mais rápido que o valor. As LLMs não ficam entediadas, não esquecem de atualizar uma referência cruzada e conseguem tocar 15 arquivos numa só passagem. A wiki se mantém porque o custo da manutenção é quase zero.

O trabalho do humano é curar fontes, direcionar a análise, fazer boas perguntas e pensar sobre o que tudo isso significa. O trabalho da LLM é todo o resto.

A ideia está relacionada, em espírito, ao Memex de Vannevar Bush (1945): um repositório de conhecimento pessoal e curado, com trilhas associativas entre documentos. A visão de Bush estava mais perto disso do que daquilo que a web acabou se tornando: privada, ativamente curada, com as conexões entre documentos tão valiosas quanto os próprios documentos. A parte que ele não conseguiu resolver foi quem faz a manutenção. A LLM cuida disso.

## Nota

Este documento é intencionalmente abstrato. Ele descreve a ideia, não uma implementação específica. A estrutura exata de diretórios, as convenções do schema, os formatos de página, as ferramentas: tudo isso vai depender do seu domínio, das suas preferências e da LLM que você escolher. Tudo o que foi mencionado acima é opcional e modular. Pegue o que for útil, ignore o que não for. Por exemplo: suas fontes podem ser só texto, então você não precisa de tratamento de imagens nenhum. Sua wiki pode ser pequena o bastante para que o arquivo de índice baste, sem precisar de motor de busca. Você pode não se importar com slides e querer só páginas markdown. Você pode querer um conjunto completamente diferente de formatos de saída. A forma certa de usar isto é compartilhar com o seu agente de LLM e trabalharem juntos para criar uma versão que se ajuste às suas necessidades. A única função deste documento é comunicar o padrão. Sua LLM descobre o resto.
