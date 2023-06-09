import 'phaser';
import { DungeonMap } from '../types/DungeonMap';
import { RoomBounds } from '../types/RoomBounds';
import { randomBetween } from './utils';
import { TileTypes } from '../types/Tiles';

const marginX = 3;
const marginY = 4;

export class Corridor {
    map: DungeonMap;
    startRoomBounds: RoomBounds;
    targetRoomBounds: RoomBounds;

    horizontalCorridorBounds: RoomBounds;
    verticalCorridorBounds: RoomBounds;

    constructor(map: DungeonMap, startBounds: RoomBounds, targetBounds: RoomBounds) {
        this.map = map;
        this.startRoomBounds = startBounds;
        this.targetRoomBounds = targetBounds;

        this.generateCorridor();
    }

    private generateCorridor() {
        this.generateHorizontalCorridor();
        this.generateVerticalCorridor();
        this.printCorridor();
        this.decorateCorridor();
    }

    private generateHorizontalCorridor() {
        const xStart = this.startRoomBounds.xEnd;
        const xEnd = randomBetween(this.targetRoomBounds.xStart + marginX, this.targetRoomBounds.xEnd - marginX);
        const y = randomBetween(this.startRoomBounds.yStart + marginY, this.startRoomBounds.yEnd - marginY);

        this.horizontalCorridorBounds = {
            xStart,
            xEnd,
            centerX: Math.min(xStart + (xEnd - xStart) / 2), // TODO Remove decimal place
            yStart: y - 1,
            yEnd: y + 1,
            centerY: y
        };
    }

    private generateVerticalCorridor() {
        const yStart = this.horizontalCorridorBounds.yStart;
        const yEnd = randomBetween(this.targetRoomBounds.yStart + marginY, this.targetRoomBounds.yEnd - marginY);
        const x = this.horizontalCorridorBounds.xEnd - 1;

        this.verticalCorridorBounds = {
            xStart: x - 1,
            xEnd: x + 1,
            centerX: x,
            yStart,
            yEnd,
            centerY: Math.min(yStart + (yEnd - yStart) / 2)
        };
    }

    public printCorridor() {
        if (this.horizontalCorridorBounds.xStart < this.horizontalCorridorBounds.xEnd) {
            this.map[this.horizontalCorridorBounds.yStart - 1][this.horizontalCorridorBounds.xStart + 1] = TileTypes.WALL_FRONT_RIGHT_EDGE;
        }

        for (let i = this.horizontalCorridorBounds.xStart; i <= this.horizontalCorridorBounds.xEnd; i++) {
            this.map[this.horizontalCorridorBounds.yStart][i] = TileTypes.FLOOR;
            this.map[this.horizontalCorridorBounds.centerY][i] = TileTypes.FLOOR;
            this.map[this.horizontalCorridorBounds.yEnd][i] = TileTypes.FLOOR;
        }

        const heightDiff = Math.abs(this.verticalCorridorBounds.yStart - this.verticalCorridorBounds.yEnd);
        for (let i = 0; i <= heightDiff; i++) {
            const faktor = this.verticalCorridorBounds.yStart > this.verticalCorridorBounds.yEnd ? -1 : 1;
            this.map[this.verticalCorridorBounds.yStart + i * faktor][this.verticalCorridorBounds.xStart] = TileTypes.FLOOR;
            this.map[this.verticalCorridorBounds.yStart + i * faktor][this.verticalCorridorBounds.centerX] = TileTypes.FLOOR;
            this.map[this.verticalCorridorBounds.yStart + i * faktor][this.verticalCorridorBounds.xEnd] = TileTypes.FLOOR;
        }
    }

    private decorateCorridor() {
        for (let i = this.horizontalCorridorBounds.xStart; i <= this.horizontalCorridorBounds.xEnd; i++) {
            if (this.map[this.horizontalCorridorBounds.yEnd + 1][i] === TileTypes.BACKGROUND ||
                this.map[this.horizontalCorridorBounds.yEnd + 1][i] === TileTypes.FOUNDATION_LEFT ||
                this.map[this.horizontalCorridorBounds.yEnd + 1][i] === TileTypes.FOUNDATION_RIGHT)
                this.map[this.horizontalCorridorBounds.yEnd + 1][i] = TileTypes.FOUNDATION_BOTTOM;
        }
        for (let i = this.verticalCorridorBounds.yStart > this.verticalCorridorBounds.yEnd ? -2 : 0; i <= Math.abs(this.verticalCorridorBounds.yStart - this.verticalCorridorBounds.yEnd); i++) {
            const faktor = this.verticalCorridorBounds.yStart > this.verticalCorridorBounds.yEnd ? -1 : 1;
            if (this.map[this.verticalCorridorBounds.yStart + i * faktor][this.verticalCorridorBounds.xStart - 1] === TileTypes.BACKGROUND) {
                if (Math.random() < 0.7) {
                    this.map[this.verticalCorridorBounds.yStart + i * faktor][this.verticalCorridorBounds.xStart - 1] = TileTypes.FOUNDATION_LEFT
                }
            }

            if (this.map[this.verticalCorridorBounds.yStart + i * faktor][this.verticalCorridorBounds.xEnd + 1] === TileTypes.BACKGROUND) {
                if (Math.random() < 0.7) {
                    this.map[this.verticalCorridorBounds.yStart + i * faktor][this.verticalCorridorBounds.xEnd + 1] = TileTypes.FOUNDATION_RIGHT
                }
            }
        }
    }
}