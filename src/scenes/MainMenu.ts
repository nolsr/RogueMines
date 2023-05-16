import 'phaser';

export class MainMenu extends Phaser.Scene {
    image: any;
    constructor() {
        super("PlayGame");
        console.log('working??');
    }
    preload() {
        this.load.image('logo', 'assets/phaser3-logo.png');    
    }
    create() {
        this.image = this.add.image(400, 300, 'logo').setScale(3);
    }
    update() {
        this.image.rotation += 0.01;   
    }
}