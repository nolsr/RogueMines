import { GameScene } from "../scenes/Game";
import SkewQuad from "../shaders/SkewQuad";
import { PlayerData } from "../types/PlayerData";
import { Projectile } from "./Projectile";

export class Player extends Phaser.Physics.Arcade.Sprite {
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
    gameScene: GameScene;
    shadow: Phaser.GameObjects.Sprite;
    shadowScaleY: number;

    constructor(scene: GameScene, x: number, y: number, playerData: PlayerData) {
        super(scene, x, y, 'player');
        this.speed = playerData.speed;
        this.attackOnCooldown = false;
        this.attackCooldown = playerData.attackCooldown;
        this.experience = playerData.experience;
        this.experienceTillLevelup = playerData.experienceTillLevelup;
        this.level = playerData.level;
        this.power = playerData.power;
        this.critChance = playerData.critChance;
        this.gameScene = scene;

        this.createAnimations();

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setSize(10, 14);
        this.setOffset(3, 2);

        this.setOrigin(0.5, 1)
        this.setCollideWorldBounds(true);
        this.setDepth(10);

        (this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.add('skewQuad', new SkewQuad(this.scene.game));
        this.shadow = this.scene.add.sprite(x, y, 'player');
        this.shadowScaleY = 0.8;
        this.shadow.y = this.shadow.y + (this.shadow.height * (1 - this.shadowScaleY)) / 2;
        this.shadow.scaleY = this.shadowScaleY;
        this.shadow.tint = 0x000000;
        this.shadow.alpha = 0.5;
        this.shadow.setPipeline('skewQuad');
        this.shadow.pipeline.set1f('inHorizontalSkew', 0.2);
        this.shadow.setOrigin(0.5, 1);
    }

    private createAnimations() {
        this.scene.anims.create({
            key: 'playerMoving',
            frames: this.scene.anims.generateFrameNumbers('playerNew', { start: 0, end: 7 }),
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
        this.shadow.x = this.x + 6;
        this.shadow.y = this.y;

        if (this.body?.velocity.x != 0 || this.body?.velocity.y != 0) {
            if (this.body!.velocity.x !== 0) {
                this.flipX = this.body!.velocity.x < 0;
                this.shadow.flipX = this.flipX;
            }
            if (!this.attacking) {
                this.play('playerMoving', true);
                this.shadow.play('playerMoving', true);
            }
        } else {
            if (!this.attacking) {
                this.play('playerStanding', true);
                this.shadow.play('playerStanding', true);
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
        this.gameScene.updateLevelbar(this.experience / this.experienceTillLevelup);
    }

    private handleAccessExperience(): boolean {
        this.experience = this.experience - this.experienceTillLevelup;
        return this.experience >= this.experienceTillLevelup;
    }

    private levelUp() {
        this.level++;
        this.experience = this.experience - this.experienceTillLevelup;
        this.experienceTillLevelup += 100;
        this.gameScene.showLevelUpDialog();
    }

    private shootProjectile() {
        const multiplier = Math.random() < this.critChance ? this.power * 2 : this.power; // Apply critical damage
        this.gameScene.gameState.projectiles.add(
            new Projectile(this.gameScene, this.x + (this.flipX ? -5 : 5), this.y - 9, this.flipX, multiplier)
        );
    }

    public onDeath() {
        this.gameScene.showDeathScreen();
    }

    public getPlayerData(): PlayerData {
        return {
            speed: this.speed,
            experience: this.experience,
            experienceTillLevelup: this.experienceTillLevelup,
            level: this.level,
            attackCooldown: this.attackCooldown,
            power: this.power,
            critChance: this.critChance
        };
    }
}