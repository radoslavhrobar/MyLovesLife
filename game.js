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
let bed;

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

// Štatistiky postavy
let statsContainer;
let panelWidth = 140;
let panelHeight = 125;
const panelPosition = panelHeight / 2 + 25;

let playerStats = {
    zamilovanost: 90,
    energia: 50,
    nalada: 70,
    hlad: 40,
    smad: 65
};

// Premenné pre interakciu s posteľou a okná (UI)
let bedMenuContainer;
let modalContainer;
let isModalOpen = false; // Keď je otvorené veľké okno, hráč sa nebude hýbať

function preload() {
    let btnGraphic = this.make.graphics({ x: 0, y: 0, add: false });
    btnGraphic.fillStyle(0xffffff, 0.1);
    btnGraphic.fillRoundedRect(0, 0, 60, 60, 10);
    btnGraphic.lineStyle(3, 0xffffff, 0.8);
    btnGraphic.strokeRoundedRect(0, 0, 60, 60, 10);
    btnGraphic.generateTexture('buttonBg', 60, 60);

    const createPlaceholderPhoto = (key, color, icon) => {
        let g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(color, 1);
        g.fillRoundedRect(0, 0, 160, 110, 10);
        g.lineStyle(3, 0xffffff, 0.8);
        g.strokeRoundedRect(0, 0, 160, 110, 10);
        g.generateTexture(key, 160, 110);
    };

    createPlaceholderPhoto('sleep1', 0x2c3e50); // Rýchly šlofík
    createPlaceholderPhoto('sleep2', 0x1a252f); // Hlboký spánok v objatí
    createPlaceholderPhoto('movie1', 0x8e44ad); // Romantická komédia
    createPlaceholderPhoto('movie2', 0xc0392b); // spoločný obľúbený film
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
    
    let bedGraphic = this.make.graphics({ x: 0, y: 0, add: false });
    bedGraphic.fillStyle(0x5c3a21, 1); // Drevený rám
    bedGraphic.fillRoundedRect(0, 0, 110, 170, 8);
    bedGraphic.fillStyle(0xecf0f1, 1); // Biela plachta / vankúš
    bedGraphic.fillRoundedRect(10, 10, 90, 40, 6);
    bedGraphic.fillStyle(0xe74c3c, 1); // Červená perina
    bedGraphic.fillRoundedRect(8, 55, 94, 107, 6);
    bedGraphic.generateTexture('bedTexture', 110, 170);

    const bedX = wallThick + 65;
    const bedY = gameHeight - wallThick - 95;
    bed = this.physics.add.staticSprite(bedX, bedY, 'bedTexture').setInteractive();

    // 3. VYTVORENIE HRÁČA (Vycentrovaný v strede plátna)
    let playerGraphic = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphic.fillStyle(0x3498db, 1);
    playerGraphic.fillRect(0, 0, 40, 40);
    playerGraphic.generateTexture('playerTexture', 40, 40);

    // Umiestnenie do presného geometrického stredu
    player = this.physics.add.sprite(gameWidth / 2, gameHeight / 2, 'playerTexture').setInteractive();
    
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, walls);
    this.physics.add.collider(player, bed);

    // 4. VYTVORENIE BUBLINY S UKAZOVATEĽMI (ENERGIA, NÁLADA, HLAD, SMÄD)
    statsContainer = this.add.container(player.x, player.y - panelPosition);
    statsContainer.setVisible(false);
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
        if (isModalOpen) return;
        statsContainer.setVisible(!statsContainer.visible);
    });

    bed.on('pointerdown', () => {
        if (isModalOpen) return;
        if (distancePlayerObject(player.x, player.y, bed.x, bed.y) <= 100) {
            bedMenuContainer.setVisible(!bedMenuContainer.visible);
        } else {
            // Krátka hláška, ak je hráč príliš ďaleko
            showFloatingText(this, bed.x, bed.y - 90, 'Si ďaleko mima!');
        }
    });

    createBedMiniMenu(this, bed.x, bed.y - 20);

    modalContainer = this.add.container(gameWidth / 2, gameHeight / 2);
    modalContainer.setDepth(50);
    modalContainer.setVisible(false);

    cursors = this.input.keyboard.createCursorKeys();
    this.input.addPointer(2);

    // 5. DOTYKOVÉ TLAČIDLÁ (Môžu prekrývať drevo aj koberec)
    const step = 65;
    const startX = gameWidth - (step * 2.5); // Presunuté do pravého dolného rohu
    const startY = gameHeight - (step * 2.3);

    const createTouchButton = (scene, x, y, symbol, onPress, onRelease) => {
        let btn = scene.add.image(x, y, 'buttonBg').setInteractive();
        btn.setDepth(20);
        let text = scene.add.text(x, y, symbol, { fontSize: '30px', fill: '#fff' }).setOrigin(0.5);
        text.setDepth(20);

        btn.on('pointerdown', () => { btn.setTint(0x3498db); onPress(); });
        btn.on('pointerup', () => { btn.clearTint(); onRelease(); });
        btn.on('pointerout', () => { btn.clearTint(); onRelease(); });
    };

    createTouchButton(this, startX + step, startY, '▲', () => moveUp = true, () => moveUp = false);
    createTouchButton(this, startX + step, startY + step * 1.4, '▼', () => moveDown = true, () => moveDown = false);
    createTouchButton(this, startX, startY + step * 0.7, '◀', () => moveLeft = true, () => moveLeft = false);
    createTouchButton(this, startX + step * 2, startY + step * 0.7, '▶', () => moveRight = true, () => moveRight = false);
}

function update() {
    if (isModalOpen) {
        player.setVelocity(0);
        return;
    }

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

    if (bedMenuContainer && bedMenuContainer.visible) {
        if (distancePlayerObject(player.x, player.y, bed.x, bed.y) > 170) {
            bedMenuContainer.setVisible(false);
        }
    }

    if (statsContainer) {
        statsContainer.x = player.x;
        statsContainer.y = player.y - panelPosition;
    }
}

function distancePlayerObject(playerX, playerY, objectX, objectY) {
    return Phaser.Math.Distance.Between(playerX, playerY, objectX, objectY);
}

function createBedMiniMenu(scene, x, y) {
    bedMenuContainer = scene.add.container(x, y);
    bedMenuContainer.setDepth(25);
    bedMenuContainer.setVisible(false);

    let bg = scene.add.graphics();
    bg.fillStyle(0x1e272e, 0.9);
    bg.fillRoundedRect(-75, -45, 150, 90, 10);
    bg.lineStyle(2, 0xffffff, 0.6);
    bg.strokeRoundedRect(-75, -45, 150, 90, 10);
    bedMenuContainer.add(bg);

    let sleepBtn = scene.add.text(0, -20, '😴 spať', { fontSize: '18px', fill: '#fff', backgroundColor: '#2c3e50', padding: { x: 12, y: 5 } })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    sleepBtn.on('pointerdown', () => {
        bedMenuContainer.setVisible(false);
        openActivitySelectionModal(scene, 'sleep');
    });

    let movieBtn = scene.add.text(0, 20, '🎬 kukať', { fontSize: '18px', fill: '#fff', backgroundColor: '#8e44ad', padding: { x: 12, y: 5 } })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    movieBtn.on('pointerdown', () => {
        bedMenuContainer.setVisible(false);
        openActivitySelectionModal(scene, 'movie');
    });

    bedMenuContainer.add([sleepBtn, movieBtn]);
}

function openActivitySelectionModal(scene, type) {
    isModalOpen = true;
    modalContainer.removeAll(true);
    modalContainer.setVisible(true);

    // 1. DEFINÍCIA MOŽNOSTÍ (Sem môžete pridať ľubovoľný počet fotiek: 2, 3, 4, 6...)
    // Poznámka: Vlastnosti label a icon som nechal v dátach kvôli tomu, aby časovač potom vedel, čo robí
    const options = type === 'sleep' ? [
        { img: 'sleep1', label: 'Rýchly šlofík', icon: '💤', stat: 'energia', boost: 25 },
        { img: 'sleep2', label: 'Spánok v objatí', icon: '🫂', stat: 'energia', boost: 50 },
        { img: 'sleep1', label: 'Víkendové leňošenie', icon: '🛌', stat: 'energia', boost: 40 } // Príklad 3. fotky
    ] : [
        { img: 'movie1', label: 'Romantický večer', icon: '💖', stat: 'zamilovanost', boost: 20 },
        { img: 'movie2', label: 'Náš obľúbený film', icon: '🍿', stat: 'nalada', boost: 30 },
        { img: 'movie1', label: 'Maratón seriálov', icon: '📺', stat: 'nalada', boost: 25 },
        { img: 'movie2', label: 'Rozprávka pred spaním', icon: '✨', stat: 'zamilovanost', boost: 15 } // Príklad 4. fotky
    ];

    // 2. DYNAMICKÝ VÝPOČET MRIEŽKY PODĽA POČTU FOTIEK (N)
    const count = options.length;
    // Ak je fotka 1, dáme 1 stĺpec. Ak je ich 2 až 4, dáme 2 stĺpce. Ak 5 a viac, dáme 3 stĺpce.
    const cols = count === 1 ? 1 : (count <= 4 ? 2 : 3);
    const rows = Math.ceil(count / cols);

    const w = 480; // Pevná šírka okna (aby sa pekne zmestilo do 600px hry)
    const padding = 20;
    const headerHeight = 70; // Miesto hore pre nadpis a krížik

    // Automatický výpočet rozmerov jednej fotky, aby sa všetky zmestili vedľa seba
    const availableWidth = w - padding * (cols + 1);
    const photoWidth = Math.min(200, availableWidth / cols); // Maximálna šírka fotky 200px
    const photoHeight = photoWidth * 0.7; // Zachováme pekný pomer strán (napr. 10:7)

    // Výška celého modálneho okna sa automaticky natiahne podľa počtu riadkov
    const h = headerHeight + rows * (photoHeight + padding) + padding;

    // 3. VYKRESLENIE POZADIA OKNA
    let bg = scene.add.graphics();
    bg.fillStyle(0x111111, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    bg.lineStyle(3, 0xffffff, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    modalContainer.add(bg);

    // Nadpis
    const titleText = type === 'sleep' ? 'Vyber si spôsob spánku:' : 'Aký film si pozrieme?';
    let title = scene.add.text(0, -h / 2 + 35, titleText, { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    modalContainer.add(title);

    // Tlačidlo Zavrieť (X)
    let closeBtn = scene.add.text(w / 2 - 25, -h / 2 + 25, '✖', { fontSize: '22px', fill: '#e74c3c' })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
        modalContainer.setVisible(false);
        isModalOpen = false;
    });
    modalContainer.add(closeBtn);

    // 4. VYKRESLENIE ČISTO LEN FOTIEK DO MRIEŽKY
    options.forEach((opt, index) => {
        const col = index % cols;               // V ktorom stĺpci je fotka (0, 1, 2...)
        const row = Math.floor(index / cols);   // V ktorom riadku je fotka (0, 1...)

        // Zistíme, koľko fotiek je v tomto konkrétnom riadku (kvôli vycentrovaniu posledného neúplného riadku)
        const itemsInThisRow = (row === rows - 1 && count % cols !== 0) ? (count % cols) : cols;
        const rowWidth = itemsInThisRow * photoWidth + (itemsInThisRow - 1) * padding;
        const startX = -rowWidth / 2 + photoWidth / 2;

        const cardX = startX + col * (photoWidth + padding);
        const cardY = -h / 2 + headerHeight + padding + photoHeight / 2 + row * (photoHeight + padding);

        // Vytvorenie samotnej fotky a prispôsobenie jej presnej veľkosti do mriežky
        let photo = scene.add.image(cardX, cardY, opt.img).setInteractive({ useHandCursor: true });
        photo.setDisplaySize(photoWidth, photoHeight);

        // Jemný efekt zväčšenia pri prejdení myšou / dotyku
        photo.on('pointerover', () => photo.setDisplaySize(photoWidth * 1.04, photoHeight * 1.04));
        photo.on('pointerout', () => photo.setDisplaySize(photoWidth, photoHeight));

        // Kliknutie na fotku spustí 5-sekundový časovač
        photo.on('pointerdown', () => {
            startActivityTimer(scene, opt);
        });

        modalContainer.add(photo);
    });
} 

function startActivityTimer(scene, option) {
    // 1. Zatvoríme veľké okno s výberom fotiek v strede obrazovky
    modalContainer.removeAll(true);
    modalContainer.setVisible(false);

    // 2. Vytvoríme malý lokálny kontajner priamo nad posteľou (rovnaká pozícia ako bedMiniMenu)
    let timerContainer = scene.add.container(bed.x, bed.y - 120);
    timerContainer.setDepth(35);

    const w = 180;
    const h = 85;

    // Tmavé pozadie bubliny nad posteľou
    let bg = scene.add.graphics();
    bg.fillStyle(0x1e272e, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    bg.lineStyle(2, 0x3498db, 0.9);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    timerContainer.add(bg);

    // Zmenšené texty prispôsobené bubline nad posteľou
    let statusText = scene.add.text(0, -24, `${option.icon} ${option.label}`, {
        fontSize: '13px',
        fill: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    let timeText = scene.add.text(0, -4, 'Zostáva: 5.0 s', {
        fontSize: '12px',
        fill: '#bdc3c7'
    }).setOrigin(0.5);

    // Pozadie loading baru (šírka 150px)
    const barWidth = 150;
    let barBg = scene.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRoundedRect(-barWidth / 2, 12, barWidth, 14, 7);

    // Aktívny loading bar
    let barFill = scene.add.graphics();
    timerContainer.add([statusText, timeText, barBg, barFill]);

    // 3. 5-sekundový plynulý odpočet
    scene.tweens.addCounter({
        from: 0,
        to: 100,
        duration: 5000,
        onUpdate: (tween) => {
            const progress = tween.getValue();
            const remainingSeconds = ((100 - progress) / 100 * 5).toFixed(1);
            timeText.setText(`Zostáva: ${remainingSeconds} s`);

            barFill.clear();
            barFill.fillStyle(0x2ecc71, 1);
            barFill.fillRoundedRect(-barWidth / 2, 12, (progress / 100) * barWidth, 14, 7);
        },
        onComplete: () => {
            // Doplnenie štatistiky postavy
            playerStats[option.stat] = Math.min(100, playerStats[option.stat] + option.boost);

            // Zničenie bubliny časovača a odomknutie pohybu
            timerContainer.destroy();
            isModalOpen = false;

            showFloatingText(scene, player.x, player.y - 40, `+${option.boost} ${option.icon}`);
        }
    });
}

function showFloatingText(scene, x, y, message) {
    let txt = scene.add.text(x, y, message, {
        fontSize: '18px',
        fill: '#2ecc71',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(60);
    scene.tweens.add({
        targets: txt,
        y: y - 40,
        alpha: 0,
        duration: 1500,
        onComplete: () => txt.destroy()
    });
}

