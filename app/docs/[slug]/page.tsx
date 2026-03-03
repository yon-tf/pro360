import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/MarkdownContent";
import {
  ColorPalettePreview,
  IconographyPreview,
  TypographyPreview,
} from "@/components/docs/DesignLanguageExamples";
import { DOCS_SECTIONS, type DocsSlug } from "@/app/docs/constants";
import { getDocContent } from "@/app/docs/lib";

type Params = {
  slug: string;
};

const VALID_SLUGS = new Set(DOCS_SECTIONS.map((item) => item.slug));

function splitDesignLanguageMarkdown(markdown: string) {
  const hTypography = "\n## Typography";
  const hIconography = "\n## Iconography";
  const hComponents = "\n## Components";

  const iTypography = markdown.indexOf(hTypography);
  const iIconography = markdown.indexOf(hIconography);
  const iComponents = markdown.indexOf(hComponents);

  if (iTypography === -1 || iIconography === -1 || iComponents === -1) {
    return {
      colorSection: markdown,
      typographySection: "",
      iconographySection: "",
      componentsSection: "",
    };
  }

  return {
    colorSection: markdown.slice(0, iTypography),
    typographySection: markdown.slice(iTypography, iIconography),
    iconographySection: markdown.slice(iIconography, iComponents),
    componentsSection: markdown.slice(iComponents),
  };
}

export default async function DocsSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!VALID_SLUGS.has(slug as DocsSlug)) notFound();

  const { markdown } = getDocContent(slug as DocsSlug);
  const designSections =
    slug === "design-language" ? splitDesignLanguageMarkdown(markdown) : null;

  return (
    <div className="min-w-0 max-w-5xl">
      <div className="doc-shell rounded-xl bg-background px-1 py-1 lg:px-2">
        {slug !== "design-language" ? (
          <MarkdownContent content={markdown} />
        ) : (
          <>
            <MarkdownContent content={designSections?.colorSection ?? markdown} />
            <ColorPalettePreview />

            <MarkdownContent content={designSections?.typographySection ?? ""} />
            <TypographyPreview />

            <MarkdownContent content={designSections?.iconographySection ?? ""} />
            <IconographyPreview />

            <MarkdownContent content={designSections?.componentsSection ?? ""} />
          </>
        )}
      </div>
    </div>
  );
}

