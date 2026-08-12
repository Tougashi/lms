export function processTrixSlides(html: string): string {
    if (!html) return html;
    if (typeof window === 'undefined') {
        return html.replace(/<figcaption[^>]*class="[^"]*attachment__caption[^"]*"[^>]*>[\s\S]*?<\/figcaption>/gi, "");
    }
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
    doc.querySelectorAll('figcaption.attachment__caption, .attachment__caption').forEach((caption) => {
        caption.remove();
    });
    return doc.body.innerHTML;
}

