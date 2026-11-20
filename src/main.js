import MainScene from './MainScene.js';

const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MainScene] // Načítame našu oddelenú scénu
};

const game = new Phaser.Game(config);