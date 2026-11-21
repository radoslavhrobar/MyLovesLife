import { gameState, showFloatingText } from './state.js';
import { createTouchControls, createStatsBubble, openBedModal, createRoundedButton} from './ui.js';

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

        this.doghouse = this.outsideObstacles.create(this.wallThick + 75, this.gameHeight - this.wallThick - 75, 'doghouseTexture')
            .setInteractive({ useHandCursor: true });
        this.outsideGroup.add(this.doghouse);

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

        // --- RUŽOVÁ LOPTIČKA NA DVORE ---
        let ballG = this.make.graphics({ x: 0, y: 0, add: false });
        this.halfBall = 12;
        ballG.fillStyle(0xff72c4, 1).fillCircle(this.halfBall, this.halfBall, 11);
        ballG.lineStyle(2, 0xffffff, 0.85).strokeCircle(this.halfBall, this.halfBall, 11);
        // Biely prúžok na loptičke, aby bolo pekne vidieť jej točenie pri lete
        ballG.lineStyle(2, 0xffffff, 0.9).beginPath().arc(this.halfBall, this.halfBall, 7, 0.2, 2.2).strokePath();
        ballG.generateTexture('pinkBallTexture', this.halfBall * 2, this.halfBall * 2);

        this.ball = this.add.sprite(this.gameWidth / 2, 120, 'pinkBallTexture')
            .setDepth(7)
            .setInteractive({ useHandCursor: true });
        this.outsideGroup.add(this.ball);

        // Grafika pre bielu mieriaci šípku
        this.aimGraphics = this.add.graphics().setDepth(18);
        this.isAimingBall = false;
        this.isBallFlying = false;

        this.outsideGroup.setVisible(false);
        this.outsideObstacles.getChildren().forEach(obj => obj.body.enable = false);

        let playerG = this.make.graphics({ x: 0, y: 0, add: false }).fillStyle(0x3498db, 1).fillRect(0, 0, 40, 40);
        playerG.generateTexture('playerTexture', 40, 40);

        this.player = this.physics.add.sprite(this.gameWidth / 2, this.gameHeight / 2, 'playerTexture').setInteractive().setDepth(8).setCollideWorldBounds(true);

        let theoG = this.make.graphics({ x: 0, y: 0, add: false }).fillStyle(0xd35400, 1).fillRect(0, 0, 36, 36);
        theoG.generateTexture('theoTexture', 36, 36);

        this.theo = this.physics.add.sprite(this.doghouse.x + 85, this.doghouse.y, 'theoTexture')
            .setDepth(8)
            .setCollideWorldBounds(true)
            .setInteractive({ useHandCursor: true });

        this.theo.setVisible(false);
        this.theo.body.enable = false;
        this.isTheoOutside = false;
        this.isPettingTheo = false;

        this.physics.add.collider(this.theo, this.door);
        this.physics.add.collider(this.theo, this.bottomWall);
        this.physics.add.collider(this.theo, this.outsideObstacles);
        this.physics.add.collider(this.player, this.theo);
        this.physics.add.collider(this.player, this.door);
        this.physics.add.collider(this.player, this.roomWalls);
        this.physics.add.collider(this.player, this.bottomWall);
        this.physics.add.collider(this.player, this.bed);
        this.physics.add.collider(this.player, this.outsideObstacles);

        // 4. UI A INTERAKCIE
        this.statsUI = createStatsBubble(this, this.player);
        this.setupMenus();

        this.player.on('pointerdown', () => {
            if (gameState.isModalOpen || this.isAimingBall) return;
            this.statsUI.container.setVisible(!this.statsUI.container.visible)
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
            if (this.isAimingBall) {
                showFloatingText(this, pointer.x, pointer.y - 25, 'Tam nemôžeš hodiť!🚫');
                return;
            }
            // Kontrola vzdialenosti od stredu dverí (getCenter) je presnejšia
            const doorCenter = this.door.getCenter();
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, doorCenter.x, doorCenter.y) <= 100) {
                this.doorActionBtn.label.setText(gameState.currentLocation === 'room' ? 'POME VON! ☀️' : 'POME DOMOV!🏠');
                this.doorMenu.setVisible(!this.doorMenu.visible);
                this.bedMenu.setVisible(false);
            } else {
                const isOutside = gameState.currentLocation === 'outside';
                const textX = isOutside ? doorCenter.x - 60 : doorCenter.x + 110;
                const textY = isOutside ? doorCenter.y - 30 : doorCenter.y + 15;
                showFloatingText(this, textX, textY, 'Príď bližšie k dverám!');
            }
        });

        this.doghouse.on('pointerdown', () => {
            if (gameState.isModalOpen || gameState.currentLocation !== 'outside') return;
            if (this.isAimingBall) {
                showFloatingText(this, pointer.x, pointer.y - 25, 'Tam nemôžeš hodiť!🚫');
                return;
            }
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.doghouse.x, this.doghouse.y) <= 130) {
                this.dogActionBtn.label.setText(this.isTheoOutside ? 'MIESTO!🐕' : 'Thejko von!🐕');
                this.doghouseMenu.setVisible(!this.doghouseMenu.visible);
                this.doorMenu.setVisible(false);
                this.bedMenu.setVisible(false);
            } else {
                showFloatingText(this, this.doghouse.x + 40, this.doghouse.y - 80, 'Príď bližšie k búde!');
            }
        });

        // 1. Kliknutie na loptičku -> zapne mierenie (ak je hráč blízko)
        this.ball.on('pointerdown', (pointer) => {
            if (gameState.isModalOpen || gameState.currentLocation !== 'outside' || this.isBallFlying) return;

            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.ball.x, this.ball.y) <= this.halfBall + (this.player.width / 2) + 10) {
                this.isAimingBall = !this.isAimingBall;
                if (!this.isAimingBall) this.aimGraphics.clear();
            } else {
                showFloatingText(this, this.ball.x, this.ball.y - 30, 'Príď bližšie k loptičke!');
            }
        });

        // 2. Druhé kliknutie kamkoľvek na obrazovku -> hodí loptičku na miesto kurzora
        this.input.on('pointerdown', (pointer, currentlyOver) => {
            if (currentlyOver.length > 0) return; // Ak je kliknutie na interaktívny objekt, ignorujeme ho
            if (!this.isAimingBall || gameState.isModalOpen || gameState.currentLocation !== 'outside') return;

            // Ochrana, aby sa loptička nehodila do dolnej steny alebo mimo obrazovku
            const targetX = Phaser.Math.Clamp(pointer.x, 25, this.gameWidth - 25);
            const targetY = Phaser.Math.Clamp(pointer.y, 25, this.gameHeight - this.wallThick - 20);

            if (this.isPointBlocked(targetX, targetY)) {
                showFloatingText(this, targetX, targetY - 25, 'Tam nemôžeš hodiť!🚫');
                return;
            }

            this.throwBall(targetX, targetY);
        });

        this.theo.on('pointerdown', () => {
            if (gameState.isModalOpen || gameState.currentLocation !== 'outside' || !this.isTheoOutside || this.isAimingBall) return;
            // Ak už Thea hladkáš, ďalší klik ho znova pustí behať
            if (this.isPettingTheo) {
                this.stopPettingTheo();
                return;
            }
            // Kontrola priameho dotyku (stred hráča vs stred psa <= 58 px)
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.theo.x, this.theo.y) <= 58) {
                this.startPettingTheo();
            } else {
                showFloatingText(this, this.theo.x, this.theo.y - 35, 'Poď bližšie k Thejkovi! 🐕');
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.addPointer(2);
        createTouchControls(this, this.gameWidth, this.gameHeight, this.touchControls);
    }

    setupMenus() {
        // 1. Mini menu postele
        this.bedMenu = this.add.container(this.bed.x, this.bed.y - 20).setDepth(25).setVisible(false);
        let bedBg = this.add.graphics()
            .fillStyle(0x1e272e, 0.92)
            .fillRoundedRect(-80, -50, 160, 100, 12)
            .lineStyle(2, 0xffffff, 0.6)
            .strokeRoundedRect(-80, -50, 160, 100, 12);

        let sleepBtn = createRoundedButton(this, 0, -22, 136, 36, 'Idzem spať😴 ', 0x3498db, () => {
            this.bedMenu.setVisible(false);
            openBedModal(this, this.gameWidth, this.gameHeight, this.bed, this.player, 'sleep');
        });

        let movieBtn = createRoundedButton(this, 0, 22, 136, 36, 'Idzem kukať🎬', 0x9b59b6, () => {
            this.bedMenu.setVisible(false);
            openBedModal(this, this.gameWidth, this.gameHeight, this.bed, this.player, 'movie');
        });

        this.bedMenu.add([bedBg, sleepBtn, movieBtn]);

        // 2. Mini menu dverí
        this.doorMenu = this.add.container(this.door.x + 95, this.door.y + 50).setDepth(25).setVisible(false);
        let doorBg = this.add.graphics()
            .fillStyle(0x1e272e, 0.92)
            .fillRoundedRect(-90, -50, 180, 100, 12)
            .lineStyle(2, 0xffffff, 0.6)
            .strokeRoundedRect(-90, -50, 180, 100, 12);

        this.doorActionBtn = createRoundedButton(this, 0, -22, 156, 36, 'POME VON!☀️', 0x2ecc71, () => {
            this.doorMenu.setVisible(false);
            this.switchLocation(gameState.currentLocation === 'room' ? 'outside' : 'room');
        });

        let stayBtn = createRoundedButton(this, 0, 22, 156, 36, 'Zostať tu❌', 0x95a5a6, () => {
            this.doorMenu.setVisible(false);
        });

        this.doorMenu.add([doorBg, this.doorActionBtn, stayBtn]);

        // 3. Mini menu búdy
        this.doghouseMenu = this.add.container(this.doghouse.x + 25, this.doghouse.y - 115).setDepth(25).setVisible(false);
        let dogBg = this.add.graphics()
            .fillStyle(0x1e272e, 0.92)
            .fillRoundedRect(-95, -50, 190, 100, 12)
            .lineStyle(2, 0xffffff, 0.6)
            .strokeRoundedRect(-95, -50, 190, 100, 12);

        this.dogActionBtn = createRoundedButton(this, 0, -22, 164, 36, 'Thejko von!🐕', 0xff72c4, () => {
            this.doghouseMenu.setVisible(false);
            this.toggleTheo();
        });

        let feedBtn = createRoundedButton(this, 0, 22, 164, 36, 'Doplniť vodu..🥣', 0x3498db, () => {
            this.doghouseMenu.setVisible(false);
            showFloatingText(this, this.doghouse.x + 40, this.doghouse.y - 60, 'Voda doplnená!💧');
        });

        this.doghouseMenu.add([dogBg, this.dogActionBtn, feedBtn]);
    }

    toggleTheo() {
        this.isTheoOutside = !this.isTheoOutside;

        if (this.isTheoOutside) {
            // Vypustenie Thea pred búdu
            this.theo.setPosition(this.doghouse.x + 110, this.doghouse.y);
            this.theo.setVisible(true);
            this.theo.body.enable = true;
            showFloatingText(this, this.theo.x, this.theo.y - 40, 'Haf!🐕');

            // Spustenie náhodného behania po dvore
            if (!this.theoTimer) {
                this.theoTimer = this.time.addEvent({
                    delay: 1400, // zmena smeru každých 1,4 sekundy
                    loop: true,
                    callback: () => {
                        if (!this.isTheoOutside || gameState.currentLocation !== 'outside' || gameState.isModalOpen || this.isPettingTheo) {
                            this.theo.setVelocity(0);
                            return;
                        }
                        // Občas sa na chvíľu zastaví (20 % šanca)
                        if (Phaser.Math.Between(1, 5) === 1) {
                            this.theo.setVelocity(0);
                            return;
                        }
                        this.setTheoSettings();
                    }
                });
            }
        } else {
            // Zatvorenie Thea do búdy
            this.stopPettingTheo();
            this.theo.setVelocity(0);
            this.theo.setVisible(false);
            this.theo.body.enable = false;
            showFloatingText(this, this.doghouse.x + 40, this.doghouse.y - 80, 'Už je pekne v búde🐕');
        }
    }

    startPettingTheo() {
        this.isPettingTheo = true;
        this.theo.setVelocity(0);
        this.theo.body.immovable = true; // Aby hráč psa pri dotyku neodtláčal

        // Plávajúca ikona ruky nad Theom
        this.petHandIcon = this.add.text(this.theo.x, this.theo.y - 35, '✋', {
            fontSize: '26px'
        }).setOrigin(0.5).setDepth(20);

        // Animácia hladkania rukou (hore-dole a mierne nakláňanie)
        this.petHandTween = this.tweens.add({
            targets: this.petHandIcon,
            y: this.theo.y - 25,
            angle: { from: -15, to: 15 },
            duration: 350,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Časovač, ktorý každých 500 ms vypustí stúpajúce srdiečko
        this.petHeartsTimer = this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                let heart = this.add.text(
                    this.theo.x + Phaser.Math.Between(-18, 18),
                    this.theo.y - 25,
                    Phaser.Math.RND.pick(['❤️', '💖', '💕']),
                    { fontSize: '18px' }
                ).setOrigin(0.5).setDepth(21);

                this.tweens.add({
                    targets: heart,
                    y: heart.y - 45,
                    alpha: 0,
                    scale: 1.3,
                    duration: 900,
                    ease: 'Power1',
                    onComplete: () => heart.destroy()
                });
            }
        });
    }

    stopPettingTheo() {
        if (!this.isPettingTheo) return;
        this.isPettingTheo = false;
        this.theo.body.immovable = false;

        // Zničenie animácie ruky a časovača srdiečok
        if (this.petHandTween) this.petHandTween.stop();
        if (this.petHandIcon) this.petHandIcon.destroy();
        if (this.petHeartsTimer) this.petHeartsTimer.remove();

        // Okamžite psa znova rozbehne
        this.setTheoSettings();
        showFloatingText(this, this.theo.x, this.theo.y - 35, 'Haf!🐾');
    }

    setTheoSettings() {
        const dogSpeed = 200;
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        this.theo.setVelocity(Math.cos(angle) * dogSpeed, Math.sin(angle) * dogSpeed);
    }

    isPointBlocked(x, y) {
        const colliders = [
            ...this.outsideObstacles.getChildren(),
            this.door,
            ...(this.isTheoOutside ? [this.theo] : [])
        ];

        return colliders.some(obj => {
            if (!obj.body || !obj.body.enable) return false;
            return (
                x + this.halfBall > obj.body.x &&
                x - this.halfBall < obj.body.x + obj.body.width &&
                y + this.halfBall > obj.body.y &&
                y - this.halfBall < obj.body.y + obj.body.height
            );
        });
    }

    throwBall(targetX, targetY) {
        this.isAimingBall = false;
        this.isBallFlying = true;
        this.aimGraphics.clear();

        const distance = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, targetX, targetY);
        // Čas letu sa prispôsobí vzdialenosti (min. 400 ms, max. 1200 ms)
        const flightDuration = Phaser.Math.Clamp(distance * 1.8, 400, 1200);

        // 1. Pohyb loptičky na cieľové miesto + točenie (rotácia)
        this.tweens.add({
            targets: this.ball,
            x: targetX,
            y: targetY,
            angle: this.ball.angle + (distance > 150 ? 720 : 360), // 1 až 2 otočky vo vzduchu
            duration: flightDuration,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.isBallFlying = false;
            }
        });

        // 2. Optický efekt výšky hodu (zväčšenie v polovici letu a návrat)
        this.tweens.add({
            targets: this.ball,
            scale: 1.45,
            duration: flightDuration / 2,
            yoyo: true,
            ease: 'Sine.easeOut'
        });
    }

    drawAimArrow(pointer) {
        this.aimGraphics.clear();

        const startX = this.ball.x;
        const startY = this.ball.y;
        const endX = Phaser.Math.Clamp(pointer.x, 25, this.gameWidth - 25);
        const endY = Phaser.Math.Clamp(pointer.y, 25, this.gameHeight - this.wallThick - 20);

        const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
        if (distance < 15) return; // Nekreslí šípku, ak je kurzor priamo na loptičke

        const blocked = this.isPointBlocked(endX, endY);
        const arrowColor = blocked ? 0xe74c3c : 0xffffff;

        const angle = Phaser.Math.Angle.Between(startX, startY, endX, endY);

        // Biela čiara smerujúca od loptičky ku kurzoru
        this.aimGraphics.lineStyle(3, arrowColor, 0.9);
        this.aimGraphics.beginPath();
        this.aimGraphics.moveTo(startX, startY);
        this.aimGraphics.lineTo(endX, endY);
        this.aimGraphics.strokePath();

        // Hrot bielej šípky na konci pri kurzore
        const headLen = 14;
        this.aimGraphics.fillStyle(arrowColor, 0.95);
        this.aimGraphics.fillTriangle(
            endX, endY,
            endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6),
            endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6)
        );
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

        this.isAimingBall = false;
        this.aimGraphics.clear();

        const showTheo = isOutside && this.isTheoOutside;
        this.theo.setVisible(showTheo);
        this.theo.body.enable = showTheo;
        if (!showTheo) this.theo.setVelocity(0);
        this.stopPettingTheo();

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
            isOutside ? this.player.x - 150 : this.player.x + 55,
            isOutside ? this.player.y - 5 : this.player.y + 70,
            isOutside ? 'Si vonku!🌳' : 'Si domka!🏠'
        );
    }

    update() {
        if (gameState.isModalOpen) {
            this.player.setVelocity(0);
            this.theo.setVelocity(0);
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
        if (this.doghouseMenu.visible && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.doghouse.x, this.doghouse.y) > 170) this.doghouseMenu.setVisible(false);
        if (this.isPettingTheo && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.theo.x, this.theo.y) > 75) this.stopPettingTheo();
        if (this.isAimingBall) {
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.ball.x, this.ball.y) > 95) {
                this.isAimingBall = false;
                this.aimGraphics.clear();
            } else {
                this.drawAimArrow(this.input.activePointer);
            }
        }
        this.statsUI.container.x = this.player.x;
        this.statsUI.container.y = this.player.y - this.statsUI.offsetY;
    }
}