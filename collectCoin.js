// `collectCoin` function to handle collecting a coin
// This function is called when the player overlaps with a coin tile
function collectCoin(sprite, tile) {
    // Prevent multiple overlaps by disabling the tile immediately
    coinLayer.putTileAt(-1, tile.x, tile.y); // set to empty tile
    coinLayer.removeTileAt(tile.x, tile.y);
    score++;
    textScore.setText('🪙: ' + score);
    return false; // return false to prevent further processing of this overlap
}
