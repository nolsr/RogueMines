import { GameScene } from "../scenes/Game";
import { Direction } from "../types/Direction";
import { Enemy } from "./Enemy";
import { Skeleton } from "./Skeleton";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    projectileSpeed: number;
    projectileDamage: number;
    isInitialized: boolean;
    gameScene: GameScene;
    shadow: Phaser.GameObjects.Sprite;
    shadowScaleY: number;
    direction: Direction;
    isCritical: boolean;

    constructor(scene: GameScene, x: number, y: number, direction: Direction, power: number, isCritical: boolean) {
        switch (direction) {
            case Direction.UP:
                x += 2;
                y -= 15;
                break;
            case Direction.DOWN:
                x += 2;
                break;
            case Direction.LEFT:
                x += -4;
                y += -9;
                break;
            case Direction.RIGHT:
                x += 4;
                y += -9;
                break;
        }
        const sprite = isCritical ? 'fistProjectileCritical' : 'fistProjectile'
        console.log(sprite);
        super(scene, x, y, sprite);
        this.gameScene = scene;

        this.projectileSpeed = 80;
        this.projectileDamage = 50 * power * (isCritical ? 2 : 1);
        this.direction = direction;
        this.isCritical = isCritical;

        this.createAnimations();
        this.setDepth(10);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.shadow = this.gameScene.add.sprite(x, y, 'fistProjectile');


        switch (direction) {
            case Direction.UP:
                this.setOrigin(0.5, 1)
                this.rotation = -Math.PI / 2;
                this.shadow.setOrigin(0.5, 1)
                this.shadow.rotation = -Math.PI / 2;
                break;
            case Direction.DOWN:
                this.setOrigin(0.5, 0)
                this.rotation = Math.PI / 2;
                this.shadow.setOrigin(0.5, 0)
                this.shadow.rotation = Math.PI / 2;
                break;
            case Direction.LEFT:
                this.setOrigin(1, 0.5)
                this.flipX = true;
                this.shadow.setOrigin(1, 0.5)
                this.shadow.flipX = true;
                break;
            case Direction.RIGHT:
                this.setOrigin(0, 0.5)
                this.shadow.setOrigin(0, 0.5)
                break;
        }

        this.play(isCritical ? 'projectileCritical' : 'projectile', true);

        this.shadowScaleY = 0.8;
        this.shadow.scaleY = this.shadowScaleY;
        this.shadow.tint = 0x000000;
        this.shadow.alpha = 0.5;
        // this.shadow.setPipeline('skewQuad');
        this.shadow.pipeline.set1f('inHorizontalSkew', 0.2);
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
            this.scene.anims.create({
                key: 'projectileCritical',
                frames: this.scene.anims.generateFrameNumbers('fistProjectileCritical', { start: 0, end: 2 }),
                frameRate: 15,
                repeat: -1,
                hideOnComplete: false
            });
        }
    }

    public checkCollision() {
        if (!this.isInitialized) {
            switch (this.direction) {
                case Direction.UP:
                    this.setVelocityY(-this.projectileSpeed);
                    break;
                case Direction.DOWN:
                    this.setVelocityY(this.projectileSpeed);
                    break;
                case Direction.LEFT:
                    this.setVelocityX(-this.projectileSpeed);
                    break;
                case Direction.RIGHT:
                    this.setVelocityX(this.projectileSpeed);
                    break;
            }
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