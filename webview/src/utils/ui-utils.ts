export function createElement(tagName: string, cssClasses?: string[]): HTMLElement {
    const element = document.createElement(tagName);
    if (cssClasses) {
        element.classList.add(...cssClasses);
    }
    return element;
}