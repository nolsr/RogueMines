import 'phaser';
import { MainMenu } from './scenes/MainMenu';
 
const config = {
    width: 800,
    height: 600,
    parent: 'gameContainer',
    pixelArt: true,
    scene: [MainMenu]
};

new Phaser.Game(config);