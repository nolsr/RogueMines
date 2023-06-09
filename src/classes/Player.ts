import { GameScene } from "../scenes/Game";
import { Humanoid } from "./Humanoid";
import { Projectile } from "./Projectile";

export class Player extends Phaser.Physics.Arcade.Sprite implements Humanoid {
    health: number;
    maxHealth: number;
    speed: number;
    experience: number;
    experienceTillLevelup: number;
    levelProgress: number;
    level: number;
    attackOnCooldown: boolean;
    attacking: boolean;
    attackCooldown: number;
    power: number;
    critChance: number;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'player');
        this.maxHealth = this.health = 100;
        this.speed = 75;
        this.attackOnCooldown = false;
        this.attackCooldown = 500;
        this.experience = 0;
        this.experienceTillLevelup = 100;
        this.level = 1;
        this.power = 1;
        this.critChance = 0;

        this.createAnimations();

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setSize(10, 14);
        this.setOffset(3, 2);

        this.setOrigin(0.5, 1)
        this.setCollideWorldBounds(true);
        this.setDepth(10);
    }

    private createAnimations() {
        this.scene.anims.create({
            key: 'playerMoving',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 1, end: 6 }),
            frameRate: 13,
            repeat: -1,
            hideOnComplete: false
        });
        this.scene.anims.create({
            key: 'playerHitting',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 7, end: 11 }),
            frameRate: 30,
            repeat: 0,
            hideOnComplete: false
        });
        this.scene.anims.create({
            key: 'playerStanding',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1,
            hideOnComplete: false
        });
    }

    public update() {
        if (this.body?.velocity.x != 0 || this.body?.velocity.y != 0) {
            if (this.body!.velocity.x !== 0) {
                this.flipX = this.body!.velocity.x < 0;
            }
            if (!this.attacking) {
                this.play('playerMoving', true);
            }
        } else {
            if (!this.attacking) {
                this.play('playerStanding', true);
            }
        }
    }

    public moveX(multiplier: number) {
        this.setVelocityX(this.speed * multiplier);
    }

    public moveY(multiplier: number) {
        this.setVelocityY(this.speed * multiplier);
    }

    public move(velocityX: number, velocityY: number) {
        const adjustedSpeed = velocityX !== 0 && velocityY !== 0 ? this.speed / Math.sqrt(2) : this.speed;
        this.setVelocity(velocityX * adjustedSpeed, velocityY * adjustedSpeed);
    }

    public attack() {
        if (this.attackOnCooldown) {
            return;
        }

        this.attacking = true;
        this.attackOnCooldown = true;
        this.play('playerHitting', true);
        this.shootProjectile();
        this.on('animationcomplete', () => {
            this.attacking = false;
            setTimeout(() => this.attackOnCooldown = false, this.attackCooldown);
        });
    }

    public gainExperience(value: number) {
        this.experience += value;
        if (this.experience >= this.experienceTillLevelup) {
            this.levelUp();
        }
        while (this.experience >= this.experienceTillLevelup) {
            if (this.handleAccessExperience()) {
                this.levelUp();
            }
        }
        (this.scene as GameScene).updateLevelbar(this.experience / this.experienceTillLevelup);
    }

    private handleAccessExperience(): boolean {
        this.experience = this.experience - this.experienceTillLevelup;
        return this.experience >= this.experienceTillLevelup;
    }

    private levelUp() {
        this.level++;
        this.experience = 0;
        this.experienceTillLevelup += 100;
        (this.scene as GameScene).showLevelUpDialog();
    }

    private shootProjectile() {
        const multiplier = Math.random() < this.critChance ? this.power * 2 : this.power; // Apply critical damage
        (this.scene as GameScene).gameState.projectiles.add(
            new Projectile(this.scene as GameScene, this.x + (this.flipX ? -5 : 5), this.y - 9, this.flipX, multiplier)
        );
    }

    public kill() {
        
    }
}