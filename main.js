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

const game = new Phaser.Game(config);

let player;
let cursors;

function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('enemy', 'assets/enemy.png');
  this.load.image('background', 'assets/background.png');
}

function create() {
  this.add.image(400, 300, 'background');
  player = this.physics.add.sprite(100, 450, 'player').setCollideWorldBounds(true);
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  }
}
