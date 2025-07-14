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

};``
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

// `update` function to handle player movement and jumping
// This function is called 60 times per second (60 FPS)
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
