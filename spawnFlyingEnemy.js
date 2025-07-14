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
