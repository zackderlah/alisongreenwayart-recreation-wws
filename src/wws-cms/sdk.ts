/** Framework independent. Bundle this source with your React, Next, or Astro site. */
export type WWSConfig = { cmsUrl: string; site: string };
/** Put this value on an approved section's data-wws-field attribute. */
export function wwsSectionField(id: string) {
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id))
    throw new Error('Invalid section identifier');
  return `_structure.${id}`;
}
export function createWWS(config: WWSConfig) {
  return {
    async getWWSContent<T = Record<string, unknown>>(page: string): Promise<T> {
      const response = await fetch(
        `${config.cmsUrl}/api/public/${encodeURIComponent(config.site)}/${encodeURIComponent(page)}`,
        { cache: 'no-store' },
      );
      if (!response.ok)
        throw new Error(`WWS content unavailable (${response.status})`);
      return response.json();
    },
    async getWWSBlog() {
      const response = await fetch(
        `${config.cmsUrl}/api/public/${encodeURIComponent(config.site)}/blog`,
        { cache: 'no-store' },
      );
      if (!response.ok) throw new Error('WWS blog unavailable');
      return response.json();
    },
  };
}
export function connectWWSPreview(options: {
  cmsOrigin: string;
  onContent: (content: unknown) => void;
}) {
  if (typeof window === 'undefined' || window.parent === window)
    return () => {};
  const origin = new URL(options.cmsOrigin).origin;
  const send = (message: unknown) => window.parent.postMessage(message, origin);
  const click = (event: MouseEvent) => {
    const element = (event.target as Element)?.closest<HTMLElement>(
      '[data-wws-field]',
    );
    if (!element) return;
    event.preventDefault();
    event.stopPropagation();
    send({ type: 'WWS_SELECT_FIELD', field: element.dataset.wwsField });
  };
  const receive = (event: MessageEvent) => {
    if (
      event.origin !== origin ||
      event.source !== window.parent ||
      !event.data ||
      typeof event.data !== 'object'
    )
      return;
    if (
      event.data.type === 'WWS_CONTENT_UPDATE' &&
      event.data.content &&
      typeof event.data.content === 'object'
    )
      options.onContent(event.data.content);
    if (
      event.data.type === 'WWS_FOCUS_FIELD' &&
      typeof event.data.field === 'string'
    ) {
      document.querySelectorAll('[data-wws-field]').forEach((el) => {
        const selected = el.getAttribute('data-wws-field') === event.data.field;
        el.classList.toggle('wws-selected', selected);
        if (selected)
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  };
  document.documentElement.dataset.wwsPreview = 'true';
  document.addEventListener('click', click, true);
  window.addEventListener('message', receive);
  send({ type: 'WWS_PREVIEW_READY' });
  return () => {
    document.removeEventListener('click', click, true);
    window.removeEventListener('message', receive);
    delete document.documentElement.dataset.wwsPreview;
  };
}
