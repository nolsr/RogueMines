import { GameScene } from "../scenes/Game";
import { Enemy } from "./Enemy";

export class Skeleton extends Enemy {
    constructor(scene: GameScene, x: number, y: number, spawnedInRoom: number) {
        super(scene, x, y, spawnedInRoom, 'skeleton', 25, 100, 50);
        this.setSize(8, 10);
        this.setOffset(4, 6);
    }

    createAnimations() {
        if (this.scene.anims.exists('skeletonStanding')) {
            return;
        }
        this.scene.anims.create({
            key: 'skeletonStanding',
            frames: this.scene.anims.generateFrameNumbers('skeleton', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1,
            hideOnComplete: false
        });
        this.scene.anims.create({
            key: 'skeletonMoving',
            frames: this.scene.anims.generateFrameNumbers('skeleton', { start: 1, end: 7 }),
            frameRate: 10,
            repeat: -1,
            hideOnComplete: false
        });
    }

    public move(targetX: number, targetY: number) {
        if (this.isAggroed) {
            this.flipX = this.x > targetX;
            this.play('skeletonMoving', true);
            const vectorX = targetX - this.x;
            const vectorY = targetY - this.y;
            const factor = this.speed / Math.sqrt(vectorX ** 2 + vectorY ** 2);
            this.setVelocity(factor * vectorX, factor * vectorY);
        }
    }
}