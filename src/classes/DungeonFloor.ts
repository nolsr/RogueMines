import { DungeonMap } from "../types/DungeonMap";
import { Room } from "./Room";
import { randomBetween } from "./utils";

export class DungeonFloor {
    size: number;
    rooms: Array<Room>;
    level: number;
    map: DungeonMap;

    constructor(size: number, level: number = 0) {
        this.size = size;
        this.rooms = [];
        this.level = level;
        this.generateMap(randomBetween(Math.floor(Math.sqrt(size)) / 2, Math.floor(Math.sqrt(size))));
    }

    private generateMap(roomCount: number) {
        this.map = Array.from(Array(this.size), _ => Array(this.size).fill(0));
        
        // Generating rooms
        for (let i = 0; i < roomCount; i++) {
            const room = new Room(this.map);
            if (!room.failedToPlace) {
                this.rooms.push(room);
            }
        }
        this.sortRoomsByLowestXCoords();

        // Generating corridors
        for (let i = 0; i < this.rooms.length - 1; i++) {
            this.rooms[i].buildCorridorTo(this.rooms[i + 1]);            
        }

        console.log(this.map);
    }

    private sortRoomsByLowestXCoords() {
        this.rooms.sort((a, b) => (a.bounds.xStart > b.bounds.xStart) ? 1 : ((b.bounds.xStart > a.bounds.xStart) ? -1 : 0))
    }
}