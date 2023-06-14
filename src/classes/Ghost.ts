import { GameScene } from "../scenes/Game";
import { Enemy } from "./Enemy";

export class Ghost extends Enemy {
    aggroRange: number;

    constructor(scene: GameScene, x: number, y: number, spawnedInRoom: number) {
        super(scene, x, y, spawnedInRoom, 'ghost', 35, 75, 75);
        this.aggroRange = 150;
    }

    createAnimations() {
        if (this.scene.anims.exists('ghost')) {
            return;
        }
        this.scene.anims.create({
            key: 'ghost',
            frames: this.scene.anims.generateFrameNumbers('ghost', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1,
            hideOnComplete: false
        });
    }

    move(targetX: number, targetY: number) {
        if (!this.isAggroed) {
            const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
            if (distanceToPlayer <= this.aggroRange) {
                this.isAggroed = true;
            }
        }

        if (this.isAggroed) {
            this.flipX = this.x > targetX;
            this.play('ghost', true);
            const vectorX = targetX - this.x;
            const vectorY = targetY - this.y;
            const factor = this.speed / Math.sqrt(vectorX ** 2 + vectorY ** 2);
            this.setVelocity(factor * vectorX, factor * vectorY);
        }
    }
}