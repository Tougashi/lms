export function processTrixSlides(html: string): string {
    if (!html || typeof window === 'undefined') return html;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('figure[data-trix-attachment]').forEach((fig) => {
        try {
            const data = JSON.parse(fig.getAttribute('data-trix-attachment') || '{}');
            if (data.contentType === 'application/x-presentation' && data.content) {
                const tmp = document.createElement('div');
                tmp.innerHTML = data.content;
                const el = tmp.firstElementChild;
                if (el) fig.replaceWith(el);
            }
        } catch {}
    });
    return doc.body.innerHTML;
}
