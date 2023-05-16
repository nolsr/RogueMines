export class FaviconAnimater {
    currentFrame: number;
    constructor(link: HTMLElement | null) {
        this.currentFrame = 0;
        setInterval(() => this.countFrame(link), 250);
    }

    countFrame(link: HTMLElement | null) {
        if (this.currentFrame === 8) {
            this.currentFrame = 1;
        }
        (link as HTMLLinkElement).href = `./assets/favicon/frame${this.currentFrame}.png`;
        this.currentFrame++;
    }
}