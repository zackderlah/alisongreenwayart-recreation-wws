import { wwsSectionField } from "./sdk";
import type { HomeSection, WWSHomeContent } from "./home";

const element = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  value?: string
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
};

const sectionNode = (section: HomeSection, extra: string) => {
  const node = element("section", `wws-section wws-spacing-${section.spacing} wws-visibility-${section.visibility} wws-columns-${section.columns} ${extra}`);
  node.dataset.wwsField = wwsSectionField(section.id);
  return node;
};

const paragraphNodes = (parent: HTMLElement, values: Array<{ text: string }>, className: string) => {
  values.forEach((value) => parent.append(element("p", className, value.text)));
};

const link = (href: string, className: string, label: string) => {
  const node = element("a", className, label);
  node.setAttribute("href", href);
  return node;
};

function renderSection(section: HomeSection): HTMLElement {
  if (section.type === "hero") {
    const root = sectionNode(section, "px-4 py-16 text-center");
    const inner = element("div", "mx-auto max-w-4xl");
    inner.append(element("h1", "font-display text-4xl font-semibold text-text md:text-5xl", section.content.line1));
    inner.append(element("p", "mt-2 text-3xl font-bold text-accent md:text-4xl", section.content.line2));
    inner.append(element("p", "mt-2 text-sm font-semibold uppercase tracking-wide text-text", section.content.line3));
    const action = element("div", "mt-8");
    action.append(link(section.content.ctaUrl, "inline-flex items-center justify-center px-6 py-3 text-sm font-semibold transition-colors bg-accent text-white hover:bg-accent-hover", section.content.ctaLabel));
    inner.append(action);
    root.append(inner);
    return root;
  }

  if (section.type === "intro") {
    const root = sectionNode(section, "bg-[#f5f5f5] px-4 py-16");
    const grid = element("div", "wws-grid mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center");
    const copy = element("div");
    copy.append(element("h2", "mb-6 text-2xl font-bold text-text", section.content.heading));
    paragraphNodes(copy, section.content.paragraphs, "mb-4 leading-relaxed text-text");
    const actions = element("div", "mt-8 flex flex-wrap gap-4");
    const phone = document.querySelector<HTMLAnchorElement>('footer a[href^="tel:"]');
    if (phone) actions.append(link(phone.href, "inline-flex items-center justify-center px-6 py-3 text-sm font-semibold transition-colors bg-brand text-white hover:bg-brand-dark", phone.textContent ?? ""));
    actions.append(link(section.content.contactUrl, "inline-flex items-center justify-center px-6 py-3 text-sm font-semibold transition-colors border border-gray-400 bg-white text-text hover:bg-gray-50", section.content.contactLabel));
    copy.append(actions);
    grid.append(copy);
    if (section.content.image) {
      const media = element("div", "text-center");
      const image = element("img", "mx-auto border border-gray-300 shadow-sm");
      image.src = section.content.image;
      image.alt = section.content.imageAlt;
      media.append(image, element("p", "mt-4 text-sm font-medium text-text", section.content.caption));
      grid.append(media);
    }
    root.append(grid);
    return root;
  }

  if (section.type === "special") {
    const root = sectionNode(section, "px-4 py-16 text-center");
    root.append(element("h2", "text-2xl font-bold text-accent md:text-3xl", section.content.heading));
    root.append(element("p", "mt-2 font-semibold text-text", section.content.subheading));
    const grid = element("div", "wws-grid mx-auto mt-10 grid max-w-5xl gap-8 text-left md:grid-cols-2");
    paragraphNodes(grid, section.content.paragraphs, "leading-relaxed text-text");
    root.append(grid);
    return root;
  }

  if (section.type === "categories") {
    const root = sectionNode(section, "px-4 py-16 text-center");
    root.append(element("h2", "text-2xl font-bold text-text", section.content.heading));
    root.append(element("p", "mt-2 text-gray-600", section.content.subheading));
    const grid = element("div", "wws-grid mx-auto mt-10 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4");
    section.content.items.forEach((item) => {
      const card = link(item.url, "group", "");
      if (item.image) {
        const image = element("img", "mx-auto mb-4 border border-gray-300 transition group-hover:opacity-90");
        image.src = item.image;
        image.alt = item.imageAlt;
        card.append(image);
      }
      card.append(element("span", "inline-block w-full bg-brand px-4 py-3 text-sm font-semibold text-white group-hover:bg-brand-dark", item.label));
      grid.append(card);
    });
    root.append(grid);
    return root;
  }

  const root = sectionNode(section, "bg-[#f5f5f5] px-4 py-16");
  const grid = element("div", "wws-grid mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center");
  if (section.content.image) {
    const image = element("img", "w-full");
    image.src = section.content.image;
    image.alt = section.content.imageAlt;
    grid.append(image);
  }
  const copy = element("div");
  copy.append(element("h2", "mb-6 text-2xl font-bold text-text", section.content.heading));
  paragraphNodes(copy, section.content.paragraphs, "mb-4 leading-relaxed text-text");
  grid.append(copy);
  root.append(grid);
  return root;
}

export function renderHomeContent(container: HTMLElement, content: WWSHomeContent) {
  const fragment = document.createDocumentFragment();
  content._structure.sections.forEach((section) => fragment.append(renderSection(section)));
  container.replaceChildren(fragment);
}
