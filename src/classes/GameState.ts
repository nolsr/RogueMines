import { DungeonFloor } from "./DungeonFloor";
import { Player } from "./Player";

export class GameState {
    currentFloor: DungeonFloor;
    currentTileMap: Phaser.Tilemaps.Tilemap;
    player: Player;
    enemies: Phaser.Physics.Arcade.Group;
    projectiles: Phaser.Physics.Arcade.Group;
    entities: Phaser.Physics.Arcade.Group;
    levelbar: Phaser.GameObjects.Image;
    levelProgress: Phaser.GameObjects.TileSprite;
    levelbarOriginX: number;
    tilemaplayer: Phaser.Tilemaps.TilemapLayer;

    constructor() { }
}