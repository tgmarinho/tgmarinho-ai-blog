"use client";

import { useTranslations } from "next-intl";
import { RagOverviewLab, type RagLabMessages } from "./rag-overview-lab";

/**
 * MDX-friendly wrapper that reads strings from the `ragLab` next-intl namespace.
 * Use this directly in MDX: `<RagOverviewLab />` (no props required).
 */
export function RagOverviewLabAuto() {
  const t = useTranslations("ragLab");

  const messages: RagLabMessages = {
    tabs: {
      flow: t("tabs.flow"),
      cosine: t("tabs.cosine"),
      hnsw: t("tabs.hnsw"),
      chunking: t("tabs.chunking"),
    },
    flow: {
      title: t("flow.title"),
      subtitle: t("flow.subtitle"),
      offline: t("flow.offline"),
      online: t("flow.online"),
      question: t("flow.question"),
      parallel: t("flow.parallel"),
      chunks: t("flow.chunks"),
      fire: t("flow.fire"),
      reingest: t("flow.reingest"),
      autoplay: t("flow.autoplay"),
      speed: t("flow.speed"),
      points: t("flow.points"),
      answer: t("flow.answer"),
      nodes: {
        docs: t("flow.nodes.docs"),
        docling: t("flow.nodes.docling"),
        chunker: t("flow.nodes.chunker"),
        meta: t("flow.nodes.meta"),
        embOff: t("flow.nodes.embOff"),
        qdrant: t("flow.nodes.qdrant"),
        user: t("flow.nodes.user"),
        embOn: t("flow.nodes.embOn"),
        search: t("flow.nodes.search"),
        ctx: t("flow.nodes.ctx"),
        llm: t("flow.nodes.llm"),
        answer: t("flow.nodes.answer"),
      },
      descs: {
        docs: t("flow.descs.docs"),
        docling: t("flow.descs.docling"),
        chunker: t("flow.descs.chunker"),
        meta: t("flow.descs.meta"),
        embOff: t("flow.descs.embOff"),
        qdrant: t("flow.descs.qdrant"),
        user: t("flow.descs.user"),
        embOn: t("flow.descs.embOn"),
        search: t("flow.descs.search"),
        ctx: t("flow.descs.ctx"),
        llm: t("flow.descs.llm"),
        answer: t("flow.descs.answer"),
      },
    },
    cosine: {
      title: t("cosine.title"),
      subtitle: t("cosine.subtitle"),
      rotate: t("cosine.rotate"),
      length: t("cosine.length"),
      nextPreset: t("cosine.nextPreset"),
      calculation: t("cosine.calculation"),
      interp: {
        verySimilar: t("cosine.interp.verySimilar"),
        similar: t("cosine.interp.similar"),
        weakSimilar: t("cosine.interp.weakSimilar"),
        unrelated: t("cosine.interp.unrelated"),
        weakOpposite: t("cosine.interp.weakOpposite"),
        opposite: t("cosine.interp.opposite"),
      },
      expected: t("cosine.expected"),
      presets: {
        p1A: t("cosine.presets.p1A"),
        p1B: t("cosine.presets.p1B"),
        p1Exp: t("cosine.presets.p1Exp"),
        p2A: t("cosine.presets.p2A"),
        p2B: t("cosine.presets.p2B"),
        p2Exp: t("cosine.presets.p2Exp"),
        p3A: t("cosine.presets.p3A"),
        p3B: t("cosine.presets.p3B"),
        p3Exp: t("cosine.presets.p3Exp"),
        p4A: t("cosine.presets.p4A"),
        p4B: t("cosine.presets.p4B"),
        p4Exp: t("cosine.presets.p4Exp"),
      },
    },
    hnsw: {
      title: t("hnsw.title"),
      subtitle: t("hnsw.subtitle"),
      search: t("hnsw.search"),
      regenerate: t("hnsw.regenerate"),
      currentLayer: t("hnsw.currentLayer"),
      comparisons: t("hnsw.comparisons"),
      layerLabel: t("hnsw.layerLabel"),
      top: t("hnsw.top"),
      base: t("hnsw.base"),
      nearest: t("hnsw.nearest"),
    },
    chunking: {
      title: t("chunking.title"),
      subtitle: t("chunking.subtitle"),
      strategy: t("chunking.strategy"),
      fixed: t("chunking.fixed"),
      recursive: t("chunking.recursive"),
      hybrid: t("chunking.hybrid"),
      chunkSize: t("chunking.chunkSize"),
      overlap: t("chunking.overlap"),
      docLabel: t("chunking.docLabel"),
      chunksLabel: t("chunking.chunksLabel"),
      chars: t("chunking.chars"),
      cleanCut: t("chunking.cleanCut"),
      badCut: t("chunking.badCut"),
      document: t("chunking.document"),
    },
  };

  return (
    <div className="not-prose my-12 -mx-4 sm:-mx-6 md:-mx-12 lg:-mx-24 xl:-mx-32">
      <RagOverviewLab messages={messages} />
    </div>
  );
}
