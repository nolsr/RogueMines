import { GameScene } from "../scenes/Game";
import { DungeonMap } from "../types/DungeonMap";
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

    constructor(scene: GameScene, size: number, level: number = 0) {
        this.scene = scene;
        this.size = size;
        this.rooms = [];
        this.corridors = [];
        this.level = level;
        this.generateMap(5);
    }

    private generateMap(roomCount: number) {
        this.map = Array.from(Array(this.size), _ => Array(this.size).fill(0));

        // Generating rooms
        for (let i = 0; i < roomCount; i++) {
            const room = new Room(this.map, this.scene);
            if (!room.failedToPlace) {
                this.rooms.push(room);
            }
        }
        this.sortRoomsByLowestXCoords();

        // Generating corridors
        for (let i = 0; i < this.rooms.length - 1; i++) {
            this.corridors.push(new Corridor(this.map, this.rooms[i].bounds, this.rooms[i + 1].bounds));
        }

        this.placeStairs();

        this.spawnEnemies();
    }

    private sortRoomsByLowestXCoords() {
        this.rooms.sort((a, b) => (a.bounds.xStart > b.bounds.xStart) ? 1 : ((b.bounds.xStart > a.bounds.xStart) ? -1 : 0))
    }

    private placeStairs() {
        this.rooms[randomBetween(1, this.rooms.length - 1)].placeStairs();
    }

    private spawnEnemies() {
        for (let i = 1; i < this.rooms.length; i++) {
            this.rooms[i].spawnEnemies(i);            
        }
    }
}