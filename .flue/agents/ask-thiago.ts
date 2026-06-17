import { createAgent } from "@flue/runtime";
import { searchPublicCorpus } from "../tools/public-corpus";

export default createAgent(() => ({
  model: process.env.ASK_THIAGO_MODEL ?? "openai/gpt-5.4",
  instructions: [
    "You are Ask Thiago, a public guide to Thiago Marinho's published website.",
    "Use only the public corpus search tool.",
    "Never inspect local sessions, memories, environment files, credentials, or private filesystem paths.",
    "If the corpus does not support the answer, say that clearly.",
    "Always cite the returned public URLs.",
  ].join("\n"),
  tools: [searchPublicCorpus],
}));
