import { GameScene } from "../scenes/Game";
import { Enemy } from "./Enemy";
import { Skeleton } from "./Skeleton";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    projectileSpeed: number;
    projectileDamage: number;
    isInitialized: boolean;
    gameScene: GameScene;
    shadow: Phaser.GameObjects.Sprite;
    shadowScaleY: number;

    constructor(scene: GameScene, x: number, y: number, left: boolean, power: number) {
        super(scene, x, y, 'fistProjectile');
        this.gameScene = scene;

        this.projectileSpeed = 80 * (left ? -1 : 1);
        this.projectileDamage = 50 * power;

        this.createAnimations();
        this.setDepth(10);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        left ? this.setOrigin(1, 0.5) : this.setOrigin(0, 0.5);

        this.flipX = left;
        this.play('projectile', true);

        this.shadow = this.gameScene.add.sprite(x, y, 'fistProjectile');
        this.shadowScaleY = 0.8;
        this.shadow.scaleY = this.shadowScaleY;
        this.shadow.tint = 0x000000;
        this.shadow.alpha = 0.5;
        // this.shadow.setPipeline('skewQuad');
        this.shadow.pipeline.set1f('inHorizontalSkew', 0.2);
        left ? this.shadow.setOrigin(1, 0.5) : this.shadow.setOrigin(0, 0.5)
        this.shadow.flipX = left;
        this.shadow.play('projectile', true);
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

        this.shadow.x = this.x + 3;
        this.shadow.y = this.y - 2;

        this.gameScene.physics.world.overlap(this, this.gameScene.gameState.enemies, (a, b) => {
            (b as Enemy).applyDamage((a as Projectile).projectileDamage);
            (a as Projectile).destroyProjectile();
        });
        this.gameScene.physics.world.overlap(this, this.gameScene.gameState.enemiesUnaffectedByWalls, (a, b) => {
            (b as Enemy).applyDamage((a as Projectile).projectileDamage);
            (a as Projectile).destroyProjectile();
        });
    }

    destroyProjectile() {
        this.shadow.destroy();
        this.destroy();
    }
}