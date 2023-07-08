import 'phaser';
import { GameState } from '../classes/GameState';
import { GameWindowData } from '../types/GameWindowData';
import { Player } from '../classes/Player';
import { Projectile } from '../classes/Projectile';
import { ExperienceOrb } from '../classes/ExperienceOrb';
import { LevelUpOverlay } from './LevelUpOverlay';
import { DungeonFloor } from '../classes/DungeonFloor';
import { TileTypes } from '../types/Tiles';
import { FloorData } from '../types/FloorData';
import { GameOverOverlay } from './GameOverOverlay';
import { Enemy } from '../classes/Enemy';

export class GameScene extends Phaser.Scene {

    public gameState: GameState;
    view: GameWindowData;
    keyboard: any;
    levelText: Phaser.GameObjects.Text;
    floorData: FloorData;
    music: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    levelUpSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    deathSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    mute: boolean;

    constructor() {
        super('GameScene');
    }
    init(args: any) {
        this.view = args[0];
        this.gameState = new GameState();
        this.mute = false;
        console.log(args[0], args[1]);
        if (args[1]) {
            this.floorData = args[1];
        } else {
            this.floorData = {
                floor: 1,
                playerData: {
                    speed: 50,
                    experience: 0,
                    experienceTillLevelup: 100,
                    level: 1,
                    attackCooldown: 500,
                    power: 1,
                    critChance: 0,
                    projectileSpeed: 1
                },
                enemyScaling: 1
            }
        }
    }

    preload() {
        this.load.spritesheet('player', 'assets/PlayerSprite.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('playerNew', 'assets/PlayerSpriteNew.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('playerDown', 'assets/PlayerSpriteDown.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('playerUp', 'assets/PlayerSpriteUp.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('skeleton', 'assets/SkeletonSprite.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('knight', 'assets/KnightSprite.png', { frameWidth: 20, frameHeight: 20});
        this.load.spritesheet('slime', 'assets/SlimeSprite.png', { frameWidth: 8, frameHeight: 8});
        this.load.spritesheet('ghost', 'assets/GhostSprite.png', { frameWidth: 7, frameHeight: 10 });
        this.load.spritesheet('chest', 'assets/Chest.png', { frameWidth: 8, frameHeight: 8 });
        this.load.spritesheet('fistProjectile', 'assets/FistProjectile.png', { frameWidth: 8, frameHeight: 4 });
        this.load.spritesheet('fistProjectileCritical', 'assets/FistProjectileCritical.png', { frameWidth: 8, frameHeight: 4 });

        this.load.image('tileset', 'assets/tilemap/tilemap.png');
        this.load.image('healthbarBG', 'assets/HealthbarBackground.png');
        this.load.image('healthbarFG', 'assets/HealthbarForeground.png');
        this.load.image('levelbar', 'assets/Levelbar.png');
        this.load.image('levelbarProgressCircle', 'assets/LevelbarProgressCircle.png');
        this.load.image('levelbarProgress', 'assets/LevelbarProgress.png');
        this.load.image('xpDrop', 'assets/ExperienceDrop.png');

        this.load.audio('music', 'assets/audio/game-music.mp3');
        this.load.audio('deathSound', 'assets/audio/death.wav');
        this.load.audio('levelUpSound', 'assets/audio/levelup.wav');
        this.load.audio('upgradePicked', 'assets/audio/upgradepicked.wav');
        this.load.audio('stairsSound', 'assets/audio/stairs.wav');
        this.load.audio('shootSound', 'assets/audio/shoot.wav');
        this.load.audio('xpSound', 'assets/audio/xp.wav');
    }

    create() {
        this.gameState.enemies = this.physics.add.group();
        this.gameState.enemiesUnaffectedByWalls = this.physics.add.group();
        this.gameState.projectiles = this.physics.add.group();
        this.gameState.entities = this.physics.add.group();

        // Tilemap
        this.generateFloor();

        const spawnRoom = this.gameState.currentFloor.rooms[0];
        this.gameState.player = new Player(this, (spawnRoom.bounds.xStart + spawnRoom.width / 2) * 8, (spawnRoom.bounds.yStart + spawnRoom.height / 2) * 8, this.floorData.playerData);
        
        this.physics.world.enable(this.gameState.player);
        this.physics.add.collider(this.gameState.player, this.gameState.tilemaplayer as Phaser.Tilemaps.TilemapLayer);
        this.physics.add.collider(this.gameState.enemies, this.gameState.tilemaplayer as Phaser.Tilemaps.TilemapLayer);
        this.physics.add.collider(this.gameState.projectiles, this.gameState.tilemaplayer as Phaser.Tilemaps.TilemapLayer, (a) => (a as Projectile).destroyProjectile());
        this.physics.add.collider(this.gameState.enemies, this.gameState.enemies);

        this.cameras.main.setBounds(0, 0, this.view.width, this.view.height);
        this.cameras.main.setZoom(5);
        this.cameras.main.startFollow(this.gameState.player);

        // Sound
        this.music = this.sound.add('music', { mute: this.mute, volume: 0.05, rate: 1, loop: true });
        this.levelUpSound = this.sound.add('levelUpSound', { mute: this.mute, volume: 0.2, rate: 1, loop: false });
        this.deathSound = this.sound.add('deathSound', { mute: this.mute, volume: 0.2, rate: 1, loop: false });
        this.sound.add('shootSound', { mute: this.mute, volume: 0.5, rate: 1, loop: false });
        this.sound.add('xpSound', { mute: this.mute, volume: 0.5, rate: 1, loop: false });
        this.sound.add('stairsSound', { mute: this.mute, volume: 0.5, rate: 1, loop: false });

        if(this.floorData.floor == 1) {
            this.music.play();
        }

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

        this.levelText = this.add.text(this.view.width / 2, this.view.height / 2 + 65, this.gameState.player.level.toString(),
            { color: '#ccc', fontFamily: 'pzim', fontSize: '10px' })
            .setOrigin(0.5, 1)
            .setDepth(15)
            .setScrollFactor(0, 0);
        this.gameState.player.gainExperience(0); // To update the levelbar when the second floor is entered

        // Controls
        this.keyboard = this.input.keyboard!.addKeys('W,A,S,D,SPACE');
    }

    update() {
        this.handleUserInput();
        this.gameState.player.update();
        this.gameState.enemies.getChildren().forEach(enemy => (enemy as Enemy).update());
        this.gameState.enemiesUnaffectedByWalls.getChildren().forEach(enemy => (enemy as Enemy).update());
        this.gameState.projectiles.getChildren().forEach(projectile => (projectile as Projectile).checkCollision());
        this.gameState.entities.getChildren().forEach(entity => (entity as ExperienceOrb).checkPickup());
        this.checkRoomsEntered();
        this.checkPlayerOnStairs();
    }

    checkPlayerOnStairs() {
        if (Math.floor(this.gameState.player.x / 8) == this.gameState.currentFloor.stairCoords.x &&
        Math.floor(this.gameState.player.y / 8) == this.gameState.currentFloor.stairCoords.y) {
            this.scene.stop(this);

            this.floorData.enemyScaling += 0.2;
            this.floorData.playerData = this.gameState.player.getPlayerData();
            this.floorData.floor++;

            this.sound.get('stairsSound').play()

            this.scene.start('GameScene', [this.view, this.floorData]);
        }
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
        this.levelUpSound.play();
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
        const tiles = this.gameState.currentTileMap.addTilesetImage('tileset', 'tileset', 8, 8, 1, 2);
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
    
    showDeathScreen() {
        this.sound.stopAll();
        this.deathSound.play();
        this.scene.pause();
        this.game.scene.add('GameOverOverlay', new GameOverOverlay(this), true);
    }

    restart() {
        this.scene.stop(this);
        this.scene.start('GameScene', [this.view]);
    }
}