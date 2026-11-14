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
let walls;
let bed;

let player;

let statsContainer;
let isStatsVisible = false;
let panelWidth = 140;
let panelHeight = 125;
const panelPosition = panelHeight / 2 + 25;

let playerStats = {
    energia: 85,
    nalada: 90,
    hlad: 40,
    smad: 65,
    zamilovanost: 100
};

let cursors;
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
    player = this.physics.add.sprite(gameWidth / 2, gameHeight / 2, 'playerTexture').setInteractive();
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, walls);


    // 4. VYTVORENIE BUBLINY S UKAZOVATEĽMI (ENERGIA, NÁLADA, HLAD, SMÄD)
    statsContainer = this.add.container(player.x, player.y - panelPosition);
    statsContainer.setVisible(isStatsVisible);
    statsContainer.setDepth(10);

    let panelBg = this.add.graphics();
    panelBg.fillStyle(0x000000, 0.75);
    panelBg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 8);
    panelBg.lineStyle(2, 0xffffff, 0.5);
    panelBg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 8);
    statsContainer.add(panelBg);

    // Pomocná funkcia na vytvorenie jedného ukazovateľa (ikona + load bar)
    const createStatBar = (yOffset, icon, value, barColor) => {
        // Ikona naľavo
        let iconText = this.add.text(-panelWidth / 2 + 10, yOffset, icon, { fontSize: '14px' }).setOrigin(0, 0.5);

        // Sivé pozadie prázdneho baru (šírka 95px, výška 10px)
        let barWidth = 95;
        let barHeight = 10;
        let barBg = this.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(-35, yOffset - barHeight / 2, barWidth, barHeight, 4);

        // Farebná výplň podľa aktuálnej hodnoty (0 až 100)
        let fillWidth = (value / 100) * barWidth;
        let barFill = this.add.graphics();
        barFill.fillStyle(barColor, 1);
        barFill.fillRoundedRect(-35, yOffset - barHeight / 2, fillWidth, barHeight, 4);

        // Vloženie do hlavného kontajnera
        statsContainer.add([iconText, barBg, barFill]);
    };

    const statsCount = Object.keys(playerStats).length;
    const spacing = panelHeight / (statsCount + 1);
    let currentY = (-panelHeight / 2) + spacing;
    createStatBar(currentY, '❤️', playerStats.zamilovanost, 0xff4d6d);
    currentY += spacing;
    createStatBar(currentY, '⚡', playerStats.energia, 0xf1c40f);
    currentY += spacing;
    createStatBar(currentY, '😊', playerStats.nalada, 0x2ecc71);
    currentY += spacing;
    createStatBar(currentY, '🍔', playerStats.hlad, 0xe67e22);
    currentY += spacing;
    createStatBar(currentY, '💧', playerStats.smad, 0x3498db);
    currentY += spacing;

    player.on('pointerdown', () => {
        isStatsVisible = !isStatsVisible; // Otočí hodnotu (true -> false, false -> true)
        statsContainer.setVisible(isStatsVisible);
    });

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

    if (statsContainer) {
        statsContainer.x = player.x;
        statsContainer.y = player.y - panelPosition;
    }
}
