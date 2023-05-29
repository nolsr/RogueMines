import { LevelUpOverlay } from "../scenes/LevelUpOverlay";

export class Button extends Phaser.GameObjects.Image {
    constructor(scene: LevelUpOverlay, x: number, y: number) {
        super(scene, x, y, 'button');
        scene.add.existing(this);
        this.setInteractive();
    }
}