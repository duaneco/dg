// A simple Phaser 3 game setup with player movement
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// Initialize the game
const game = new Phaser.Game(config);

// Game variables
let player;
let cursors;

// Preload assets
function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('enemy', 'assets/enemy.png');
  this.load.image('background', 'assets/background.png');
}

// Create game objects
function create() {
  this.add.image(400, 300, 'background');
  player = this.physics.add.sprite(100, 450, 'player').setCollideWorldBounds(true);
  cursors = this.input.keyboard.createCursorKeys();
}

// Update game state
function update() {
  player.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  }
}
