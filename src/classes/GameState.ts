import { Player } from "./Player";

export class GameState {
    floor: Phaser.GameObjects.TileSprite;
    player: Player;
    enemies: Phaser.Physics.Arcade.Group;
    projectiles: Phaser.Physics.Arcade.Group;
    entities: Phaser.Physics.Arcade.Group;
    levelbar: Phaser.GameObjects.Image;
    levelProgress: Phaser.GameObjects.TileSprite;
    levelbarOriginX: number;

    constructor() { }
}