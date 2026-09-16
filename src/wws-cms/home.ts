export type Spacing = "compact" | "standard" | "spacious";
export type Visibility = "all" | "desktop" | "mobile" | "hidden";
export type Columns = "1" | "2" | "3" | "4";
export type HomeSectionType = "hero" | "intro" | "special" | "categories" | "gift";

export interface ParagraphItem {
  text: string;
}

interface SectionBase<T extends HomeSectionType, C> {
  id: string;
  type: T;
  layout: "default";
  columns: Columns;
  spacing: Spacing;
  visibility: Visibility;
  content: C;
}

export type HeroSection = SectionBase<"hero", {
  line1: string;
  line2: string;
  line3: string;
  ctaLabel: string;
  ctaUrl: string;
}>;

export type IntroSection = SectionBase<"intro", {
  heading: string;
  paragraphs: ParagraphItem[];
  image: string;
  imageAlt: string;
  caption: string;
  contactLabel: string;
  contactUrl: string;
}>;

export type SpecialSection = SectionBase<"special", {
  heading: string;
  subheading: string;
  paragraphs: ParagraphItem[];
}>;

export interface CategoryItem {
  label: string;
  url: string;
  image: string;
  imageAlt: string;
}

export type CategoriesSection = SectionBase<"categories", {
  heading: string;
  subheading: string;
  items: CategoryItem[];
}>;

export type GiftSection = SectionBase<"gift", {
  heading: string;
  paragraphs: ParagraphItem[];
  image: string;
  imageAlt: string;
}>;

export type HomeSection = HeroSection | IntroSection | SpecialSection | CategoriesSection | GiftSection;

export interface WWSHomeContent {
  _structure: {
    sections: HomeSection[];
  };
}

type OriginalPage = {
  hero: {
    line1: string;
    line2: string;
    line3: string;
    cta: { label: string; href: string };
  };
  sections?: string[];
  images?: Array<{ src: string; alt?: string }>;
};

const text = (value: unknown, max = 4000): string | null =>
  typeof value === "string" && value.length <= max ? value : null;

const safeUrl = (value: unknown): string | null => {
  if (typeof value !== "string" || value.length > 2048) return null;
  if (value === "" || value.startsWith("/")) return value;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
};

const paragraphs = (value: unknown, max: number): ParagraphItem[] | null => {
  if (!Array.isArray(value) || value.length > max) return null;
  const result: ParagraphItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const valueText = text((item as Record<string, unknown>).text);
    if (valueText === null) return null;
    result.push({ text: valueText });
  }
  return result;
};

function base(value: Record<string, unknown>) {
  const id = text(value.id, 80);
  const type = value.type;
  const columns = value.columns;
  const spacing = value.spacing;
  const visibility = value.visibility;
  if (!id || !/^[a-zA-Z0-9-]{1,80}$/.test(id)) return null;
  if (!["hero", "intro", "special", "categories", "gift"].includes(String(type))) return null;
  if (value.layout !== "default") return null;
  if (!["1", "2", "3", "4"].includes(String(columns))) return null;
  if (!["compact", "standard", "spacious"].includes(String(spacing))) return null;
  if (visibility !== "all") return null;
  if (!value.content || typeof value.content !== "object" || Array.isArray(value.content)) return null;
  return {
    id,
    type: type as HomeSectionType,
    layout: "default" as const,
    columns: columns as Columns,
    spacing: spacing as Spacing,
    visibility: visibility as Visibility,
    content: value.content as Record<string, unknown>
  };
}

function validateSection(value: unknown): HomeSection | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const common = base(value as Record<string, unknown>);
  if (!common) return null;
  const c = common.content;

  if (common.type === "hero") {
    const line1 = text(c.line1, 200);
    const line2 = text(c.line2, 200);
    const line3 = text(c.line3, 200);
    const ctaLabel = text(c.ctaLabel, 100);
    const ctaUrl = safeUrl(c.ctaUrl);
    if (line1 === null || line2 === null || line3 === null || ctaLabel === null || ctaUrl === null) return null;
    return { ...common, type: "hero", content: { line1, line2, line3, ctaLabel, ctaUrl } };
  }

  if (common.type === "intro") {
    const heading = text(c.heading, 300);
    const body = paragraphs(c.paragraphs, 12);
    const image = safeUrl(c.image);
    const imageAlt = text(c.imageAlt, 300);
    const caption = text(c.caption, 300);
    const contactLabel = text(c.contactLabel, 100);
    const contactUrl = safeUrl(c.contactUrl);
    if (heading === null || !body || image === null || imageAlt === null || caption === null || contactLabel === null || contactUrl === null) return null;
    return { ...common, type: "intro", content: { heading, paragraphs: body, image, imageAlt, caption, contactLabel, contactUrl } };
  }

  if (common.type === "special") {
    const heading = text(c.heading, 300);
    const subheading = text(c.subheading, 300);
    const body = paragraphs(c.paragraphs, 16);
    if (heading === null || subheading === null || !body) return null;
    return { ...common, type: "special", content: { heading, subheading, paragraphs: body } };
  }

  if (common.type === "categories") {
    const heading = text(c.heading, 300);
    const subheading = text(c.subheading, 300);
    if (heading === null || subheading === null || !Array.isArray(c.items) || c.items.length > 8) return null;
    const items: CategoryItem[] = [];
    for (const raw of c.items) {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
      const item = raw as Record<string, unknown>;
      const label = text(item.label, 120);
      const url = safeUrl(item.url);
      const image = safeUrl(item.image);
      const imageAlt = text(item.imageAlt, 300);
      if (label === null || url === null || image === null || imageAlt === null) return null;
      items.push({ label, url, image, imageAlt });
    }
    return { ...common, type: "categories", content: { heading, subheading, items } };
  }

  const heading = text(c.heading, 500);
  const body = paragraphs(c.paragraphs, 12);
  const image = safeUrl(c.image);
  const imageAlt = text(c.imageAlt, 300);
  if (heading === null || !body || image === null || imageAlt === null) return null;
  return { ...common, type: "gift", content: { heading, paragraphs: body, image, imageAlt } };
}

export function validateHomeContent(value: unknown): WWSHomeContent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const structure = (value as Record<string, unknown>)._structure;
  if (!structure || typeof structure !== "object" || Array.isArray(structure)) return null;
  const rawSections = (structure as Record<string, unknown>).sections;
  if (!Array.isArray(rawSections) || rawSections.length > 30) return null;

  const sections: HomeSection[] = [];
  const ids = new Set<string>();
  const types = new Set<HomeSectionType>();
  for (const raw of rawSections) {
    const section = validateSection(raw);
    if (!section || ids.has(section.id) || types.has(section.type)) return null;
    ids.add(section.id);
    types.add(section.type);
    sections.push(section);
  }

  if (sections.length !== 5 || !["hero", "intro", "special", "categories", "gift"].every((type) => types.has(type as HomeSectionType))) return null;
  return { _structure: { sections } };
}

export function createHomeFallback(page: OriginalPage): WWSHomeContent {
  const sections = page.sections ?? [];
  const images = page.images ?? [];
  return {
    _structure: {
      sections: [
        {
          id: "home-hero",
          type: "hero",
          layout: "default",
          columns: "1",
          spacing: "standard",
          visibility: "all",
          content: {
            line1: page.hero.line1,
            line2: page.hero.line2,
            line3: page.hero.line3,
            ctaLabel: page.hero.cta.label,
            ctaUrl: page.hero.cta.href
          }
        },
        {
          id: "house-portraits",
          type: "intro",
          layout: "default",
          columns: "2",
          spacing: "standard",
          visibility: "all",
          content: {
            heading: "Looking for someone to Draw Your House?",
            paragraphs: sections.slice(0, 3).map((value) => ({ text: value })),
            image: images[0]?.src ?? "",
            imageAlt: images[0]?.alt || "House portrait artwork",
            caption: "Artwork is not AI generated",
            contactLabel: "Contact",
            contactUrl: "/contact+alison+greenway"
          }
        },
        {
          id: "art-special",
          type: "special",
          layout: "default",
          columns: "2",
          spacing: "standard",
          visibility: "all",
          content: {
            heading: "What Makes Alison's Art Special?",
            subheading: "Why Clients Love These Portraits",
            paragraphs: sections.slice(3, 11).map((value) => ({ text: value }))
          }
        },
        {
          id: "print-categories",
          type: "categories",
          layout: "default",
          columns: "4",
          spacing: "standard",
          visibility: "all",
          content: {
            heading: "Quality Fine Art Giclee Prints Available",
            subheading: "Shop by Category",
            items: [
              { label: "Queensland Homes", url: "/queensland-homes", image: images[2]?.src ?? "", imageAlt: images[2]?.alt || "Queensland Homes" },
              { label: "Cottages", url: "/queensland+cottage+art+collection", image: images[3]?.src ?? "", imageAlt: images[3]?.alt || "Cottages" },
              { label: "Painting Reproductions", url: "/painting-reproductions", image: images[4]?.src ?? "", imageAlt: images[4]?.alt || "Painting Reproductions" },
              { label: "Art Commissions", url: "/house-portrait-commissions", image: images[5]?.src ?? "", imageAlt: images[5]?.alt || "Art Commissions" }
            ]
          }
        },
        {
          id: "gift-artwork",
          type: "gift",
          layout: "default",
          columns: "2",
          spacing: "standard",
          visibility: "all",
          content: {
            heading: "Finding the perfect gift can be difficult — especially when you want something personal and heartfelt.",
            paragraphs: sections.slice(11).map((value) => ({ text: value })),
            image: images[6]?.src ?? "",
            imageAlt: images[6]?.alt || "Gift artwork collage"
          }
        }
      ]
    }
  };
}
