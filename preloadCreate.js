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

    // COLLISION BETWEEN PLAYER AND COINS
    // When the player overlaps with a coin, call collectCoin function
    // Use a callback to ensure collectCoin is only called when a coin tile is hit
    this.physics.add.overlap(player, coinLayer, (player, tile) => {
        // tile is the tile the player overlapped with
        // tile.index is the index of the tile in the tileset, -1 means empty
        if (tile && tile.index !== -1) {
            collectCoin(player, tile);
        }
    }, null, this); // overlap instead of collider, so we don't bounce when we touch a coin


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
            score = 0; // reset score
            jumpCount = 0; // reset jump count
            playerHealthPercentage = 100; // reset health
            player.setVelocity(0, 0); // stop player movement
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
    textScore = this.add.text(20, 570, '🪙: 0', {
        fontSize: '20px',
        fill: '#ffffff'
    });

    textScore.setScrollFactor(0);
    textScore.setText('🪙: ' + score);

    textHealth = this.add.text(20, 550, '❤️: 100%', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    textHealth.setText('❤️: ' + playerHealthPercentage + '%');
    textHealth.setScrollFactor(0);
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

    this.physics.add.collider(player, this.enemies, (playerObj, enemyObj) => {
        playerHealthPercentage -= 10; // Decrease health by 10% (adjust as needed)
        playerHealthPercentage = Math.max(playerHealthPercentage, 0); // Prevent negative health

        if (playerHealthPercentage === 0) {
            this.physics.pause();
            this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                '💀 Ooof',
                { fontSize: '48px', fill: '#ff0000' }
            ).setOrigin(0.5).setScrollFactor(0);
        }

        textHealth.setText('❤️: ' + playerHealthPercentage + '%');
    }, null, this);
}
