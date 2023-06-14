import { GameScene } from "../scenes/Game";
import { DungeonMap } from "../types/DungeonMap";
import { RoomBounds } from "../types/RoomBounds";
import { StairCoords } from "../types/StairCoords";
import { TileTypes } from "../types/Tiles";
import { Enemy } from "./Enemy";
import { Ghost } from "./Ghost";
import { Knight } from "./Knight";
import { Skeleton } from "./Skeleton";
import { randomBetween } from "./utils";

const retries = 15;
const marginX = 5;
const marginY = 7;

export class Room {
    map: DungeonMap;
    bounds: RoomBounds;
    width: number;
    height: number;
    failedToPlace: boolean;
    gameScene: GameScene;
    playerEntered: boolean;
    roomIndex: number;

    constructor(map: DungeonMap, scene: GameScene) {
        this.failedToPlace = false;
        this.gameScene = scene;
        this.playerEntered = false;

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
            centerX: Math.min(xStart + this.width / 2),
            yStart,
            yEnd: yStart + this.height,
            centerY: Math.min(yStart + this.height / 2)
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

    public placeStairs(): StairCoords {
        const x = this.bounds.xStart + randomBetween(0, this.width);
        const y = this.bounds.yStart + randomBetween(0, this.height);
        this.map[y][x] = TileTypes.STAIRS;
        return { x, y };
    }

    public spawnEnemies(roomIndex: number) {
        this.roomIndex = roomIndex;
        const enemyCount = Math.round(this.width * this.height / 100);
        for (let i = 0; i < enemyCount; i++) {
            if (Math.random() > 0.1) {
                this.gameScene.gameState.enemies.add(
                    new Knight(this.gameScene, randomBetween(this.bounds.xStart + 3, this.bounds.xEnd - 3) * 8, randomBetween(this.bounds.yStart + 4, this.bounds.yEnd - 4) * 8, roomIndex)
                );
            } else {
                this.gameScene.gameState.enemies.add(
                    new Skeleton(this.gameScene, randomBetween(this.bounds.xStart + 1, this.bounds.xEnd - 1) * 8, randomBetween(this.bounds.yStart + 2, this.bounds.yEnd - 2) * 8, roomIndex)
                );
            }
        }
        if (Math.random() < 0.6) {
            this.gameScene.gameState.enemiesUnaffectedByWalls.add(
                new Ghost(this.gameScene, randomBetween(this.bounds.xStart + 1, this.bounds.xEnd - 1) * 8, randomBetween(this.bounds.yStart + 2, this.bounds.yEnd - 2) * 8, roomIndex)
            );
        }
    }

    public onEnterRoom() {
        if (this.playerEntered) {
            return;
        }
        this.playerEntered = true;

        this.activateEnemies();
    }

    private activateEnemies() {
        this.gameScene.gameState.enemies.getChildren().forEach(e => {
            if ((e as Enemy).spawnedInRoom === this.roomIndex) {
                (e as Enemy).isAggroed = true;
            }
        });
    }
}