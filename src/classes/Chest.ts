import { GameScene } from "../scenes/Game";
import { Enemy } from "./Enemy";
import { ExperienceOrb } from "./ExperienceOrb";

export class Chest extends Enemy {
    constructor(scene: GameScene, x: number, y: number, spawnedInRoom: number) {
        super(scene, x, y, spawnedInRoom, 'chest', 0, 500, 0);
    }

    createAnimations() {
        return;
    }
    move(targetX: number, targetY: number) {
        this.setVelocity(0);
    }


    protected override generateDrops() {
        this.gameScene.gameState.entities.add(new ExperienceOrb(this.scene as GameScene, this.x, this.y, this.gameScene.gameState.player?.experienceTillLevelup));
    }

}