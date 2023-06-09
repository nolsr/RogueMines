import 'phaser';
import { GameState } from '../classes/GameState';
import { GameWindowData } from '../types/GameWindowData';
import { Player } from '../classes/Player';
import { Skeleton } from '../classes/Skeleton';
import { Projectile } from '../classes/Projectile';
import { ExperienceOrb } from '../classes/ExperienceOrb';
import { LevelUpOverlay } from './LevelUpOverlay';
import { DungeonFloor } from '../classes/DungeonFloor';
import { TileTypes } from '../types/Tiles';

export class GameScene extends Phaser.Scene {

    public gameState: GameState;
    view: GameWindowData;
    keyboard: any;
    levelText: Phaser.GameObjects.Text;

    constructor() {
        super('GameScene');
    }
    init(gameWindowData: GameWindowData) {
        this.view = gameWindowData;
        this.gameState = new GameState();
    }

    preload() {
        this.load.spritesheet('player', '../assets/PlayerSprite.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('skeleton', '../assets/SkeletonSprite.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('floor', '../assets/FloorTile.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('fistProjectile', '../assets/FistProjectile.png', { frameWidth: 8, frameHeight: 4 });

        this.load.image('tileset', '../assets/tilemap/tileset.png');
        this.load.image('healthbarBG', '../assets/HealthbarBackground.png');
        this.load.image('healthbarFG', '../assets/HealthbarForeground.png');
        this.load.image('levelbar', '../assets/Levelbar.png');
        this.load.image('levelbarProgressCircle', '../assets/LevelbarProgressCircle.png');
        this.load.image('levelbarProgress', '../assets/LevelbarProgress.png');
        this.load.image('xpDrop', '../assets/ExperienceDrop.png');

        this.load.audio('music', '../assets/audio/background_music.mp3');
    }

    create() {
        this.gameState.enemies = this.physics.add.group();
        this.gameState.projectiles = this.physics.add.group();
        this.gameState.entities = this.physics.add.group();

        // Tilemap
        this.generateFloor();

        const spawnRoom = this.gameState.currentFloor.rooms[0];
        this.gameState.player = new Player(this, (spawnRoom.bounds.xStart + spawnRoom.width / 2) * 8, (spawnRoom.bounds.yStart + spawnRoom.height / 2) * 8);

        this.physics.world.enable(this.gameState.player);
        this.physics.add.collider(this.gameState.player, this.gameState.tilemaplayer as Phaser.Tilemaps.TilemapLayer);
        this.physics.add.collider(this.gameState.enemies, this.gameState.tilemaplayer as Phaser.Tilemaps.TilemapLayer);
        this.physics.add.collider(this.gameState.enemies, this.gameState.enemies);

        this.cameras.main.setBounds(0, 0, this.view.width, this.view.height);
        this.cameras.main.setZoom(5);
        this.cameras.main.startFollow(this.gameState.player);


        // Sound
        this.sound.add('music', { mute: true, volume: 0.05, rate: 1, loop: true }).play();

        // UI
        this.gameState.levelbar = this.add.image(this.view.width / 2, this.view.height / 2 + 70, 'levelbar')
            .setDepth(15)
            .setScrollFactor(0, 0);
        this.gameState.levelbarOriginX =
            this.add.image(this.view.width / 2 - this.gameState.levelbar.width / 2 + 4, this.view.height / 2 + 70, 'levelbarProgressCircle')
                .setDepth(15)
                .setScrollFactor(0, 0)
                .x;
        this.gameState.levelProgress = this.add.tileSprite(this.gameState.levelbarOriginX, this.view.height / 2 + 70, 0, 2, 'levelbarProgress')
            .setOrigin(0, 0.5)
            .setDepth(15)
            .setScrollFactor(0, 0);

        this.levelText = this.add.text(this.view.width / 2, this.view.height / 2 + 65, '1', { color: '#ccc', fontFamily: 'pzim', fontSize: '10px' })
            .setOrigin(0.5, 1)
            .setDepth(15)
            .setScrollFactor(0, 0);


        // Controls
        this.keyboard = this.input.keyboard!.addKeys('W,A,S,D,SPACE');
    }

    update() {
        this.handleUserInput();
        this.gameState.player.update();
        this.gameState.enemies.getChildren().forEach(skeleton => (skeleton as Skeleton).move(this.gameState.player.x, this.gameState.player.y));
        this.gameState.projectiles.getChildren().forEach(projectile => (projectile as Projectile).checkCollision());
        this.gameState.entities.getChildren().forEach(entity => (entity as ExperienceOrb).checkPickup());
        this.checkRoomsEntered();
        this.checkPlayerOnStairs();
    }

    checkPlayerOnStairs() {
        
    }

    checkRoomsEntered() {
        this.gameState.currentFloor.rooms.forEach(room => {
            if (this.gameState.player.x / 8 >= room.bounds.xStart &&
                this.gameState.player.x / 8 <= room.bounds.xEnd &&
                this.gameState.player.y / 8 >= room.bounds.yStart &&
                this.gameState.player.y / 8 <= room.bounds.yEnd) {
                    room.onEnterRoom();
            }
            
        });
    }

    showLevelUpDialog() {
        this.scene.pause();
        this.game.scene.add('levelUpOverlay', new LevelUpOverlay(this), true);
    }

    updateLevelbar(progress: number) {
        const fullWidth = 2 + this.gameState.levelbar.width - 10;
        this.gameState.levelProgress.width = fullWidth * progress;
    }

    generateFloor() {
        this.gameState.currentFloor = new DungeonFloor(this, 100);
        const mapConfig = {
            data: this.gameState.currentFloor.map,
            tileWidth: 8,
            tileHeight: 8,
            width: this.gameState.currentFloor.size,
            height: this.gameState.currentFloor.size
        };
        this.gameState.currentTileMap = this.make.tilemap(mapConfig);
        const tiles = this.gameState.currentTileMap.addTilesetImage('tileset');
        this.gameState.tilemaplayer = this.gameState.currentTileMap.createLayer(0, tiles as Phaser.Tilemaps.Tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;

        const unpassableTileIds = [
            TileTypes.BACKGROUND,
            TileTypes.WALL_FLAT,
            TileTypes.WALL_LEFT_EDGE,
            TileTypes.WALL_RIGHT_EDGE,
            TileTypes.WALL_TOP,
            TileTypes.FOUNDATION_BOTTOM,
            TileTypes.FOUNDATION_LEFT,
            TileTypes.FOUNDATION_RIGHT,
            TileTypes.WALL_FRONT,
            TileTypes.WALL_FRONT_LEFT_EDGE,
            TileTypes.WALL_FRONT_RIGHT_EDGE
        ];
        this.gameState.currentTileMap.setCollision(unpassableTileIds, true);
    }

    handleUserInput() {
        let velocityX = 0;
        let velocityY = 0;
        if (this.keyboard.D.isDown && this.keyboard.A.isUp) {
            velocityX = 1;
        } else if (this.keyboard.A.isDown && this.keyboard.D.isUp) {
            velocityX = -1;
        }

        if (this.keyboard.W.isDown && this.keyboard.S.isUp) {
            velocityY = -1;
        } else if (this.keyboard.S.isDown && this.keyboard.W.isUp) {
            velocityY = 1;
        }

        this.gameState.player.move(velocityX, velocityY);

        if (this.keyboard.SPACE.isDown) {
            this.gameState.player.attack();
        }
    }

    centerUI() {
        this.gameState.levelbar.setPosition(this.cameras.main.centerX, this.cameras.main.height);
    }
}