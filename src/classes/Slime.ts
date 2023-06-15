import { GameScene } from "../scenes/Game";
import { Enemy } from "./Enemy";

export class Slime extends Enemy {
    constructor(scene: GameScene, x: number, y: number, spawnedInRoom: number) {
        super(scene, x, y, spawnedInRoom, 'slime', 20, 55, 35);
    }

    createAnimations() {
        if (this.scene.anims.exists('slimeMoving')) {
            return;
        }
        this.scene.anims.create({
            key: 'slimeStanding',
            frames: this.scene.anims.generateFrameNumbers('slime', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1,
            hideOnComplete: false
        });
        this.scene.anims.create({
            key: 'slimeMoving',
            frames: this.scene.anims.generateFrameNumbers('slime', { start: 0, end: 2 }),
            frameRate: 6,
            repeat: -1,
            hideOnComplete: false
        });
    }

    public move(targetX: number, targetY: number) {
        if (this.isAggroed) {
            this.flipX = this.x > targetX;
            this.play('slimeMoving', true);
            const vectorX = targetX - this.x;
            const vectorY = targetY - this.y;
            const factor = this.speed / Math.sqrt(vectorX ** 2 + vectorY ** 2);
            this.setVelocity(factor * vectorX, factor * vectorY);
        }
    }
}