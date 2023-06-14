import { GameOverOverlay } from "../scenes/GameOverOverlay";

export class Button extends Phaser.GameObjects.Image {
    selected: boolean;
    outline: Phaser.GameObjects.Image;

    constructor(scene: GameOverOverlay, x: number, y: number, text: string | string[]) {
        super(scene, x, y, 'button');

        this.selected = false;
        this.outline = scene.add.image(x, y, 'buttonOutline').setDepth(1).setScale(5);
        this.outline.setAlpha(0, 0, 0, 0);

        scene.add.existing(this);
        this.setScale(5);
        this.setInteractive();
        this.scene.add.text(x, y, text).setOrigin(0.5, 0.5).setScale(3);
    }

    
    select() {
        this.selected = true;
        this.outline.setAlpha(1, 1, 1, 1);
    }

    unselect() {
        this.selected = false;
        this.outline.setAlpha(0, 0, 0, 0);
    }
}