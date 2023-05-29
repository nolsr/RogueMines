import 'phaser';
import { GameScene } from './Game';
import { Card } from '../classes/Card';


export class LevelUpOverlay extends Phaser.Scene {

    gameScene: GameScene;
    cardOne: Card;
    cardTwo: Card;
    cardThree: Card;
    selectedCard: number;

    constructor(scene: GameScene) {
        super("LevelUpOverlay");
        this.gameScene = scene;
        this.selectedCard = -1;
    }

    init() {
    }

    preload() {
        this.load.image('card', '../assets/Card.png');
        this.load.image('cardOutline', '../assets/CardOutline.png');
    }

    create() {
        // Backdrop
        this.add.renderTexture(0, 0, this.gameScene.view.width, this.gameScene.view.height).setOrigin(0, 0).fill(0x000, 0.5);

        const width = this.gameScene.view.width;
        const height = this.gameScene.view.height;
        this.cardOne = new Card(this, width / 6, height / 2);
        this.cardTwo = new Card(this, width / 2, height / 2);
        this.cardThree = new Card(this, 5 * width / 6, height / 2);

        this.input.on('gameobjectdown', this.selectCard.bind(this));
    }

    update() {

    }

    selectCard(pointer: any, card: Card) {
        this.cardOne.unselect();
        this.cardTwo.unselect();
        this.cardThree.unselect();
        (card as Card).select();
    }
}