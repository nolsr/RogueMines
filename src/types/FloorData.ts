import { PlayerData } from "./PlayerData";

export type FloorData = {
    floor: number;
    playerData: PlayerData;
    enemyScaling: number;
}