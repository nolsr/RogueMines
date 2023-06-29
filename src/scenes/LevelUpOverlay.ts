import 'phaser';
import { GameScene } from './Game';
import { Card } from '../classes/Card';
import { Button } from '../classes/Button';


export class LevelUpOverlay extends Phaser.Scene {

    gameScene: GameScene;
    cardOne: Card;
    cardTwo: Card;
    cardThree: Card;
    selectedCard: number;
    btnBack: Button;
    btnConfirm: Button;

    constructor(scene: GameScene) {
        super("LevelUpOverlay");
        this.gameScene = scene;
        this.selectedCard = -1;
    }

    preload() {
        this.load.image('card', '../assets/Card.png');
        this.load.image('cardOutline', '../assets/CardOutline.png');
        this.load.image('button', '../assets/Button.png');
        this.load.image('buttonPressed', '../assets/ButtonPressed.png');

        this.load.image('attackSpeedRune', '../assets/runes/AttackSpeedRune.png');
        this.load.image('critChanceRune', '../assets/runes/CritRune.png');
        this.load.image('damageRune', '../assets/runes/DamageRune.png');
        this.load.image('moveSpeedRune', '../assets/runes/MoveSpeedRune.png');
        this.load.image('projectileSpeedRune', '../assets/runes/ProjectileSpeedRune.png');
    }

    create() {
        const width = this.gameScene.view.width;
        const height = this.gameScene.view.height;

        // Backdrop
        this.add.renderTexture(0, 0, this.gameScene.view.width, this.gameScene.view.height).setOrigin(0, 0).fill(0x000, 0.8);

        this.cardOne = new Card(this, width / 6, height / 2);
        this.cardTwo = new Card(this, width / 2, height / 2);
        this.cardThree = new Card(this, 5 * width / 6, height / 2);

        this.input.on('gameobjectover', this.hoverCard.bind(this));
        this.input.on('gameobjectout', this.unselectCards.bind(this));
        this.input.on('gameobjectdown', this.selectCard.bind(this));
    }

    hoverCard(pointer: any, card: Card) {
        (card as Card).select();
    }

    selectCard(pointer: any, card: Card) {
        card.applyPowerup(this.gameScene.gameState.player);
        this.gameScene.levelText.text = this.gameScene.gameState.player.level.toString();
        this.gameScene.scene.resume();
        this.gameScene.scene.remove(this);
    }

    unselectCards(pointer: any, card: Card) {
        this.cardOne.unselect();
        this.cardTwo.unselect();
        this.cardThree.unselect();
    }
}