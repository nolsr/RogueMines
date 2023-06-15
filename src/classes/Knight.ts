import { GameScene } from "../scenes/Game";
import { Enemy } from "./Enemy";

export class Knight extends Enemy {
    constructor(scene: GameScene, x: number, y: number, spawnedInRoom: number) {
        super(scene, x, y, spawnedInRoom, 'knight', 15, 350, 200);
        this.setSize(15, 14);
        this.setOffset(2, 6);
    }

    createAnimations() {
        if (this.scene.anims.exists('knightMoving')) {
            return;
        }
        this.scene.anims.create({
            key: 'knightStanding',
            frames: this.scene.anims.generateFrameNumbers('knight', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1,
            hideOnComplete: false
        });
        this.scene.anims.create({
            key: 'knightMoving',
            frames: this.scene.anims.generateFrameNumbers('knight', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1,
            hideOnComplete: false
        });
    }

    public move(targetX: number, targetY: number) {
        if (this.isAggroed) {
            this.flipX = this.x > targetX;
            this.play('knightMoving', true);
            const vectorX = targetX - this.x;
            const vectorY = targetY - this.y;
            const factor = this.speed / Math.sqrt(vectorX ** 2 + vectorY ** 2);
            this.setVelocity(factor * vectorX, factor * vectorY);
        }
    }
}