// This is a simple Phaser 3 platformer game with a title screen and basic player movement.
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        // You can preload assets for the title screen here if needed
        this.load.video('bgVideo', 'assets/tv-screen-.mp4', 'loadeddata', false, true);
        this.load.image('playButton', 'assets/play-button.png');
        this.load.video('transition', 'assets/tv-transition.mp4', 'loadeddata', false, true);

    }

    create() {
        // Add the background video
        const video = this.add.video(400, 300, 'bgVideo').setOrigin(0.5);
        video.play(true);
        video.setLoop(true);



        // Add image-based play button at (400, 500) and scale it
        const playButton = this.add.image(400, 500, 'playButton')
            .setScale(0.5) // adjust the size (0.5 = 50%)
            .setInteractive({ useHandCursor: true }) // enables click + hover effect
            .on('pointerdown', () => {
                video.stop(); // stop the looping background video
                playButton.setVisible(false); // hide play button

                const transitionVideo = this.add.video(400, 300, 'transition').setOrigin(0.5);
                transitionVideo.play();
                // When the transition ends, start the main game scene
                transitionVideo.on('complete', () => {
                    this.scene.start('main');
                });
            });
    }
}

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: [TitleScene, {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }]

};
var game = new Phaser.Game(config);
var map;
var player;
var cursors;
var groundLayer, coinLayer;
var text;
var score = 0;
var jumpCount = 0;
var maxJumps = 2;
var isparent = false; // Example variable to check if a parent exists

function preload() {
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    // tiles in spritesheet 
    this.load.image('tiles', 'assets/tiles.png', { frameWidth: 70, frameHeight: 70 });
    // simple coin image
    this.load.image('coin', 'assets/coinGold.png');
    // player animations
    this.load.atlasXML('player', 'assets/player.png', 'assets/player.xml');

    this.load.image('exit', 'assets/exit-button.png', 'loadeddata');
    this.load.atlas('enemy', 'assets/bats.png', 'assets/bats.json');

}

function create() {
    // load the map 
    map = this.make.tilemap({ key: 'map' });

    // coin image used as tileset
    var coinTiles = map.addTilesetImage('coin');
    // add coins as tiles
    coinLayer = map.createLayer('Coins', coinTiles, 0, 0);

    // tiles for the ground layer
    var groundTiles = map.addTilesetImage('tiles');
    // create the ground layer
    groundLayer = map.createLayer('World', groundTiles, 0, 0);
    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);
    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;
    // create the player sprite    
    player = this.physics.add.sprite(200, 200, 'player');
    player.setBounce(0.2); // our player will bounce from items
    player.setCollideWorldBounds(true); // don't go out of the map
    this.physics.add.collider(groundLayer, player);
    cursors = this.input.keyboard.createCursorKeys();
    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(player);

    // set background color, so the sky is not black    
    this.cameras.main.setBackgroundColor('#ccccff');
    coinLayer.setTileIndexCallback(17, collectCoin, this); // the coin id is 17
    // when the player overlaps with a tile with index 17, collectCoin will be called    
    this.physics.add.overlap(player, coinLayer);
    // player walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {
            prefix: 'sprite sheet-knight_',
            start: 36,
            end: 41,
            suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    // Add exit button fixed to the camera (UI)
    const exitButton = this.add.image(750, 550, 'exit')
        .setScale(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('TitleScene');
        });
    exitButton.setScrollFactor(0); // lock to camera
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'player', frame: 'sprite sheet-knight_38.png' }],
        frameRate: 10
    });
    cursors = this.input.keyboard.createCursorKeys();
    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(player);
    // set background color, so the sky is not black    
    this.cameras.main.setBackgroundColor('#ccccff');
    text = this.add.text(20, 570, '0', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    text.setScrollFactor(0);
    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(groundLayer, player); // player collides with ground
    // Create enemy animations
    // Flying enemy animation
    this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNames('enemy', {
            frames: ['fly1', 'fly2', 'fly3']
        }),
        frameRate: 8,
        repeat: -1
    });

    // Ensure gravity does not affect enemies
    this.enemies = this.physics.add.group();
    this.physics.world.enable(this.enemies);
    this.enemies.children.iterate(enemy => {
        if (enemy && enemy.body) {
            enemy.body.allowGravity = false;
        }
    });

    // Create a few flying enemies at random positions
    // Adjust the number of enemies as needed
    for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(100, map.widthInPixels - 100);
        const y = Phaser.Math.Between(100, map.heightInPixels - 200);

        const enemy = this.enemies.create(x, y, 'enemy', 'fly1');
        enemy.play('fly');

        // Add random velocity for flying behavior
        enemy.setVelocity(
            Phaser.Math.Between(-100, 100),
            Phaser.Math.Between(-50, 50)
        );

        enemy.setBounce(1, .5); // bounce off walls
        enemy.setCollideWorldBounds(true);
    }


    // Optional: Add collision with ground layer
    this.physics.add.collider(this.enemies, groundLayer);


    this.time.addEvent({
        delay: 3000, // spawn every 3 seconds
        callback: () => {
            spawnFlyingEnemy(this, player);
        },
        loop: true
    });


}
// Spawn flying enemies periodically
function spawnFlyingEnemy(scene, player) {
    const spawnLeft = Phaser.Math.Between(0, 1) === 0;
    const x = spawnLeft ? -100 : map.widthInPixels + 100;
    const y = Phaser.Math.Between(500, 600);

    const enemy = scene.enemies.create(x, y, 'enemy', 'fly1');
    enemy.play('fly');

    enemy.setDepth(1);
    enemy.setCollideWorldBounds(false);

    enemy.baseY = y;
    enemy.hoverAngle = 0;

    enemy.playerRef = player;
    enemy.batState = 'hover'; // other states: 'swoop', 'retreat'
    enemy.swoopCooldown = 0;

    return enemy;
}


function update(time, delta) {

    // Horizontal movement
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('walk', true);
        player.flipX = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('walk', true);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
        player.anims.play('idle', true);
    }

    // Jumping and double jump
    if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
        if (player.body.blocked.down) {
            player.setVelocityY(-330);
            jumpCount = 1;
        } else if (jumpCount < maxJumps) {
            player.setVelocityY(-330);
            jumpCount++;
        }
    }

    if (player.body.blocked.down) {
        jumpCount = 0;
    }
    this.enemies.children.iterate(enemy => {
        if (!enemy || !enemy.playerRef) return;

        const player = enemy.playerRef;

        switch (enemy.batState) {
            case 'hover':
                // Hover in sine wave
                enemy.hoverAngle += 0.05;
                enemy.y = enemy.baseY + Math.sin(enemy.hoverAngle) * 10;
                enemy.setVelocityX(0);

                // Check if ready to swoop
                if (Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y) < 300 && enemy.swoopCooldown <= 0) {
                    enemy.batState = 'swoop';
                } else {
                    enemy.swoopCooldown -= this.game.loop.delta / 1000; // seconds
                }
                break;

            case 'swoop':
                // Dive at player
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const angle = Math.atan2(dy, dx);

                const swoopSpeed = 200;
                enemy.setVelocity(Math.cos(angle) * swoopSpeed, Math.sin(angle) * swoopSpeed);

                // When near player, retreat
                if (Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y) < 30) {
                    enemy.batState = 'retreat';
                }
                break;

            case 'retreat':
                // Fly away upward and to the side
                const direction = enemy.x < player.x ? -1 : 1;
                enemy.setVelocity(150 * direction, -200);

                // After a short time, go back to hover
                if (!enemy.resetTimerStarted) {
                    enemy.resetTimerStarted = true;

                    enemy.scene.time.delayedCall(2000, () => {
                        enemy.batState = 'hover';
                        enemy.swoopCooldown = 2 + Phaser.Math.Between(1, 3); // delay next swoop
                        enemy.resetTimerStarted = false;
                    });
                }
                break;
        }
    });


}


function collectCoin(sprite, tile) {
    coinLayer.removeTileAt(tile.x, tile.y);
    score++;
    text.setText(score);
    return false;
}
