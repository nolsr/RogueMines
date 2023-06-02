import 'phaser';
import { GameScene } from './scenes/Game';
import { GameWindowData } from './types/GameWindowData';
import { FaviconAnimater } from './classes/FaviconAnimater';

const WebFontConfig = {
    custom: {
        families: ['pzim'],
        urls: ['./styles.scss']
    }
};
const gameWindowData: GameWindowData = {
    width: 1250,
    height: 800
}
const config = {
    width: gameWindowData.width,
    height: gameWindowData.height,
    zoom: 1,
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