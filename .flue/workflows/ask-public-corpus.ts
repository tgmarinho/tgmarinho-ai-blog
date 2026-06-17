import { type FlueContext, type WorkflowRouteHandler } from "@flue/runtime";
import * as v from "valibot";
import askThiago from "../agents/ask-thiago";

type Payload = {
  question: string;
  language?: "pt-BR" | "en";
};

export const route: WorkflowRouteHandler = async (_context, next) => next();

export async function run({ init, payload }: FlueContext<Payload>) {
  const harness = await init(askThiago);
  const session = await harness.session();
  const language = payload.language ?? "pt-BR";

  const { data } = await session.prompt(
    [
      `Answer in ${language === "en" ? "plain English" : "Brazilian Portuguese"}.`,
      `Question: ${payload.question}`,
      "Search the public corpus first. Cite public URLs in the answer.",
    ].join("\n"),
    {
      result: v.object({
        answer: v.string(),
        sources: v.array(
          v.object({
            title: v.string(),
            url: v.string(),
          })
        ),
      }),
    }
  );

  return data;
}
