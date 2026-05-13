#!/usr/bin/env node
// Narra um daily-journal markdown bruto numa entrada de diário (PT-BR ou EN)
// usando o CLI `claude` (sem precisar de ANTHROPIC_API_KEY).
// Uso: node scripts/journal-narrate.mjs --in <path> [--out <path>] [--lang pt-BR|en]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import process from "node:process";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--in") args.in = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--lang") args.lang = argv[++i];
  }
  return args;
}

function loadDotEnvLocal() {
  const path = ".env.local";
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function extractDate(md) {
  const m = md.match(/^#\s*Daily work\s*—\s*(\d{4}-\d{2}-\d{2})/m);
  return m ? m[1] : new Date().toISOString().slice(0, 10);
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.in) {
    console.error("Erro: --in <path-markdown-bruto> é obrigatório.");
    process.exit(1);
  }
  if (!existsSync(args.in)) {
    console.error(`Erro: arquivo não encontrado: ${args.in}`);
    process.exit(1);
  }

  loadDotEnvLocal();

  const raw = readFileSync(args.in, "utf8");
  const date = extractDate(raw);
  const lang = args.lang === "en" ? "en" : "pt-BR";

  const ptPrompt = [
    "Você é um redator que transforma logs de trabalho de desenvolvedor em uma entrada de diário em PT-BR.",
    "Receberá um markdown bruto com seções por repositório, contendo prompts (intenções) e commits do dia.",
    "",
    "Responda APENAS com o seguinte formato exato, sem comentários adicionais:",
    "",
    "TITLE: <título curto, máx 70 caracteres, sem aspas, sem markdown>",
    "SUMMARY: <resumo de uma linha, máx 200 caracteres, sem aspas, sem markdown>",
    "---BODY---",
    "<corpo do diário em markdown>",
    "",
    "Regras do corpo:",
    "- Idioma: PT-BR.",
    "- Tom: 1ª pessoa, reflexivo e motivacional, build-in-public.",
    "- Tamanho: ~180-250 palavras.",
    "- Destaque progresso real por repositório (use sub-headings ### se ajudar).",
    "- Foque no que avançou de verdade, sem inventar fatos não presentes no log.",
    "- Não inclua frontmatter, hashtags ou seções 'LinkedIn' / 'Thread'.",
    "",
    "REGRA CRÍTICA DE PRIVACIDADE — este texto é PÚBLICO no blog. NUNCA inclua:",
    "- Candidaturas a vagas, nomes de empresas para as quais o autor se candidatou, cover letters, currículos, salários, entrevistas.",
    "- Informação financeira pessoal, saúde, família, relacionamentos, localização específica.",
    "- Credenciais, tokens, IDs internos, nomes de clientes privados, dados de terceiros.",
    "- Bugs sensíveis de segurança ainda não divulgados publicamente.",
    "- QUALQUER pessoa física: familiares (irmã, mãe, pai, esposa, namorada, filho, filha, etc.),",
    "  amigos, colegas, parceiros — mesmo sem nome. Fale apenas de projetos, repos, PRs, commits,",
    "  features e código. Se um log mencionar alguém, omita essa menção completamente.",
    "Se o log contiver qualquer um desses temas, OMITA por completo — não mencione nem de forma vaga.",
  ].join("\n");

  const enPrompt = [
    "You are a writer turning a developer's work log into a journal entry in English (US).",
    "You will receive a raw markdown with sections per repository, containing prompts (intent) and commits of the day.",
    "",
    "Respond ONLY with this exact format, no extra commentary:",
    "",
    "TITLE: <short title, max 70 chars, no quotes, no markdown>",
    "SUMMARY: <one-line summary, max 200 chars, no quotes, no markdown>",
    "---BODY---",
    "<journal body in markdown>",
    "",
    "Body rules:",
    "- Language: English (US).",
    "- Voice: first person, reflective, build-in-public.",
    "- Length: ~180-250 words.",
    "- Highlight real progress per repository (use ### sub-headings if helpful).",
    "- Stick to facts present in the log; do not invent.",
    "- Do not include frontmatter, hashtags, or 'LinkedIn' / 'Thread' sections.",
    "",
    "CRITICAL PRIVACY RULE — this text is PUBLIC on the blog. NEVER include:",
    "- Job applications, company names the author applied to, cover letters, resumes, salaries, interviews.",
    "- Personal financial info, health, family, relationships, specific location.",
    "- Credentials, tokens, internal IDs, private client names, third-party data.",
    "- Undisclosed security bugs.",
    "- ANY individual person: family (sister, mother, father, wife, girlfriend, son, daughter, etc.),",
    "  friends, coworkers, partners — even unnamed. Talk only about projects, repos, PRs, commits,",
    "  features and code. If the log mentions anyone, omit that mention entirely.",
    "If the log contains any such topic, OMIT it entirely — do not even mention it vaguely.",
  ].join("\n");

  const systemPrompt = lang === "en" ? enPrompt : ptPrompt;
  const userIntro = lang === "en"
    ? `Here is the raw log for ${date}.`
    : `Aqui está o log bruto do dia ${date}.`;
  const userMsg = `${systemPrompt}\n\n---\n\n${userIntro}\n\n---\n\n${raw}`;

  const claudeBin = process.env.CLAUDE_BIN || "claude";
  const proc = spawnSync(
    claudeBin,
    ["-p", userMsg, "--model", "claude-opus-4-7"],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );

  if (proc.error) {
    console.error(`Erro ao executar '${claudeBin}': ${proc.error.message}`);
    process.exit(1);
  }
  if (proc.status !== 0) {
    console.error(`'${claudeBin}' saiu com status ${proc.status}: ${(proc.stderr || "").slice(0, 500)}`);
    process.exit(1);
  }

  const text = (proc.stdout || "").trim();
  if (!text) {
    console.error("Resposta vazia do CLI claude.");
    process.exit(1);
  }

  const titleMatch = text.match(/^TITLE:\s*(.+?)\s*$/m);
  const summaryMatch = text.match(/^SUMMARY:\s*(.+?)\s*$/m);
  const bodyMatch = text.split(/^---BODY---\s*$/m);

  const fallbackTitle = lang === "en" ? `Journal — ${date}` : `Diário — ${date}`;
  const fallbackSummary = lang === "en" ? `Notes from ${date}.` : `Anotações de ${date}.`;
  const title = (titleMatch?.[1] ?? fallbackTitle).replace(/"/g, "'").slice(0, 70);
  const summary = (summaryMatch?.[1] ?? fallbackSummary).replace(/"/g, "'").slice(0, 200);
  const body = (bodyMatch[1] ?? text).trim();

  const output =
    `---\n` +
    `title: "${title}"\n` +
    `summary: "${summary}"\n` +
    `date: ${date}\n` +
    `language: ${lang}\n` +
    `---\n\n${body}\n`;

  if (args.out) {
    writeFileSync(args.out, output, "utf8");
  } else {
    process.stdout.write(output);
  }
}

main();
