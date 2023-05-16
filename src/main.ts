import 'phaser';
import { GameScene } from './scenes/Game';
import { GameWindowData } from './types/GameWindowData';
import { FaviconAnimater } from './classes/FaviconAnimater';

const gameWindowData: GameWindowData = {
    width: 200,
    height: 150
}
const config = {
    width: gameWindowData.width,
    height: gameWindowData.height,
    zoom: 5,
    parent: 'gameContainer',
    pixelArt: true,
    roundPixels: false,
    antialias: false,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [GameScene]
};

new FaviconAnimater(document.getElementById('favicon'));
const game = new Phaser.Game(config);
game.scene.start('GameScene', gameWindowData);