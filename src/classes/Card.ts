import { LevelUpOverlay } from "../scenes/LevelUpOverlay";
import { Player } from "./Player";

export class Card extends Phaser.GameObjects.Image {
    selected: boolean;
    outline: Phaser.GameObjects.Image;

    constructor(scene: LevelUpOverlay, x: number, y: number) {
        super(scene, x, y, 'card');
        
        this.selected = false;
        this.outline = scene.add.image(x, y, 'cardOutline').setDepth(1);
        this.outline.setAlpha(0, 0, 0, 0);

        scene.add.existing(this);
        this.setInteractive();

        
    }

    select() {
        this.selected = true;
        this.outline.setAlpha(1, 1, 1, 1);
    }

    unselect() {
        this.selected = false;
        this.outline.setAlpha(0, 0, 0, 0);
    }

    printCardContent() {
        // projectile speed
        // attack speed
        // damage
        // movement speed
        this.scene.add.text(this.x, this.y, 'Damage', { font: 'Code', fontSize: '8px' });
    }

    applyPowerup(player: Player) {
        player.power += 1;
    }
}