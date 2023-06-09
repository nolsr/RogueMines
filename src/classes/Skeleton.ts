import { GameScene } from "../scenes/Game";
import { ExperienceOrb } from "./ExperienceOrb";
import { Humanoid } from "./Humanoid";

export class Skeleton extends Phaser.Physics.Arcade.Sprite implements Humanoid {
    health: number;
    maxHealth: number;
    speed: number;
    healthbar: Phaser.GameObjects.TileSprite;
    healthbarBackground: Phaser.GameObjects.TileSprite;
    isAggroed: boolean;
    spawnedInRoom: number;

    /**
     * 
     * @param pos Startingposition of skeltonobject
     */
    constructor(scene: GameScene, x: number, y: number, spawnedInRoom: number) {
        super(scene, x, y, 'skeleton');
        this.maxHealth = this.health = 100;
        this.speed = 25;
        this.isAggroed = false;
        this.spawnedInRoom = spawnedInRoom;

        this.createAnimations();

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setSize(9, 13);
        this.setOffset(4, 3);
        
        this.setOrigin(0.5, 1);
        this.setDepth(5);
        this.createHealthbar();
    }
    
    private createAnimations() {
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

    private createHealthbar() {
        this.healthbarBackground = this.scene.add.tileSprite(this.x, this.y + 1, 8, 1, 'healthbarBG');
        this.healthbar = this.scene.add.tileSprite(this.x - 4, this.y + 1, 3, 1, 'healthbarFG');
        this.healthbar.setOrigin(0, 0.5);
        this.healthbar.setDepth(5);
        this.healthbarBackground.setDepth(4);
    }

    private updateHealthbar() {
        this.healthbarBackground.x = this.x;
        this.healthbarBackground.y = this.y + 1;
        this.healthbar.x = this.x - 4;
        this.healthbar.y = this.y + 1;
        this.healthbar.width = 8 * (this.health / this.maxHealth);
    }

    private killSkeleton() {
        this.generateDrops();

        this.healthbar.destroy();
        this.healthbarBackground.destroy();
        this.destroy();
    }

    private generateDrops() {
        (this.scene as GameScene).gameState.entities.add(new ExperienceOrb(this.scene as GameScene, this.x, this.y));
    }

    public applyDamage(damage: number) {
        this.health = this.health - damage;
        if (this.health <= 0) {
            this.killSkeleton();
        }
    }

    public move(targetX: number, targetY: number) {
        this.updateHealthbar();

        if (this.isAggroed) {
            this.flipX = this.x > targetX;
            if (this.x + 20 >= targetX && this.x - 20 <= targetX && this.y + 20 >= targetY && this.y - 20 <= targetY) {
                this.play('skeletonStanding', true);
                this.setVelocity(0, 0);
                return;
            } else {
                this.play('skeletonMoving', true);
            }
            const vectorX = targetX - this.x;
            const vectorY = targetY - this.y;
            const factor = this.speed / Math.sqrt(vectorX ** 2 + vectorY ** 2);
            this.setVelocity(factor * vectorX, factor * vectorY);
        }
    }
}