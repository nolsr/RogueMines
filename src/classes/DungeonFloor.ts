import { GameScene } from "../scenes/Game";
import { DungeonMap } from "../types/DungeonMap";
import { StairCoords } from "../types/StairCoords";
import { TileTypes } from "../types/Tiles";
import { Corridor } from "./Corridor";
import { Room } from "./Room";
import { randomBetween } from "./utils";

export class DungeonFloor {

    size: number;
    rooms: Array<Room>;
    corridors: Array<Corridor>;
    level: number;
    map: DungeonMap;
    scene: GameScene;
    stairCoords: StairCoords;

    constructor(scene: GameScene, size: number, level: number = 0) {
        this.scene = scene;
        this.size = size;
        this.rooms = [];
        this.corridors = [];
        this.level = level;
        this.generateMap(10);
    }

    private generateMap(roomCount: number) {
        this.map = Array.from(Array(this.size), _ => Array(this.size).fill(0));

        this.generateRooms(roomCount);
        this.generateCorridors();
        this.placeStairs();
        this.decorateFloor();

        this.spawnEnemies();
    }

    private decorateFloor() {
        this.map.forEach((row, rowIndex) => {
            row.forEach((tile, columnIndex) => {
                if (tile === TileTypes.FLOOR && Math.random() > 0.95) {
                    const tileId = randomBetween(1, 3);
                    switch (tileId) {
                        case 1:
                            this.map[rowIndex][columnIndex] = TileTypes.FLOOR_ALT_2;
                            break;
                        case 2:
                            this.map[rowIndex][columnIndex] = TileTypes.FLOOR_ALT_3;
                            break;
                        default:
                            this.map[rowIndex][columnIndex] = TileTypes.FLOOR_ALT;
                            break;
                    }
                }
            })
        })
    }

    private generateRooms(roomCount: number) {
        for (let i = 0; i < roomCount; i++) {
            const room = new Room(this.map, this.scene);
            if (!room.failedToPlace) {
                this.rooms.push(room);
            }
        }
        this.sortRoomsByLowestXCoords();
    }

    private generateCorridors() {
        for (let i = 0; i < this.rooms.length - 1; i++) {
            this.corridors.push(new Corridor(this.map, this.rooms[i].bounds, this.rooms[i + 1].bounds));
        }
    }

    private sortRoomsByLowestXCoords() {
        this.rooms.sort((a, b) => (a.bounds.xStart > b.bounds.xStart) ? 1 : ((b.bounds.xStart > a.bounds.xStart) ? -1 : 0))
    }

    private placeStairs() {
        this.stairCoords = this.rooms[randomBetween(1, this.rooms.length - 1)].placeStairs();
    }

    private spawnEnemies() {
        for (let i = 1; i < this.rooms.length; i++) {
            this.rooms[i].spawnEnemies(i);
        }
    }
}