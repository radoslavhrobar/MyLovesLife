import { gameState, showFloatingText } from './state.js';
import { createTouchControls, createStatsBubble, openBedModal } from './ui.js';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.touchControls = { left: false, right: false, up: false, down: false };
    }

    init() {
        this.gameWidth = this.sys.game.config.width;
        this.gameHeight = this.sys.game.config.height;
    }

    preload() {
        let btnGraphic = this.make.graphics({ x: 0, y: 0, add: false });
        btnGraphic.fillStyle(0xffffff, 0.1).fillRoundedRect(0, 0, 60, 60, 10);
        btnGraphic.lineStyle(3, 0xffffff, 0.8).strokeRoundedRect(0, 0, 60, 60, 10);
        btnGraphic.generateTexture('buttonBg', 60, 60);

        const createPhoto = (key, color) => {
            let g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(color, 1).fillRoundedRect(0, 0, 160, 110, 10);
            g.lineStyle(3, 0xffffff, 0.8).strokeRoundedRect(0, 0, 160, 110, 10);
            g.generateTexture(key, 160, 110);
        };

        createPhoto('sleep1', 0x2c3e50);
        createPhoto('sleep2', 0x1a252f);
        createPhoto('movie1', 0x8e44ad);
        createPhoto('movie2', 0xc0392b);
    }

    create() {
        this.wallThick = 12;

        this.roomGroup = this.add.group();
        this.outsideGroup = this.add.group();
        this.outsideObstacles = this.physics.add.staticGroup();

        // 1. IZBA
        this.cameras.main.setBackgroundColor('#a16c4b');
        const carpetW = this.gameWidth * 0.7, carpetH = this.gameHeight * 0.6;
        let carpet = this.add.graphics().fillStyle(0x3a5a40, 1).fillRect((this.gameWidth - carpetW) / 2, (this.gameHeight - carpetH) / 2, carpetW, carpetH);

        let bedG = this.make.graphics({ x: 0, y: 0, add: false });
        bedG.fillStyle(0x5c3a21, 1).fillRoundedRect(0, 0, 110, 170, 8);
        bedG.fillStyle(0xecf0f1, 1).fillRoundedRect(10, 10, 90, 40, 6);
        bedG.fillStyle(0xe74c3c, 1).fillRoundedRect(8, 55, 94, 107, 6);
        bedG.generateTexture('bedTexture', 110, 170);

        this.bed = this.physics.add.staticSprite(this.wallThick + 65, this.gameHeight - this.wallThick - 95, 'bedTexture').setInteractive();

        let roomWallsG = this.add.graphics().fillStyle(0x7f8c8d, 1).setDepth(5);
        roomWallsG.fillRect(0, 0, this.gameWidth, this.wallThick); // horná
        roomWallsG.fillRect(0, 0, this.wallThick, this.gameHeight); // ľavá
        roomWallsG.fillRect(this.gameWidth - this.wallThick, 0, this.wallThick, this.gameHeight); // pravá

        let bottomWallG = this.add.graphics().fillStyle(0x7f8c8d, 1).setDepth(5);
        bottomWallG.fillRect(0, this.gameHeight - this.wallThick, this.gameWidth, this.wallThick); // dolná (ostáva)

        this.roomWalls = this.physics.add.staticGroup();
        this.roomWalls.create(this.gameWidth / 2, this.wallThick / 2).setSize(this.gameWidth, this.wallThick).setVisible(false);
        this.roomWalls.create(this.wallThick / 2, this.gameHeight / 2).setSize(this.wallThick, this.gameHeight).setVisible(false);
        this.roomWalls.create(this.gameWidth - this.wallThick / 2, this.gameHeight / 2).setSize(this.wallThick, this.gameHeight).setVisible(false);

        this.bottomWall = this.physics.add.staticSprite(this.gameWidth / 2, this.gameHeight - this.wallThick / 2)
            .setSize(this.gameWidth, this.wallThick)
            .setVisible(false);

        let doorUpperG = this.make.graphics({ x: 0, y: 0, add: false });
        // Zárubňa a krídlo dverí na výšku (šírka 18, výška 75)
        doorUpperG.fillStyle(0x4e342e, 1).fillRect(0, 0, 18, 75);
        doorUpperG.fillStyle(0xaf9e75, 1).fillRect(3, 5, 12, 65);
        // Kľučka nalepená zvonka (vpravo od obdĺžnika dverí)
        doorUpperG.fillStyle(0xaf9e75, 1).fillRect(18, 56, 6, 4); // kľučka
        doorUpperG.fillCircle(23, 58, 3); // zaoblený koniec kľučky
        doorUpperG.generateTexture('doorUpperTexture', 26, 75);

        // 2. Dvere vonku (na šírku, kľučka trčí hore na dvor)
        let doorBottomG = this.make.graphics({ x: 0, y: 0, add: false });
        doorBottomG.fillStyle(0x4e342e, 1).fillRect(0, 8, 75, 18);
        doorBottomG.fillStyle(0xaf9e75, 1).fillRect(5, 11, 65, 12);
        doorBottomG.fillStyle(0xaf9e75, 1).fillRect(15, 2, 4, 6); // kľučka hore
        doorBottomG.fillCircle(17, 3, 3);
        doorBottomG.generateTexture('doorBottomTexture', 75, 26);

        // Nalepené na ľavú stenu (this.wallThick) a posunuté hore (this.wallThick + 55)
        // Stred textúry je v X = this.wallThick + 13 (polovica zo šírky 26)
        this.door = this.physics.add.staticSprite(this.wallThick, this.wallThick, 'doorUpperTexture')
            .setOrigin(0,0)
            .setInteractive({ useHandCursor: true })
            .setDepth(6);
        this.door.refreshBody();

        this.roomGroup.addMultiple([carpet, this.bed, roomWallsG]);

        // 2. DVOR
        let grass = this.add.graphics().fillStyle(0x4caf50, 1).fillRect(0, 0, this.gameWidth, this.gameHeight);
        grass.fillStyle(0x388e3c, 1).fillRect(150, 200, 30, 10).fillRect(420, 500, 35, 12);
        this.outsideGroup.add(grass);

        let dogG = this.make.graphics({ x: 0, y: 0, add: false });
        dogG.fillStyle(0x8d6e63, 1).fillRoundedRect(10, 30, 100, 90, 6);
        dogG.fillStyle(0xc0392b, 1).fillTriangle(0, 35, 60, 0, 120, 35);
        dogG.fillStyle(0x1e272e, 1).fillRoundedRect(40, 65, 40, 55, { tl: 20, tr: 20, bl: 0, br: 0 });
        dogG.generateTexture('doghouseTexture', 120, 120);

        let doghouse = this.outsideObstacles.create(this.wallThick + 75, this.gameHeight - this.wallThick - 75, 'doghouseTexture');
        this.outsideGroup.add(doghouse);

        let treeG = this.make.graphics({ x: 0, y: 0, add: false });
        treeG.fillStyle(0x5d4037, 1).fillRect(35, 60, 20, 40);
        treeG.fillStyle(0x1b5e20, 1).fillCircle(45, 45, 38);
        treeG.fillStyle(0x2e7d32, 1).fillCircle(38, 38, 26);
        treeG.generateTexture('treeTexture', 90, 100);

        [{ x: this.gameWidth - this.wallThick - 55, y: 140 }, { x: this.gameWidth - this.wallThick - 65, y: 310 }, { x: this.gameWidth - this.wallThick - 50, y: 480 }].forEach(pos => {
            let tree = this.outsideObstacles.create(pos.x, pos.y, 'treeTexture');
            tree.body.setSize(40, 40).setOffset(25, 50);
            this.outsideGroup.add(tree);
        });

        this.outsideGroup.setVisible(false);
        this.outsideObstacles.getChildren().forEach(obj => obj.body.enable = false);

        let playerG = this.make.graphics({ x: 0, y: 0, add: false }).fillStyle(0x3498db, 1).fillRect(0, 0, 40, 40);
        playerG.generateTexture('playerTexture', 40, 40);

        this.player = this.physics.add.sprite(this.gameWidth / 2, this.gameHeight / 2, 'playerTexture').setInteractive().setDepth(8).setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.door);
        this.physics.add.collider(this.player, this.roomWalls);
        this.physics.add.collider(this.player, this.bottomWall);
        this.physics.add.collider(this.player, this.bed);
        this.physics.add.collider(this.player, this.outsideObstacles);

        // 4. UI A INTERAKCIE
        this.statsUI = createStatsBubble(this, this.player);
        this.setupMenus();

        this.player.on('pointerdown', () => {
            if (!gameState.isModalOpen) this.statsUI.container.setVisible(!this.statsUI.container.visible);
        });

        this.bed.on('pointerdown', () => {
            if (gameState.isModalOpen || gameState.currentLocation !== 'room') return;
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bed.x, this.bed.y) <= 110) {
                this.bedMenu.setVisible(!this.bedMenu.visible);
                this.doorMenu.setVisible(false);
            } else {
                showFloatingText(this, this.bed.x + 40, this.bed.y - 90, 'Si ďaleko mimka!');
            }
        });

        this.door.on('pointerdown', () => {
            if (gameState.isModalOpen) return;
            // Kontrola vzdialenosti od stredu dverí (getCenter) je presnejšia
            const doorCenter = this.door.getCenter();
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, doorCenter.x, doorCenter.y) <= 100) {
                this.doorActionBtn.setText(gameState.currentLocation === 'room' ? 'POME VON! ☀️' : 'POME DOMOV!🏠');
                this.doorMenu.setVisible(!this.doorMenu.visible);
                this.bedMenu.setVisible(false);
            } else {
                const isOutside = gameState.currentLocation === 'outside';
                const textX = isOutside ? doorCenter.x - 60 : doorCenter.x + 110;
                const textY = isOutside ? doorCenter.y - 30 : doorCenter.y + 15;
                showFloatingText(this, textX, textY, 'Príď bližšie k dverám!');
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.addPointer(2);
        createTouchControls(this, this.gameWidth, this.gameHeight, this.touchControls);
    }

    setupMenus() {
        // Mini menu postele
        this.bedMenu = this.add.container(this.bed.x, this.bed.y - 20).setDepth(25).setVisible(false);
        let bedBg = this.add.graphics().fillStyle(0x1e272e, 0.9).fillRoundedRect(-75, -45, 150, 90, 10).lineStyle(2, 0xffffff, 0.6).strokeRoundedRect(-75, -45, 150, 90, 10);
        let sleepBtn = this.add.text(0, -20, '😴 spať', { fontSize: '18px', fill: '#fff', backgroundColor: '#2c3e50', padding: { x: 12, y: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        let movieBtn = this.add.text(0, 20, '🎬 kukať', { fontSize: '18px', fill: '#fff', backgroundColor: '#8e44ad', padding: { x: 12, y: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        sleepBtn.on('pointerdown', () => { this.bedMenu.setVisible(false); openBedModal(this, this.gameWidth, this.gameHeight, this.bed, this.player, 'sleep'); });
        movieBtn.on('pointerdown', () => { this.bedMenu.setVisible(false); openBedModal(this, this.gameWidth, this.gameHeight, this.bed, this.player, 'movie'); });
        this.bedMenu.add([bedBg, sleepBtn, movieBtn]);

        // Mini menu dverí
        this.doorMenu = this.add.container(this.door.x + 95, this.door.y + 50).setDepth(25).setVisible(false);
        let doorBg = this.add.graphics().fillStyle(0x1e272e, 0.9).fillRoundedRect(-80, -45, 160, 90, 10).lineStyle(2, 0xffffff, 0.6).strokeRoundedRect(-80, -45, 160, 90, 10);
        this.doorActionBtn = this.add.text(0, -18, 'POME VON! ☀️', { fontSize: '16px', fill: '#fff', backgroundColor: '#105f31', padding: { x: 10, y: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        let stayBtn = this.add.text(0, 20, 'Zostať tu ❌', { fontSize: '15px', fill: '#fff', backgroundColor: '#2c3e50', padding: { x: 10, y: 4 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.doorActionBtn.on('pointerdown', () => { this.doorMenu.setVisible(false); this.switchLocation(gameState.currentLocation === 'room' ? 'outside' : 'room'); });
        stayBtn.on('pointerdown', () => this.doorMenu.setVisible(false));
        this.doorMenu.add([doorBg, this.doorActionBtn, stayBtn]);
    }

    switchLocation(target) {
        gameState.currentLocation = target;
        const isOutside = target === 'outside';

        // Vypnutie/zapnutie stien a nábytku v izbe
        this.roomGroup.setVisible(!isOutside);
        this.bed.body.enable = !isOutside;
        this.roomWalls.getChildren().forEach(wall => wall.body.enable = !isOutside);

        // Vypnutie/zapnutie dvora
        this.outsideGroup.setVisible(isOutside);
        this.outsideObstacles.getChildren().forEach(obj => obj.body.enable = isOutside);

        // Zastavenie prípadnej bežiacej animácie dverí
        this.tweens.killTweensOf(this.door);
        this.door.setAngle(0);

        if (isOutside) {
            // DVERE VONKU: dole vpravo nalepené na spodnú stenu
            this.door.setTexture('doorBottomTexture');
            this.door.setOrigin(0, 1); // Pánt vľavo dole pri stene
            this.door.setPosition(this.gameWidth - this.wallThick - 75 - 20, this.gameHeight - this.wallThick);
            this.door.refreshBody();
            this.door.input.hitArea.setSize(75, 26);

            // Menu dverí a hráč nad dverami
            this.doorMenu.setPosition(this.door.x + 10, this.door.y - 75);
            this.player.setPosition(this.door.x + 37, this.door.y - 50);
        } else {
            // DVERE V IZBE: hore vľavo nalepené na ľavú stenu
            this.door.setTexture('doorUpperTexture');
            this.door.setOrigin(0, 0); // Pánt vľavo hore pri stene
            this.door.setPosition(this.wallThick, this.wallThick);
            this.door.refreshBody();
            this.door.input.hitArea.setSize(26, 75);

            // Menu dverí a hráč napravo od dverí
            this.doorMenu.setPosition(this.door.x + 95, this.door.y + 50);
            this.player.setPosition(this.door.x + 55, this.door.y + 37);
        }

        // Animácia pootvorenia dverí (v izbe -60°, vonku +60° smerom na dvor)
        this.tweens.add({
            targets: this.door,
            angle: isOutside ? 60 : -60,
            duration: 700,
            yoyo: true,
            ease: 'Power2'
        });

        showFloatingText(
            this,
            isOutside ? this.player.x - 45 : this.player.x + 55,
            isOutside ? this.player.y - 50 : this.player.y + 70,
            isOutside ? 'Si vonku!🌳' : 'Si domka!🏠'
        );
    }

    update() {
        if (gameState.isModalOpen) {
            this.player.setVelocity(0);
            return;
        }
        const speed = 200;
        this.player.setVelocity(0);
        if (this.cursors.left.isDown || this.touchControls.left) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown || this.touchControls.right) this.player.setVelocityX(speed);
        if (this.cursors.up.isDown || this.touchControls.up) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown || this.touchControls.down) this.player.setVelocityY(speed);
        if (this.bedMenu.visible && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bed.x, this.bed.y) > 170) this.bedMenu.setVisible(false);
        if (this.doorMenu.visible && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.door.x, this.door.y) > 140) this.doorMenu.setVisible(false);
        this.statsUI.container.x = this.player.x;
        this.statsUI.container.y = this.player.y - this.statsUI.offsetY;
    }
}