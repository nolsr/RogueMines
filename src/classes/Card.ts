import { LevelUpOverlay } from "../scenes/LevelUpOverlay";
import { UpgradeType } from "../types/UpgradeType";
import { Player } from "./Player";

export class Card extends Phaser.GameObjects.Image {
    selected: boolean;
    outline: Phaser.GameObjects.Image;
    type: UpgradeType;
    powerUpValue: number;

    constructor(scene: LevelUpOverlay, x: number, y: number) {
        super(scene, x, y, 'card');

        this.selected = false;
        this.outline = scene.add.image(x, y, 'cardOutline').setDepth(1).setScale(5);
        this.outline.setAlpha(0, 0, 0, 0);

        scene.add.existing(this);
        this.setScale(5);
        this.setInteractive();
        this.type = this.randomType();
        this.powerUpValue = this.generatepowerUpValue();

        this.printCardContent();
    }

    select() {
        this.selected = true;
        this.outline.setAlpha(1, 1, 1, 1);
    }

    unselect() {
        this.selected = false;
        this.outline.setAlpha(0, 0, 0, 0);
    }

    printCardContent() {
        switch (this.type) {
            case UpgradeType.ATTACK_SPEED:
                this.scene.add.image(this.x, this.y - 50, 'attackSpeedRune').setDepth(2).setScale(5);
                this.scene.add.text(this.x + 1, this.y + 40, 'ATSPD', { font: 'Code', fontSize: '50px', color: 'grey' })
                    .setOrigin(0.5, 0.5).setDepth(2).setScale(5);
                this.scene.add.text(this.x + 1, this.y + 100, '+' + this.powerUpValue + '%',
                    { font: 'Code', fontSize: '50px', color: '#b33831' }).setScale(5).setOrigin(0.5, 0.5).setDepth(2);
                break;
            case UpgradeType.MOVE_SPEED:
                this.scene.add.image(this.x, this.y - 50, 'moveSpeedRune').setDepth(2).setScale(5);
                this.scene.add.text(this.x + 1, this.y + 40, 'MVSPD', { font: 'Code', fontSize: '50px', color: 'grey' })
                    .setOrigin(0.5, 0.5).setDepth(2).setScale(5);
                this.scene.add.text(this.x + 1, this.y + 100, '+' + this.powerUpValue + '%',
                    { font: 'Code', fontSize: '50px', color: '#b33831' }).setScale(5).setOrigin(0.5, 0.5).setDepth(2);
                break;
            case UpgradeType.DAMAGE:
                this.scene.add.image(this.x, this.y - 50, 'damageRune').setDepth(2).setScale(5);
                this.scene.add.text(this.x + 1, this.y + 40, 'DMG', { font: 'Code', fontSize: '50px', color: 'grey' })
                    .setOrigin(0.5, 0.5).setDepth(2).setScale(5);
                this.scene.add.text(this.x + 1, this.y + 100, '+' + this.powerUpValue + '%',
                    { font: 'Code', fontSize: '50px', color: '#b33831' }).setScale(5).setOrigin(0.5, 0.5).setDepth(2);
                break;
            case UpgradeType.CRIT_CHANCE:
                this.scene.add.image(this.x, this.y - 50, 'critChanceRune').setDepth(2).setScale(5);
                this.scene.add.text(this.x + 1, this.y + 40, 'CRIT', { font: 'Code', fontSize: '50px', color: 'grey' })
                    .setOrigin(0.5, 0.5).setDepth(2).setScale(5);
                this.scene.add.text(this.x + 1, this.y + 100, '+' + this.powerUpValue + '%',
                    { font: 'Code', fontSize: '50px', color: '#b33831' }).setScale(5).setOrigin(0.5, 0.5).setDepth(2);
                break;
            case UpgradeType.PROJ_SPEED:
                this.scene.add.image(this.x, this.y - 50, 'projectileSpeedRune').setDepth(2).setScale(5);
                this.scene.add.text(this.x + 1, this.y + 40, 'PJSPD', { font: 'Code', fontSize: '50px', color: 'grey' })
                    .setOrigin(0.5, 0.5).setDepth(2).setScale(5);
                this.scene.add.text(this.x + 1, this.y + 100, '+' + this.powerUpValue + '%',
                    { font: 'Code', fontSize: '50px', color: '#b33831' }).setScale(5).setOrigin(0.5, 0.5).setDepth(2);
                break;
        }
    }

    applyPowerup(player: Player) {
        switch (this.type) {
            case UpgradeType.ATTACK_SPEED:
                player.attackCooldown -= player.attackCooldown * this.powerUpValue / 100;
                break;
            case UpgradeType.MOVE_SPEED:
                player.speed = player.speed * (1 + this.powerUpValue / 100);
                break;
            case UpgradeType.DAMAGE:
                player.power = player.power * (1 + this.powerUpValue / 100);
                break;
            case UpgradeType.CRIT_CHANCE:
                player.critChance += this.powerUpValue / 100;
                break;
            case UpgradeType.PROJ_SPEED:
                player.projectileSpeed = player.projectileSpeed * (1 + this.powerUpValue / 100);
        }
    }

    private generatepowerUpValue(): number {
        const minPercentage = this.type === UpgradeType.PROJ_SPEED ? 15 : 5;
        const maxPercentage = this.type === UpgradeType.CRIT_CHANCE ? 15 : 25;

        const randomValue = Math.random();

        const upgradeValue = minPercentage + (maxPercentage - minPercentage) * Math.pow(randomValue, 2);
        return Number(upgradeValue.toFixed(0));
    }

    private randomType(): UpgradeType {
        const upgradeTypeValues = Object.values(UpgradeType);
        const i = Math.floor(Math.random() * upgradeTypeValues.length);
        return upgradeTypeValues[i];
    }
}