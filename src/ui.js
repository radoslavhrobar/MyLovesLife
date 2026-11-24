import { gameState, statsConfig, theoStatsConfig, showFloatingText} from './state.js';


export function createTouchControls(scene, gameWidth, gameHeight, controlsState) {
    const step = 65;
    const startX = gameWidth - (step * 2.5);
    const startY = gameHeight - (step * 3.0);

    const createBtn = (x, y, symbol, key) => {
        let btn = scene.add.image(x, y, 'buttonBg').setInteractive().setDepth(20);
        scene.add.text(x, y, symbol, { fontSize: '30px', fill: '#fff' }).setOrigin(0.5).setDepth(20);

        btn.on('pointerdown', () => { btn.setTint(0x3498db); controlsState[key] = true; });
        btn.on('pointerup', () => { btn.clearTint(); controlsState[key] = false; });
        btn.on('pointerout', () => { btn.clearTint(); controlsState[key] = false; });
    };

    createBtn(startX + step, startY, '▲', 'up');
    createBtn(startX + step, startY + step * 1.4, '▼', 'down');
    createBtn(startX, startY + step * 0.7, '◀', 'left');
    createBtn(startX + step * 2, startY + step * 0.7, '▶', 'right');
}

export function createStatsBubble(scene, player) {
    const panelWidth = 180;
    const panelHeight = 125;
    const panelPosition = panelHeight / 2 + 25;

    let container = scene.add.container(player.x, player.y - panelPosition);
    container.setVisible(false).setDepth(15);

    let panelBg = scene.add.graphics();
    panelBg.fillStyle(0xff72c4, 0.75);
    panelBg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 8);
    panelBg.lineStyle(2, 0x000, 0.5);
    panelBg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 8);
    container.add(panelBg);

    const phoneXOffset = 22;
    const phoneX = -panelWidth / 2 + phoneXOffset; // Kúsok od ľavého okraja
    const phoneY = 0; // Vertikálne presne v strede
    const phoneSize = 34;

    let phoneBtn = scene.add.container(phoneX, phoneY);
    let phoneBg = scene.add.graphics()
        .fillStyle(0x111111, 0.85)
        .fillRoundedRect(-phoneSize / 2, -phoneSize / 2, phoneSize, phoneSize, 8)
        .lineStyle(2, 0x000000, 1) // Čierny rámček
        .strokeRoundedRect(-phoneSize / 2, -phoneSize / 2, phoneSize, phoneSize, 8);

    let phoneIcon = scene.add.text(0, 0, '📱', { fontSize: '25px' }).setOrigin(0.5);
    phoneBtn.add([phoneBg, phoneIcon]);
    phoneBtn.setSize(phoneSize, phoneSize).setInteractive({ useHandCursor: true });

    phoneBtn.on('pointerover', () => phoneBg.setAlpha(0.75));
    phoneBtn.on('pointerout', () => phoneBg.setAlpha(1));
    container.add(phoneBtn);

    let handPhoneSprite = scene.add.image(player.x + 32, player.y + 18, 'phone')
        .setDisplaySize(50, 65) // Uprav si veľkosť podľa pomeru tvojej fotky
        .setDepth(30)
        .setVisible(false)
        .setInteractive({ useHandCursor: true });

    phoneBtn.on('pointerdown', () => {
        handPhoneSprite.setVisible(!handPhoneSprite.visible);
        phoneMenu.setVisible(false); // Vždy skryje menu s tlačidlom, keď mobil schováš (aj keď ho vytiahneš)
        container.setVisible(false);
    });

    // --- MENU NAD MOBILOM V RUKE (samostatný kontajner, nie vnútri štatistík!) ---
    const menuW = 260;
    const menuH = 60;
    let phoneMenu = scene.add.container(handPhoneSprite.x + 50, handPhoneSprite.y - 65)
        .setDepth(25)
        .setVisible(false);

    let menuBg = scene.add.graphics()
        .fillStyle(0x1e272e, 0.92)
        .fillRoundedRect(-menuW / 2, -menuH / 2, menuW, menuH, 12)
        .lineStyle(2, 0xff72c4, 0.6)
        .strokeRoundedRect(-menuW / 2, -menuH / 2, menuW, menuH, 12);

    let callBtn = createRoundedButton(scene, 0, 0, menuW - 20, 38, 'Zavolať hovienko moje💩❤️', 0xff72c4, () => {
        phoneMenu.setVisible(false);
        handPhoneSprite.setVisible(false);
        container.setVisible(false);

        if (scene.startCallTimer) {
            scene.startCallTimer();
        }
    });


    phoneMenu.add([menuBg, callBtn]);

    handPhoneSprite.on('pointerdown', () => {
        phoneMenu.setVisible(!phoneMenu.visible);
    });

    const keys = Object.keys(statsConfig);
    const spacing = panelHeight / (keys.length + 1);
    let currentY = (-panelHeight / 2) + spacing;
    const barWidth = 95;
    const barHeight = 10;
    const iconX = -panelWidth / 2 + phoneXOffset + phoneSize / 2 + 5; // Hneď za ikonkou mobilu
    const barX = iconX + 24;

    keys.forEach(key => {
        let stat = statsConfig[key];
        let iconText = scene.add.text(iconX, currentY, stat.icon, { fontSize: '14px' }).setOrigin(0, 0.5);

        let barBg = scene.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(barX, currentY - barHeight / 2, barWidth, barHeight, 4);

        let fillWidth = (stat.value / 100) * barWidth;
        let barFill = scene.add.graphics();
        barFill.fillStyle(stat.color, 1);
        barFill.fillRoundedRect(barX, currentY - barHeight / 2, fillWidth, barHeight, 4);

        stat.graphics = barFill;
        stat.y = currentY;
        stat.x = barX;
        stat.width = barWidth;
        stat.height = barHeight;

        container.add([iconText, barBg, barFill]);
        currentY += spacing;
    });

    return { container, offsetY: panelPosition, handPhoneSprite, phoneMenu};
}

export function createTheoStatsBubble(scene, doghouse) {
    const panelWidth = 145;
    const panelHeight = 95;

    // Posunuté doprava od búdy (+145) a zarovnané na úroveň strechy (-10), aby nezasahovalo do menu
    let container = scene.add.container(doghouse.x + 145, doghouse.y - 10);
    container.setVisible(false).setDepth(25);

    let panelBg = scene.add.graphics();
    panelBg.fillStyle(0xff72c4, 0.75);
    panelBg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 8);
    panelBg.lineStyle(2, 0x000, 0.5);
    panelBg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 8);
    container.add(panelBg);

    const keys = Object.keys(theoStatsConfig);
    const spacing = panelHeight / (keys.length + 1);
    let currentY = (-panelHeight / 2) + spacing;
    const barWidth = 95;
    const barHeight = 10;
    const iconX = -panelWidth / 2 + 10;
    const barX = iconX + 24;

    keys.forEach(key => {
        let stat = theoStatsConfig[key];
        let iconText = scene.add.text(iconX, currentY, stat.icon, { fontSize: '14px' }).setOrigin(0, 0.5);

        let barBg = scene.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(barX, currentY - barHeight / 2, barWidth, barHeight, 4);

        let fillWidth = (stat.value / 100) * barWidth;
        let barFill = scene.add.graphics();
        barFill.fillStyle(stat.color, 1);
        barFill.fillRoundedRect(barX, currentY - barHeight / 2, fillWidth, barHeight, 4);

        stat.graphics = barFill;
        stat.y = currentY;
        stat.x = barX;
        stat.width = barWidth;
        stat.height = barHeight;

        container.add([iconText, barBg, barFill]);
        currentY += spacing;
    });

    return { container };
}

export function updateStatsBars() {
    for (let key in statsConfig) {
        let stat = statsConfig[key];
        stat.value = Phaser.Math.Clamp(stat.value, 0, 100);
        let fillWidth = (stat.value / 100) * stat.width;

        stat.graphics.clear();
        stat.graphics.fillStyle(stat.color, 1);
        stat.graphics.fillRoundedRect(stat.x, stat.y - stat.height / 2, fillWidth, stat.height, 4);
    }
}

export function updateTheoStatsBars() {
    for (let key in theoStatsConfig) {
        let stat = theoStatsConfig[key];
        stat.value = Phaser.Math.Clamp(stat.value, 0, 100);
        let fillWidth = (stat.value / 100) * stat.width;

        stat.graphics.clear();
        stat.graphics.fillStyle(stat.color, 1);
        stat.graphics.fillRoundedRect(stat.x, stat.y - stat.height / 2, fillWidth, stat.height, 4);
    }
}

export function openSelectionModal(scene, gameWidth, gameHeight, titleText, options, onSelect) {
    gameState.isModalOpen = true;
    let modalContainer = scene.add.container(gameWidth / 2, gameHeight / 2).setDepth(50);

    const count = options.length;
    const cols = count === 1 ? 1 : (count <= 4 ? 2 : 3);
    const rows = Math.ceil(count / cols);

    const w = 480;
    const padding = 20;
    const headerHeight = 50;
    const availableWidth = w - padding * (cols + 1);
    const photoWidth = Math.min(200, availableWidth / cols);
    const photoHeight = photoWidth * 0.9;
    const h = headerHeight + rows * (photoHeight + padding) + padding;

    let bg = scene.add.graphics();
    bg.fillStyle(0x111111, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    bg.lineStyle(3, 0xff72c4, 0.85);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    modalContainer.add(bg);

    let title = scene.add.text(0, -h / 2 + 35, titleText, {
        fontSize: '20px',
        fill: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    modalContainer.add(title);

    let closeBtn = scene.add.text(w / 2 - 25, -h / 2 + 25, '✖', { fontSize: '22px', fill: '#e74c3c' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
        modalContainer.destroy();
        gameState.isModalOpen = false;
    });
    modalContainer.add(closeBtn);

    options.forEach((opt, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const itemsInThisRow = (row === rows - 1 && count % cols !== 0) ? (count % cols) : cols;
        const rowWidth = itemsInThisRow * photoWidth + (itemsInThisRow - 1) * padding;
        const startX = -rowWidth / 2 + photoWidth / 2;

        const cardX = startX + col * (photoWidth + padding);
        const cardY = -h / 2 + headerHeight + padding + photoHeight / 2 + row * (photoHeight + padding);

        let photo = scene.add.image(cardX, cardY, opt.img).setInteractive({ useHandCursor: true });
        photo.setDisplaySize(photoWidth, photoHeight);

        photo.on('pointerover', () => photo.setDisplaySize(photoWidth * 1.04, photoHeight * 1.04));
        photo.on('pointerout', () => photo.setDisplaySize(photoWidth, photoHeight));
        photo.on('pointerdown', () => {
            modalContainer.destroy();
            gameState.isModalOpen = false;
            onSelect(opt); // Spustí akciu podľa toho, odkiaľ sa okno otvorilo
        });

        modalContainer.add(photo);
    });
}


export function startActivityTimer(scene, bed, player, option, type) {
    gameState.isModalOpen = true;
    let timerContainer = scene.add.container(bed.x + 25, bed.y - 125).setDepth(35);
    const w = 180;
    const h = type === 'movie' ? 115 : 85;

    let bg = scene.add.graphics();
    bg.fillStyle(0x1e272e, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    bg.lineStyle(2, 0xff72c4, 0.9);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    timerContainer.add(bg);

    let timeY = 0, barY = 0;

    if (type === 'sleep') {
        let sleepIcon = scene.add.text(-25, -22, option.icon, { fontSize: '20px' }).setOrigin(0.5);
        let zzzText = scene.add.text(12, -20, '💤😴', { fontSize: '15px', fill: '#74b9ff', fontStyle: 'italic bold' }).setOrigin(0.5);
        timerContainer.add([sleepIcon, zzzText]);

        scene.tweens.add({ targets: zzzText, y: -30, scale: 1.15, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });
        timeY = -2; barY = 16;
    } else {
        let moviePhoto = scene.add.image(0, -24, option.img).setDisplaySize(75, 48);
        timerContainer.add(moviePhoto);
        timeY = 12; barY = 30;
    }

    let timeText = scene.add.text(0, timeY, type === 'sleep' ? 'Chrapkaš: 5.0 s' : 'Pozerkaš: 5.0 s', { fontSize: '12px', fill: '#bdc3c7' }).setOrigin(0.5);
    const barWidth = 150;
    let barBg = scene.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRoundedRect(-barWidth / 2, barY, barWidth, 12, 6);

    let barFill = scene.add.graphics();
    timerContainer.add([timeText, barBg, barFill]);

    scene.tweens.addCounter({
        from: 0, to: 100, duration: 5000,
        onUpdate: (tween) => {
            const progress = tween.getValue();
            const remaining = ((100 - progress) / 100 * 5).toFixed(1);
            timeText.setText(type === 'sleep' ? `Chrapkaš: ${remaining} s` : `Pozerkaš: ${remaining} s`);
            barFill.clear();
            barFill.fillStyle(0xff72c4, 1);
            barFill.fillRoundedRect(-barWidth / 2, barY, (progress / 100) * barWidth, 12, 6);
        },
        onComplete: () => {
            const rewards = option.effects || [{ stat: option.stat, boost: option.boost }];
            let floatingParts = [];

            rewards.forEach(item => {
                if (statsConfig[item.stat]) {
                    statsConfig[item.stat].value += item.boost;
                    // Zoberie ikonu priamo zo statsConfig (napr. ⚡ alebo 😊), ak ju option nemá
                    const icon = statsConfig[item.stat].icon;
                    const sign = item.boost > 0 ? '+' : '';
                    floatingParts.push(`${sign}${item.boost}${icon}`);
                }
            });
            updateStatsBars();
            timerContainer.destroy();
            gameState.isModalOpen = false;
            showFloatingText(scene, player.x, player.y - 40, floatingParts.join(' '));
        }
    });
}

export function createRoundedButton(scene, x, y, width, height, text, color, onClick) {
    let btnContainer = scene.add.container(x, y);

    let bg = scene.add.graphics()
        .fillStyle(color, 0.25)
        .fillRoundedRect(-width / 2, -height / 2, width, height, 10)
        .lineStyle(2, color, 1)
        .strokeRoundedRect(-width / 2, -height / 2, width, height, 10);

    let label = scene.add.text(0, 0, text, {
        fontSize: '15px',
        fill: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    // Samotný pod-kontajner spravíme interaktívnym po celej ploche tlačidla
    btnContainer.setSize(width, height).setInteractive({ useHandCursor: true });

    btnContainer.on('pointerover', () => bg.setAlpha(0.75));
    btnContainer.on('pointerout', () => bg.setAlpha(1));
    btnContainer.on('pointerdown', onClick);

    btnContainer.add([bg, label]);
    // Uložíme si odkaz na text, aby sa dal neskôr ľahko meniť (napr. Vypustiť / Zatvoriť)
    btnContainer.label = label;

    return btnContainer;
}

