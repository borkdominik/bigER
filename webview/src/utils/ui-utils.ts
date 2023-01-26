export function createElement(tagName: string, cssClasses?: string[]): HTMLElement {
    const element = document.createElement(tagName);
    if (cssClasses) {
        element.classList.add(...cssClasses);
    }
    return element;
}

export function togglePanel(panelId: string): void {
    const panel = document.getElementById(panelId);
    if (panel) {
        if (panel.style.display === 'none') {
            panel.style.display = 'flex';
        } else {
            panel.style.display = 'none';
        }
    }
}