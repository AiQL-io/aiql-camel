import { notFound } from "next/navigation";
import { ROADMAP, roadmapBySlug } from "@/imports/core/components/roadmap.js";
import { PreviewLanding } from "@/imports/core/components/PreviewLanding.jsx";

export function generateStaticParams() {
  return ROADMAP.map((m) => ({ slug: m.slug }));
}

export default async function Page({ params }) {
  const { slug } = await params;
  const module_ = roadmapBySlug[slug];
  if (!module_) notFound();
  return <PreviewLanding module={module_} />;
}
