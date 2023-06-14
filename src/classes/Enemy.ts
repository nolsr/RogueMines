import { GameScene } from "../scenes/Game";
import { ExperienceOrb } from "./ExperienceOrb";
import { Player } from "./Player";

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
    health: number;
    maxHealth: number;
    speed: number;
    healthbar: Phaser.GameObjects.TileSprite;
    healthbarBackground: Phaser.GameObjects.TileSprite;
    isAggroed: boolean;
    spawnedInRoom: number;
    gameScene: GameScene;
    experienceValue: number;

    constructor(scene: GameScene, x: number, y: number, spawnedInRoom: number, type: string, speed: number, health: number, experienceValue: number) {
        super(scene, x, y, type);
        this.gameScene = scene;
        this.maxHealth = this.health = health * this.gameScene.floorData.enemyScaling;
        this.speed = speed * this.gameScene.floorData.enemyScaling;
        this.isAggroed = false;
        this.spawnedInRoom = spawnedInRoom;
        this.experienceValue = experienceValue;

        this.createAnimations();

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 1);
        this.setDepth(5);
        this.createHealthbar();
    }

    abstract createAnimations(): any;

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

    private kill() {
        this.generateDrops();

        this.healthbar.destroy();
        this.healthbarBackground.destroy();
        this.destroy();
    }

    private generateDrops() {
        (this.scene as GameScene).gameState.entities.add(new ExperienceOrb(this.scene as GameScene, this.x, this.y, this.experienceValue));
    }

    public applyDamage(damage: number) {
        this.health = this.health - damage;
        if (this.health <= 0) {
            this.kill();
        }
    }

    abstract move(targetX: number, targetY: number): any;

    public update() {
        this.move(this.gameScene.gameState.player.x, this.gameScene.gameState.player.y);
        this.updateHealthbar();

        this.scene.physics.world.overlap(this, (this.scene as GameScene).gameState.player, (skeleton, player) => {
            (player as Player).onDeath();
        });

    } 
}