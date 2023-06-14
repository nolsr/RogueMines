import { GameScene } from "../scenes/Game";
import { Enemy } from "./Enemy";
import { Skeleton } from "./Skeleton";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    projectileSpeed: number;
    projectileDamage: number;
    isInitialized: boolean;
    gameScene: GameScene;

    constructor(scene: GameScene, x: number, y: number, left: boolean, power: number) {
        super(scene, x, y, 'fistProjectile');
        this.gameScene = scene;

        this.projectileSpeed = 80 * (left ? -1 : 1);
        this.projectileDamage = 50 * power;

        this.createAnimations();

        scene.add.existing(this);
        scene.physics.add.existing(this);
        left ? this.setOrigin(1, 0.5) : this.setOrigin(0, 0.5);

        this.flipX = left;
        this.play('projectile', true);
    }

    private createAnimations() {
        if (!this.scene.anims.exists('projectile')) {
            this.scene.anims.create({
                key: 'projectile',
                frames: this.scene.anims.generateFrameNumbers('fistProjectile', { start: 0, end: 2 }),
                frameRate: 15,
                repeat: -1,
                hideOnComplete: false
            });
        }
    }

    public checkCollision() {
        if (!this.isInitialized) {
            this.setVelocityX(this.projectileSpeed);
            this.isInitialized = true;
        }
        this.gameScene.physics.world.overlap(this, this.gameScene.gameState.enemies, (a, b) => {
            (b as Enemy).applyDamage((a as Projectile).projectileDamage);
            a.destroy();
        });
        this.gameScene.physics.world.overlap(this, this.gameScene.gameState.enemiesUnaffectedByWalls, (a, b) => {
            (b as Enemy).applyDamage((a as Projectile).projectileDamage);
            a.destroy();
        });
    }
}