import 'phaser';
import { GameScene } from './Game';
import { Card } from '../classes/Card';
import { Button } from '../classes/Button';


export class GameOverOverlay extends Phaser.Scene {

    gameScene: GameScene;
    resetButton: Button;

    constructor(scene: GameScene) {
        super("GameOverOverlay");
        this.gameScene = scene;
    }

    preload() {
        this.load.image('button', '../assets/Button.png');
        this.load.image('buttonOutline', '../assets/ButtonOutline.png');
    }

    create() {
        // Backdrop
        this.add.renderTexture(0, 0, this.gameScene.view.width, this.gameScene.view.height).setOrigin(0, 0).fill(0x000, 0.8);

        this.add.text(this.gameScene.view.width / 2, this.gameScene.view.height / 2 - 100, 'You Died!', { color: '#E83B3B' }).setOrigin(0.5, 0.5).setScale(8);
        this.add.text(this.gameScene.view.width / 2, this.gameScene.view.height / 2 - 25, 'You reached floor ' + this.gameScene.floorData.floor, { color: '#FBB954' }).setOrigin(0.5, 0.5).setScale(2);
        this.resetButton = new Button(this, this.gameScene.view.width / 2, this.gameScene.view.height / 2 + 100, 'Restart');
        
        this.input.on('gameobjectover', this.hoverButton.bind(this));
        this.input.on('gameobjectout', this.unselectButton.bind(this));
        this.input.on('gameobjectdown', this.restartClick.bind(this));
    }

    restartClick(pointer: any, button: Button) {
        this.gameScene.restart();
        this.gameScene.scene.remove(this);
    }

    hoverButton(pointer: any, button: Button) {
        button.select();
    }

    unselectButton(pointer: any, button: Button) {
        button.unselect();
    }

}