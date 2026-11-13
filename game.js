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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let walls;

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

function preload() {
    let btnGraphic = this.make.graphics({ x: 0, y: 0, add: false });
    btnGraphic.fillStyle(0xffffff, 0.1);
    btnGraphic.fillRoundedRect(0, 0, 60, 60, 10);
    btnGraphic.lineStyle(3, 0xffffff, 0.8);
    btnGraphic.strokeRoundedRect(0, 0, 60, 60, 10);
    btnGraphic.generateTexture('buttonBg', 60, 60);
}

function create() {
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    this.cameras.main.setBackgroundColor('#a16c4b');

    const carpetWidth = gameWidth * 0.7;
    const carpetHeight = gameHeight * 0.6;
    const carpetX = (gameWidth - carpetWidth) / 2;
    const carpetY = (gameHeight - carpetHeight) / 2;

    let carpet = this.add.graphics();
    carpet.fillStyle(0x3a5a40, 1);
    carpet.fillRect(carpetX, carpetY, carpetWidth, carpetHeight);

    // 2. TENKÉ STENY NA ÚPLNÝCH OKRAJOCH PLÁTNA
    const wallThick = 12; // Hrúbka steny v pixeloch
    let wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x7f8c8d, 1);
    wallGraphics.fillRect(0, 0, gameWidth, wallThick); // Horná stena
    wallGraphics.fillRect(0, gameHeight - wallThick, gameWidth, wallThick); // Dolná stena
    wallGraphics.fillRect(0, 0, wallThick, gameHeight); // Ľavá stena
    wallGraphics.fillRect(gameWidth - wallThick, 0, wallThick, gameHeight); // Pravá stena

    walls = this.physics.add.staticGroup();
    walls.create(gameWidth / 2, wallThick / 2).setSize(gameWidth, wallThick).setVisible(false);
    walls.create(gameWidth / 2, gameHeight - wallThick / 2).setSize(gameWidth, wallThick).setVisible(false);
    walls.create(wallThick / 2, gameHeight / 2).setSize(wallThick, gameHeight).setVisible(false);
    walls.create(gameWidth - wallThick / 2, gameHeight / 2).setSize(wallThick, gameHeight).setVisible(false);
    
    // 3. VYTVORENIE HRÁČA (Vycentrovaný v strede plátna)
    let playerGraphic = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphic.fillStyle(0x3498db, 1);
    playerGraphic.fillRect(0, 0, 40, 40);
    playerGraphic.generateTexture('playerTexture', 40, 40);

    // Umiestnenie do presného geometrického stredu
    player = this.physics.add.sprite(gameWidth / 2, gameHeight / 2, 'playerTexture');
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, walls);

    cursors = this.input.keyboard.createCursorKeys();
    this.input.addPointer(2);

    // 5. DOTYKOVÉ TLAČIDLÁ (Môžu prekrývať drevo aj koberec)
    const step = 70;
    const startX = gameWidth * 0.08;
    const startY = gameHeight - (step * 2.5);

    const createTouchButton = (scene, x, y, symbol, onPress, onRelease) => {
        let btn = scene.add.image(x, y, 'buttonBg').setInteractive();
        let text = scene.add.text(x, y, symbol, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        btn.on('pointerdown', () => { btn.setTint(0x3498db); onPress(); });
        btn.on('pointerup', () => { btn.clearTint(); onRelease(); });
        btn.on('pointerout', () => { btn.clearTint(); onRelease(); });
    };

    createTouchButton(this, startX + step, startY, '▲', () => moveUp = true, () => moveUp = false);
    createTouchButton(this, startX + step, startY + step * 1.5, '▼', () => moveDown = true, () => moveDown = false);
    createTouchButton(this, startX, startY + step * 0.75, '◀', () => moveLeft = true, () => moveLeft = false);
    createTouchButton(this, startX + step * 2, startY + step * 0.75, '▶', () => moveRight = true, () => moveRight = false);
}

function update() {
    const speed = 200;
    player.setVelocity(0);

    if (cursors.left.isDown || moveLeft) {
        player.setVelocityX(-speed);
    } else if (cursors.right.isDown || moveRight) {
        player.setVelocityX(speed);
    }

    if (cursors.up.isDown || moveUp) {
        player.setVelocityY(-speed);
    } else if (cursors.down.isDown || moveDown) {
        player.setVelocityY(speed);
    }
}
