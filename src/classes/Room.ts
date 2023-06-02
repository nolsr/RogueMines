import { DungeonMap } from "../types/DungeonMap";
import { RoomBounds } from "../types/RoomBounds";
import { TileTypes } from "../types/Tiles";
import { randomBetween } from "./utils";

const retries = 15;
const marginX = 4;
const marginY = 7;

export class Room {
    map: DungeonMap;
    bounds: RoomBounds;
    width: number;
    height: number;
    failedToPlace: boolean;

    constructor(map: DungeonMap) {
        this.failedToPlace = false;

        this.map = map;
        this.generateRoom();
        if (!this.failedToPlace) {
            this.printRoomToMap();
        }
    }

    private generateRoom() {
        this.width = randomBetween(10, 20);
        this.height = randomBetween(10, 20);
        const xMax = this.map.length - marginX - this.width;
        const yMax = this.map.length - marginY - this.height;

        let xStart = 0, yStart = 0;
        for (let i = 0; i < retries; i++) {
            xStart = randomBetween(5, xMax);
            yStart = randomBetween(5, yMax);

            if (!this.collidesWithOtherRoom(xStart, yStart)) {
                break;
            }
            if (i == retries - 1) {
                this.failedToPlace = true;
                console.error('Could not add room!');
            }
        }

        this.bounds = {
            xStart,
            xEnd: xStart + this.width,
            yStart,
            yEnd: yStart + this.height
        }
    }

    private collidesWithOtherRoom(xStart: number, yStart: number): boolean {
        const xMin = xStart - marginX < 0 ? 0 : xStart - marginX;
        const xMax = xStart + this.width + marginX > this.map.length ? this.map.length : xStart + this.width + marginX;
        const yMin = yStart - marginY < 0 ? 0 : yStart - marginY;
        const yMax = yStart + this.height + marginY > this.map.length ? this.map.length : yStart + this.height + marginY;
    
        for (let x = xMin; x < xMax; x++) {
            for (let y = yMin; y < yMax; y++) {
                if (this.map[y][x] === TileTypes.FLOOR) {
                    return true;
                }
            }
        }
        return false;
    }

    private printRoomToMap() {
        this.printFloor();
        this.printWalls();
        this.printShadows();
    }

    private printFloor() {
        this.map.forEach((row, rowIndex) => {
            row.forEach((tile, columnIndex) => {
                if (
                    columnIndex >= this.bounds.xStart &&
                    columnIndex <= this.bounds.xEnd &&
                    rowIndex >= this.bounds.yStart &&
                    rowIndex <= this.bounds.yEnd
                ) {
                    this.map[rowIndex][columnIndex] = TileTypes.FLOOR;
                }
            });
        });
    }

    private printWalls() {
        for (let i = 0; i <= this.width; i++) {
            this.map[this.bounds.yStart - 2][this.bounds.xStart + i] = TileTypes.WALL_TOP;
            this.map[this.bounds.yStart - 1][this.bounds.xStart + i] = TileTypes.WALL_FRONT;
            this.map[this.bounds.yStart + this.height + 1][this.bounds.xStart + i] = TileTypes.WALL_FLAT;
            this.map[this.bounds.yStart + this.height + 2][this.bounds.xStart + i] = TileTypes.WALL_FRONT;
            this.map[this.bounds.yStart + this.height + 3][this.bounds.xStart + i] = TileTypes.FOUNDATION_BOTTOM;
        }
        this.map[this.bounds.yStart - 1][this.bounds.xStart] = TileTypes.WALL_FRONT_LEFT_EDGE;
        this.map[this.bounds.yStart - 1][this.bounds.xStart + this.width] = TileTypes.WALL_FRONT_RIGHT_EDGE;
        this.map[this.bounds.yStart + this.height + 2][this.bounds.xStart - 1] = TileTypes.WALL_FRONT_LEFT_EDGE;
        this.map[this.bounds.yStart + this.height + 2][this.bounds.xStart + this.width + 1] = TileTypes.WALL_FRONT_RIGHT_EDGE;
        this.map[this.bounds.yStart + this.height + 3][this.bounds.xStart - 1] = TileTypes.FOUNDATION_BOTTOM;
        this.map[this.bounds.yStart + this.height + 3][this.bounds.xStart + this.width + 1] = TileTypes.FOUNDATION_BOTTOM;
        this.map[this.bounds.yStart + this.height + 3][this.bounds.xStart - 2] = TileTypes.FOUNDATION_LEFT;

        for (let i = 0; i <= this.height + 3; i++) {
            this.map[this.bounds.yStart - 2 + i][this.bounds.xStart - 1] = TileTypes.WALL_LEFT_EDGE;
            if (Math.random() > 0.3) {
                this.map[this.bounds.yStart - 2 + i][this.bounds.xStart - 2] = TileTypes.FOUNDATION_LEFT;
            }
        }
        for (let i = 0; i <= this.height + 3; i++) {
            this.map[this.bounds.yStart - 2 + i][this.bounds.xStart + this.width + 1] = TileTypes.WALL_RIGHT_EDGE;
            if (Math.random() > 0.3) {
                this.map[this.bounds.yStart - 2 + i][this.bounds.xStart + this.width + 2] = TileTypes.FOUNDATION_RIGHT;
            }
        }
    }

    private printShadows() {
        this.map[this.bounds.yStart][this.bounds.xStart] = TileTypes.SHADOW_CORNER;
        for (let i = 1; i <= this.width; i++) {
            this.map[this.bounds.yStart][this.bounds.xStart + i] = TileTypes.SHADOW_TOP;
        }
        for (let i = 1; i <= this.height; i++) {
            this.map[this.bounds.yStart + i][this.bounds.xStart] = TileTypes.SHADOW_LEFT;
        }
    }

    public buildCorridorTo(room: Room) {
        const midX = Math.floor(this.bounds.xStart + this.width / 2);
        const midY = Math.floor(this.bounds.yStart + this.height / 2);
        const targetMidX = Math.floor(room.bounds.xStart + room.width / 2);
        let targetMidY = Math.floor(room.bounds.yStart + room.height / 2);
        const deltaX = Math.abs(midX - targetMidX);
        const deltaY = Math.abs(midY - targetMidY);
        const incrementX = midX - targetMidX < 0;
        const incrementY = midY - targetMidY < 0;

        if (targetMidY == this.bounds.yStart) {
            targetMidY++;
        } else if (targetMidY == this.bounds.yEnd) {
            targetMidY--;
        }

        for (let i = 0; i < deltaY + 2; i++) {
            this.map[midY + (incrementY ? i : -i)][midX - 1] = TileTypes.FLOOR;
            this.map[midY + (incrementY ? i : -i)][midX] = TileTypes.FLOOR;
            this.map[midY + (incrementY ? i : -i)][midX + 1] = TileTypes.FLOOR;
        }
        for (let i = 0; i < deltaX + 2; i++) {
            this.map[targetMidY - 1][midX + (incrementX ? i : -i)] = TileTypes.FLOOR;
            this.map[targetMidY][midX + (incrementX ? i : -i)] = TileTypes.FLOOR;
            this.map[targetMidY + 1][midX + (incrementX ? i : -i)] = TileTypes.FLOOR;
        }
    }
}