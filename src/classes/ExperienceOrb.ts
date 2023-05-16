import { GameScene } from "../scenes/Game";
import { Player } from "./Player";

export class ExperienceOrb extends Phaser.Physics.Arcade.Sprite {
    experienceValue: number;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'xpDrop');
        this.experienceValue = 50;


        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    public checkPickup() {
        this.scene.physics.world.overlap(this, (this.scene as GameScene).gameState.player, (a, b) => {
            (b as Player).gainExperience(this.experienceValue);
            a.destroy();
        });
    }
}