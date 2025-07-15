// Spawn flying enemies periodically
function spawnFlyingEnemy(scene, player) {
    // Only spawn if there are fewer than 3 bats
    if (scene.enemies.countActive(true) >= 3) {
        return null;
    }

    const spawnLeft = Phaser.Math.Between(0, 1) === 0;
    const x = spawnLeft ? -100 : map.widthInPixels + 100;
    const y = Phaser.Math.Between(500, 600);

    const enemy = scene.enemies.create(x, y, 'enemy', 'fly1');
    enemy.play('fly');
    enemy.setScale(1.9);
    enemy.setDepth(1);
    enemy.setCollideWorldBounds(false);

    enemy.baseY = y;
    enemy.hoverAngle = 0;
    enemy.playerRef = player;
    enemy.batState = 'hover';
    enemy.swoopCooldown = 0;

    // Disable gravity for this enemy
    if (enemy.body) {
        enemy.body.allowGravity = false;
    }

    return enemy;
}
const enemy = scene.enemies.create(x, y, 'enemy', 'fly1');
enemy.play('fly');
enemy.setDepth(1);
enemy.setCollideWorldBounds(false);

// Disable gravity for this enemy
if (enemy.body) {
    enemy.body.allowGravity = false;
}
