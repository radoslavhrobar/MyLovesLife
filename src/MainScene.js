import { gameState, bedOptions, foodOptions, statsConfig, showFloatingText, theoStatsConfig} from './state.js';
import {
    createTouchControls,
    createStatsBubble,
    createTheoStatsBubble,
    openSelectionModal,
    createRoundedButton,
    startActivityTimer,
    updateStatsBars,
    updateTheoStatsBars
} from './ui.js';

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
        createPhoto('food1', 0xd35400);
        createPhoto('food2', 0xe67e22);

        this.load.image('visitBg', 'src/assets/frontHouse.png');
        this.load.image('car', 'src/assets/car.PNG');
        this.load.image('phone', 'src/assets/car.PNG');
        this.load.image('racket', 'src/assets/car.PNG');
        this.load.image('stanleyCup', 'src/assets/car.PNG');
        this.load.image('kapustnica', 'src/assets/kapustnica.webp');
        this.load.image('sulance', 'src/assets/sulance.jpg');
        this.load.image('salat', 'src/assets/salat.webp');
        this.load.image('snackday', 'src/assets/snackday.jpg');
        this.load.image('bananas', 'src/assets/bananiky.jpg');
        this.load.image('mozzarella', 'src/assets/mozzarella.jpg');
        this.load.image('farma', 'src/assets/farma.jpg');
        this.load.image('loveisland', 'src/assets/loveisland.jpg');
        this.load.image('ruza', 'src/assets/ruza.jpg');
        this.load.image('zamena', 'src/assets/zamena.jpg');
    }

    create() {
        this.wallThick = 12;

        this.roomGroup = this.add.group();
        this.outsideGroup = this.add.group();
        this.outsideObstacles = this.physics.add.staticGroup();
        this.visitGroup = this.add.group();

        // 1. Hlavná fotka roztiahnutá na celú scénu
        let visitBg = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'visitBg')
            .setDisplaySize(this.gameWidth, this.gameHeight)
            .setDepth(30);

        // 2. Druhá fotka umiestnená na nejakom mieste vpravo
        let rightPhoto = this.add.image(this.gameWidth - 300, this.gameHeight - 200, 'car')
            .setDisplaySize(600, 400) // uprav si rozmery podľa potreby
            .setDepth(31);

        // 3. Lomená šípka vychádzajúca zľava hore (napr. z [40, 40] -> zlom [40, 140] -> do rámčeka)
        let arrowG = this.add.graphics().setDepth(32);
        arrowG.lineStyle(4, 0xff00fb, 0.95);
        arrowG.beginPath();
        arrowG.moveTo(40, 100);   // začiatok vľavo hore
        arrowG.lineTo(40, 140);  // zvislá časť nadol
        arrowG.lineTo(130, 140); // vodorovná časť doprava k rámčeku
        arrowG.strokePath();

        // Hrot šípky na konci čiary pri rámčeku [130, 140]
        arrowG.fillStyle(0xff00fb, 0.95);
        arrowG.fillTriangle(138, 140, 124, 132, 124, 148);

        // 4. Rámček vedľa hrotu šípky s tlačidlom "Poďme hrať bedminton!"
        let boxX = 250;
        let boxY = 140;
        let boxW = 230;
        let boxH = 70;

        let inviteBox = this.add.graphics().setDepth(32);
        inviteBox.fillStyle(0x1e272e, 0.92)
            .fillRoundedRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, 12)
            .lineStyle(2, 0xff72c4, 0.7)
            .strokeRoundedRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, 12);

        // Tvoje tlačidlo cez createRoundedButton vnútri rámčeka
        let enterBtn = createRoundedButton(this, boxX, boxY, 210, 42, 'Poďme hrať bedminton!💖', 0xff72c4, () => {
            this.startBadmintonSetup();
        }).setDepth(33);

        // Pridanie všetkých prvkov do skupiny a skrytie na štarte
        this.visitGroup.addMultiple([visitBg, rightPhoto, arrowG, inviteBox, enterBtn]);
        this.visitGroup.setVisible(false);

        // 1. IZBA
        this.cameras.main.setBackgroundColor('#a16c4b');
        const carpetW = this.gameWidth * 0.7, carpetH = this.gameHeight * 0.6;
        let carpet = this.add.graphics().fillStyle(0x3a5a40, 1).fillRect((this.gameWidth - carpetW) / 2, (this.gameHeight - carpetH) / 2, carpetW, carpetH);

        let bedG = this.make.graphics({ x: 0, y: 0, add: false });
        bedG.fillStyle(0x5c3a21, 1).fillRoundedRect(0, 0, 110, 170, 8);
        bedG.fillStyle(0xecf0f1, 1).fillRoundedRect(10, 10, 90, 40, 6);
        bedG.fillStyle(0xe74c3c, 1).fillRoundedRect(8, 55, 94, 107, 6);
        bedG.generateTexture('bedTexture', 110, 170);

        this.bed = this.physics.add.staticSprite(this.wallThick + 65, this.gameHeight - this.wallThick - 200, 'bedTexture').setInteractive();

        // --- STOLÍK V IZBE (nalepený na dolnej stene v strede) ---
        let tableG = this.make.graphics({ x: 0, y: 0, add: false });
        tableG.fillStyle(0x6d4c41, 1).fillRoundedRect(0, 0, 140, 65, 8);
        tableG.lineStyle(2, 0x3e2723, 1).strokeRoundedRect(0, 0, 140, 65, 8);
        tableG.generateTexture('tableTexture', 140, 65);

        // Stred X = this.gameWidth / 2, spodný okraj sa dotýka dolnej steny (this.gameHeight - this.wallThick - 32.5)
        this.table = this.physics.add.staticSprite(this.gameWidth / 2, this.gameHeight - this.wallThick - 32.5, 'tableTexture')
            .setInteractive({ useHandCursor: true })
            .setDepth(6);

        let roomWallsG = this.add.graphics().fillStyle(0x7f8c8d, 1).setDepth(5);
        roomWallsG.fillRect(0, 0, this.gameWidth, this.wallThick); // horná
        roomWallsG.fillRect(0, 0, this.wallThick, this.gameHeight); // ľavá
        roomWallsG.fillRect(this.gameWidth - this.wallThick, 0, this.wallThick, this.gameHeight); // pravá

        this.bottomWallG = this.add.graphics().fillStyle(0x7f8c8d, 1).setDepth(5);
        this.bottomWallG.fillRect(0, this.gameHeight - this.wallThick, this.gameWidth, this.wallThick); // dolná (ostáva)

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
        this.door = this.physics.add.staticSprite(this.wallThick, this.wallThick + 65, 'doorUpperTexture')
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(6);
        this.door.refreshBody();

        this.roomGroup.addMultiple([carpet, this.bed, this.table, roomWallsG]);

        // 2. DVOR
        let grass = this.add.graphics().fillStyle(0x4caf50, 1).fillRect(0, 0, this.gameWidth, this.gameHeight);
        grass.fillStyle(0x388e3c, 1).fillRect(150, 200, 30, 10).fillRect(420, 500, 35, 12);
        this.outsideGroup.add(grass);

        let dogG = this.make.graphics({ x: 0, y: 0, add: false });
        dogG.fillStyle(0x8d6e63, 1).fillRoundedRect(10, 30, 100, 90, 6);
        dogG.fillStyle(0xc0392b, 1).fillTriangle(0, 35, 60, 0, 120, 35);
        dogG.fillStyle(0x1e272e, 1).fillRoundedRect(40, 65, 40, 55, { tl: 20, tr: 20, bl: 0, br: 0 });
        dogG.generateTexture('doghouseTexture', 120, 120);

        this.doghouse = this.outsideObstacles.create(this.wallThick + 75, this.gameHeight - this.wallThick - 180, 'doghouseTexture')
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

        this.playerWidth = 40;
        this.playerHeight = 40;

        let playerG = this.make.graphics({ x: 0, y: 0, add: false }).fillStyle(0x3498db, 1).fillRect(0, 0, this.playerWidth, this.playerHeight);
        playerG.generateTexture('playerTexture', this.playerWidth, this.playerHeight);

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
        this.theoFetchState = 'none';

        // --- BEDMINTON (MINIHRA) ---
        this.isBadmintonMode = false;
        this.isBadmintonPlaying = false;
        this.badmintonGroup = this.add.group();

        // Druhý hráč (bot - fialovo-ružový štvorec)
        let botG = this.make.graphics({ x: 0, y: 0, add: false }).fillStyle(0xe84393, 1).fillRect(0, 0, 40, 40);
        botG.generateTexture('botTexture', 40, 40);

        this.bot = this.physics.add.sprite(this.gameWidth / 2, 100, 'botTexture')
            .setDepth(8)
            .setCollideWorldBounds(true);

        // Raketa hráča a raketa bota (fotky s fyzikou pre presné hitboxy)
        this.playerRacket = this.physics.add.sprite(this.player.x, this.player.y - 28, 'racket')
            .setDisplaySize(32, 56)
            .setDepth(9);
        this.playerRacket.body.setAllowGravity(false);

        this.botRacket = this.physics.add.sprite(this.bot.x, this.bot.y + 28, 'racket')
            .setDisplaySize(32, 56)
            .setFlipY(true)
            .setDepth(9);
        this.botRacket.body.setAllowGravity(false);

        let netLine = this.add.graphics().setDepth(4);
        netLine.lineStyle(3, 0xffffff, 0.45);
        netLine.beginPath();
        netLine.moveTo(0, this.gameHeight / 2);
        netLine.lineTo(this.gameWidth, this.gameHeight / 2);
        netLine.strokePath();

        // Ikona košíka (fyzikálny objekt s točením)
        this.shuttlecock = this.add.text(this.gameWidth / 2, this.gameHeight / 2, '🏸', { fontSize: '28px' })
            .setOrigin(0.5)
            .setDepth(12);
        this.physics.add.existing(this.shuttlecock);
        this.shuttlecock.body.setCircle(12, 4, 4);

        // Grafika pre jemný chvostík (trail) za košíkom
        this.shuttleTrailGraphics = this.add.graphics().setDepth(11);
        this.shuttleTrailPoints = [];
        this.badmintonGroup.add(this.shuttleTrailGraphics);


        // Tlačidlo HRAŤ uprostred obrazovky
        this.playBadmintonBtn = createRoundedButton(this, this.gameWidth / 2, this.gameHeight / 2, 160, 50, 'HRAŤ', 0xff72c4, () => {
            this.startBadmintonRound();
        }).setDepth(35);

        this.endBadmintonBtn = createRoundedButton(this, this.gameWidth - 135, 45, 230, 42, 'Poslať Radinka domov 🏠', 0xe74c3c, () => {
            this.exitBadminton();
        }).setDepth(35);

        this.badmintonGroup.addMultiple([netLine, this.bot, this.playerRacket, this.botRacket, this.shuttlecock, this.playBadmintonBtn, this.endBadmintonBtn]);
        this.badmintonGroup.setVisible(false);
        this.bot.body.enable = false;
        this.playerRacket.body.enable = false;
        this.botRacket.body.enable = false;
        this.shuttlecock.body.enable = false;

        // Prekrytie (overlap) rakiet s košíkom
        this.physics.add.overlap(this.playerRacket, this.shuttlecock, () => this.hitShuttlecock(this.playerRacket, true));
        this.physics.add.overlap(this.botRacket, this.shuttlecock, () => this.hitShuttlecock(this.botRacket, false));
        this.physics.add.collider(this.theo, this.door);
        this.physics.add.collider(this.theo, this.bottomWall);
        this.physics.add.collider(this.theo, this.outsideObstacles);
        this.physics.add.collider(this.player, this.theo);
        this.physics.add.collider(this.player, this.door);
        this.physics.add.collider(this.player, this.roomWalls);
        this.physics.add.collider(this.player, this.bottomWall);
        this.physics.add.collider(this.player, this.bed);
        this.physics.add.collider(this.player, this.outsideObstacles);
        this.physics.add.collider(this.player, this.table);

        // 4. UI A INTERAKCIE
        this.statsUI = createStatsBubble(this, this.player);
        this.theoStatsUI = createTheoStatsBubble(this, this.doghouse);
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

        this.table.on('pointerdown', () => {
            if (gameState.isModalOpen || gameState.currentLocation !== 'room') return;
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.table.x, this.table.y) <= 115) {
                this.tableMenu.setVisible(!this.tableMenu.visible);
                this.bedMenu.setVisible(false);
                this.doorMenu.setVisible(false);
            } else {
                showFloatingText(this, this.table.x, this.table.y - 55, 'Príď bližšie mimka!');
            }
        });

        this.door.on('pointerdown', (pointer) => {
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

        this.doghouse.on('pointerdown', (pointer) => {
            if (gameState.isModalOpen || gameState.currentLocation !== 'outside') return;
            if (this.isAimingBall) {
                showFloatingText(this, pointer.x, pointer.y - 25, 'Tam nemôžeš hodiť!🚫');
                return;
            }
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.doghouse.x, this.doghouse.y) <= 130) {
                const isTheoInDoghouse = !this.isTheoOutside;

                this.dogActionBtn.label.setText(isTheoInDoghouse ? 'Thejko von!🐕' : 'MIESTO!🐕');
                this.waterBtn.setVisible(true);             // Voda ostane stále
                this.feedBtn.setVisible(isTheoInDoghouse);  // Jedlo zmizne, keď je Theo vonku

                this.dogBg.clear();
                this.dogBg.fillStyle(0x1e272e, 0.92);
                this.dogBg.lineStyle(2, 0xff72c4, 0.6);

                if (isTheoInDoghouse) {
                    // Theo je v búde -> 3 tlačidlá
                    this.dogActionBtn.setY(-44);
                    this.waterBtn.setY(0);
                    this.feedBtn.setY(44);
                    this.dogBg.fillRoundedRect(-95, -70, 190, 140, 12);
                    this.dogBg.strokeRoundedRect(-95, -70, 190, 140, 12);
                } else {
                    // Theo je vonku -> feedBtn je skryté, ostávajú len 2 tlačidlá
                    this.dogActionBtn.setY(-22);
                    this.waterBtn.setY(22);
                    this.dogBg.fillRoundedRect(-95, -50, 190, 100, 12);
                    this.dogBg.strokeRoundedRect(-95, -50, 190, 100, 12);
                }
                const nextState = !this.doghouseMenu.visible;
                this.doghouseMenu.setVisible(nextState);
                this.theoStatsUI.container.setVisible(nextState); // Zobrazí/skryje štatistiky spolu s menu búdy
                this.doorMenu.setVisible(false);
                this.bedMenu.setVisible(false);
            } else {
                showFloatingText(this, this.doghouse.x + 40, this.doghouse.y - 80, 'Príď bližšie k búde!');
            }
        });

        // 1. Kliknutie na loptičku -> zapne mierenie (ak je hráč blízko)
        this.ball.on('pointerdown', () => {
            if (gameState.isModalOpen || gameState.currentLocation !== 'outside' || this.isBallFlying
                || this.theoFetchState !== 'none') return;

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
                theoStatsConfig.laska.value += 15;
                updateTheoStatsBars();
                showFloatingText(this, this.theo.x, this.theo.y - 35, '❤️HAAAAAAAF❤️');
            } else {
                showFloatingText(this, this.theo.x, this.theo.y - 35, 'Poď bližšie k Thejkovi!🐕');
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.addPointer(2);
        createTouchControls(this, this.gameWidth, this.gameHeight, this.touchControls);
        // --- POSTUPNÉ KLESANIE ŠTATISTÍK (každých 20 sekúnd o 1) ---
        this.statsDecayTimer = this.time.addEvent({
            delay: 20000, // 20 000 ms = 20 sekúnd
            loop: true,
            callback: () => {
                // Ak je otvorené modálne okno (napr. spánok alebo výber jedla), štatistiky neklesajú
                if (gameState.isModalOpen) return;

                Object.keys(statsConfig).forEach((key) => {
                    statsConfig[key].value = Math.max(0, statsConfig[key].value - 1);
                });
                updateStatsBars();

                // Klesanie aj pre Thea
                Object.keys(theoStatsConfig).forEach((key) => {
                    theoStatsConfig[key].value = Math.max(0, theoStatsConfig[key].value - 1);
                });
                updateTheoStatsBars();
            }
        });
    }

    setupMenus() {
        // 1. Mini menu postele
        this.bedMenu = this.add.container(this.bed.x, this.bed.y - 20).setDepth(25).setVisible(false);
        let bedBg = this.add.graphics()
            .fillStyle(0x1e272e, 0.92)
            .fillRoundedRect(-80, -50, 160, 100, 12)
            .lineStyle(2, 0xff72c4, 0.6)
            .strokeRoundedRect(-80, -50, 160, 100, 12);

        // --- POSTEĽ (s časovačom) ---
        let sleepBtn = createRoundedButton(this, 0, -22, 136, 36, 'Idzem spať😴 ', 0x3498db, () => {
            this.bedMenu.setVisible(false);
            openSelectionModal(this, this.gameWidth, this.gameHeight, 'Koho si dať pod ručku?', bedOptions.sleep, (opt) => {
                startActivityTimer(this, this.bed, this.player, opt, 'sleep');
            });
        });

        let movieBtn = createRoundedButton(this, 0, 22, 136, 36, 'Idzem kukať🎬', 0x9b59b6, () => {
            this.bedMenu.setVisible(false);
            openSelectionModal(this, this.gameWidth, this.gameHeight, 'Čo si chceš pozrieť?', bedOptions.movie, (opt) => {
                startActivityTimer(this, this.bed, this.player, opt, 'movie');
            });
        });

        this.bedMenu.add([bedBg, sleepBtn, movieBtn]);

        // 4. Mini menu stolíka
        this.tableMenu = this.add.container(this.table.x, this.table.y - 95).setDepth(25).setVisible(false);
        let tableBg = this.add.graphics()
            .fillStyle(0x1e272e, 0.92)
            .fillRoundedRect(-115, -50, 230, 100, 12)
            .lineStyle(2, 0xff72c4, 0.6)
            .strokeRoundedRect(-115, -50, 230, 100, 12);

        // 1. Možnosť: Napapať sa + ikona lupy
        let eatBtn = createRoundedButton(this, 0, -22, 206, 36, 'Napapať sa 🔍', 0xe67e22, () => {
            this.tableMenu.setVisible(false);
            openSelectionModal(this, this.gameWidth, this.gameHeight, 'Čo by si si chcela spapkať?', foodOptions, (opt) => {
                const rewards = opt.effects || [{ stat: opt.stat, boost: opt.boost }];
                let floatingParts = [];

                rewards.forEach(item => {
                    if (statsConfig[item.stat]) {
                        statsConfig[item.stat].value += item.boost;
                        const sign = item.boost > 0 ? '+' : '';
                        floatingParts.push(`${sign}${item.boost}${statsConfig[item.stat].icon}`);
                    }
                });

                updateStatsBars();
                showFloatingText(this, this.player.x, this.player.y - 40, floatingParts.join(' '));
            });
        });

        // 2. Možnosť: Napiť sa vodičky + fotka Stanley cupu vnútri tlačidla
        let drinkBtn = createRoundedButton(this, 0, 22, 206, 36, 'Napiť sa vodičky', 0x3498db, () => {
            this.tableMenu.setVisible(false);
            if (statsConfig.smad) {
                statsConfig.smad.value += 25;
                updateStatsBars(); // Okamžite prekreslí ružovú/modrú lištu v paneli štatistík
            }
            showFloatingText(this, this.player.x, this.player.y - 40, '+25💧');
        });

        // Posunieme text mierne doľava a vložíme fotku Stanley cupu na pravý okraj tlačidla
        drinkBtn.label.setX(-14);
        let stanleyIcon = this.add.image(76, 0, 'stanleyCup').setDisplaySize(22, 28);
        drinkBtn.add(stanleyIcon);

        this.tableMenu.add([tableBg, eatBtn, drinkBtn]);

        // 2. Mini menu dverí
        this.doorMenu = this.add.container(this.door.x + 95, this.door.y + 50).setDepth(25).setVisible(false);
        let doorBg = this.add.graphics()
            .fillStyle(0x1e272e, 0.92)
            .fillRoundedRect(-90, -50, 180, 100, 12)
            .lineStyle(2, 0xff72c4, 0.6)
            .strokeRoundedRect(-90, -50, 180, 100, 12);

        this.doorActionBtn = createRoundedButton(this, 0, -22, 156, 36, 'POME VON!☀️', 0x2ecc71, () => {
            this.doorMenu.setVisible(false);
            this.switchLocation(gameState.currentLocation === 'room' ? 'outside' : 'room');
        });

        let stayBtn = createRoundedButton(this, 0, 22, 156, 36, 'Zostať tu❌', 0x95a5a6, () => {
            this.doorMenu.setVisible(false);
        });

        this.doorMenu.add([doorBg, this.doorActionBtn, stayBtn]);

        // 3. Mini menu búdy (zväčšené pre 3 tlačidlá)
        this.doghouseMenu = this.add.container(this.doghouse.x + 25, this.doghouse.y - 135).setDepth(25).setVisible(false);
        this.dogBg = this.add.graphics()
            .fillStyle(0x1e272e, 0.92)
            .fillRoundedRect(-95, -70, 190, 140, 12)
            .lineStyle(2, 0xff72c4, 0.6)
            .strokeRoundedRect(-95, -70, 190, 140, 12);

        this.dogActionBtn = createRoundedButton(this, 0, -44, 164, 36, 'Thejko von!🐕', 0xff72c4, () => {
            this.doghouseMenu.setVisible(false);
            this.theoStatsUI.container.setVisible(false);
            this.toggleTheo();
        });

        this.waterBtn = createRoundedButton(this, 0, 0, 164, 36, 'Doplniť vodu..💦', 0x3498db, () => {
            this.doghouseMenu.setVisible(false);
            theoStatsConfig.voda.value += 30;
            updateTheoStatsBars();
            showFloatingText(this, this.doghouse.x + 40, this.doghouse.y - 60, 'Voda doplnená!💧');
        });

        this.feedBtn = createRoundedButton(this, 0, 44, 164, 36, 'Dať mu žrať..🍖', 0xe67e22, () => {
            this.doghouseMenu.setVisible(false);
            theoStatsConfig.jedlo.value += 30;
            updateTheoStatsBars();
            showFloatingText(this, this.doghouse.x + 40, this.doghouse.y - 60, 'MŇAM MŇAM HAF!🍖');
        });

        // Pridanie všetkých troch tlačidiel do kontajnera
        this.doghouseMenu.add([this.dogBg, this.dogActionBtn, this.waterBtn, this.feedBtn]);

    }

    startCallTimer() {
        gameState.isModalOpen = true;

        const w = 230;
        const h = 115;
        let callContainer = this.add.container(this.gameWidth / 2, this.gameHeight / 2).setDepth(50);

        // Tmavé pozadie s ružovým orámovaním
        let bg = this.add.graphics()
            .fillStyle(0x1e272e, 0.95)
            .fillRoundedRect(-w / 2, -h / 2, w, h, 14)
            .lineStyle(2, 0xff72c4, 0.9)
            .strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
        callContainer.add(bg);

        // Animovaná ikona telefonátu
        let callIcon = this.add.text(0, -28, '📞💩❤️', { fontSize: '24px' }).setOrigin(0.5);
        callContainer.add(callIcon);

        this.tweens.add({
            targets: callIcon,
            scale: 1.18,
            angle: { from: -8, to: 8 },
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        // Text odpočítavania
        let timeText = this.add.text(0, 4, '5.0 s', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Lišta priebehu (progress bar)
        const barWidth = w - 50;
        let barBg = this.add.graphics()
            .fillStyle(0x333333, 1)
            .fillRoundedRect(-barWidth / 2, 24, barWidth, 12, 6);

        let barFill = this.add.graphics();
        callContainer.add([timeText, barBg, barFill]);

        // 5-sekundový časovač
        this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 200,
            onUpdate: (tween) => {
                const progress = tween.getValue();
                const remaining = ((100 - progress) / 100 * 2).toFixed(1);
                timeText.setText(`${remaining} s`);

                barFill.clear();
                barFill.fillStyle(0xff72c4, 1);
                barFill.fillRoundedRect(-barWidth / 2, 24, (progress / 100) * barWidth, 12, 6);
            },
            onComplete: () => {
                callContainer.destroy();
                gameState.isModalOpen = false;
                this.switchLocation('visit');
            }
        });
    }

    toggleTheo() {
        this.isTheoOutside = !this.isTheoOutside;

        if (this.isTheoOutside) {
            // Vypustenie Thea pred búdu
            this.theo.setPosition(this.doghouse.x + 155, this.doghouse.y - 105);
            this.theo.setVisible(true);
            this.theo.body.enable = true;
            showFloatingText(this, this.theo.x, this.theo.y - 40, 'Haf!🐕');

            // Spustenie náhodného behania po dvore
            if (!this.theoTimer) {
                this.theoTimer = this.time.addEvent({
                    delay: 1400, // zmena smeru každých 1,4 sekundy
                    loop: true,
                    callback: () => {
                        if (!this.isTheoOutside || gameState.currentLocation !== 'outside' || gameState.isModalOpen || this.isPettingTheo || this.theoFetchState !== 'none') {
                            if (this.theoFetchState === 'none') this.theo.setVelocity(0);
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
            this.theoFetchState = 'none';
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

        if (this.isTheoOutside) {
            showFloatingText(this, this.player.x, this.player.y - 35, 'BEŽ!🐾');
        }

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
                if (this.isTheoOutside && gameState.currentLocation === 'outside') {
                    this.stopPettingTheo();
                    this.theoFetchState = 'toBall';
                    showFloatingText(this, this.theo.x, this.theo.y - 35, 'Haf! HEHEHEHE🐕');
                }
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
        const isVisit = target === 'visit';
        const isOutside = target === 'outside';
        const isRoom = target === 'room';

        // 1. Reset prebiehajúcich akcií a UI
        this.statsUI.container.setVisible(false);
        this.theoFetchState = 'none';
        this.theoStatsUI.container.setVisible(false);
        this.isAimingBall = false;
        this.aimGraphics.clear();
        this.stopPettingTheo();
        if (isVisit) this.statsUI.container.setVisible(false);

        // 2. Viditeľnosť jednotlivých lokácií
        this.visitGroup.setVisible(isVisit);
        this.roomGroup.setVisible(isRoom);
        this.outsideGroup.setVisible(isOutside);

        // 3. Fyzika a viditeľnosť postáv a stien
        this.player.setVisible(!isVisit);
        this.door.setVisible(!isVisit);
        this.door.body.enable = !isVisit;
        this.bottomWall.body.enable = !isVisit;
        this.bottomWallG.setVisible(!isVisit);

        this.bed.body.enable = isRoom;
        this.table.body.enable = isRoom;
        this.roomWalls.getChildren().forEach(wall => wall.body.enable = isRoom);
        this.outsideObstacles.getChildren().forEach(obj => obj.body.enable = isOutside);

        const showTheo = isOutside && this.isTheoOutside;
        this.theo.setVisible(showTheo);
        this.theo.body.enable = showTheo;
        if (!showTheo) this.theo.setVelocity(0);

        if (isVisit) {
            // Auto má stred v (this.gameWidth - 300, this.gameHeight - 200) a výšku 400 px (horný okraj je -200 od stredu)
            showFloatingText(
                this,
                this.gameWidth - 300,
                this.gameHeight - 360,
                'TVOJE HOVIENKO JE TU!💩💗'
            );
            return;
        }

        // Zastavenie prípadnej bežiacej animácie dverí
        this.tweens.killTweensOf(this.door);
        this.door.setAngle(0);

        if (isOutside) {
            // DVERE VONKU: dole vpravo nalepené na spodnú stenu
            this.door.setTexture('doorBottomTexture');
            this.door.setOrigin(0, 1); // Pánt vľavo dole pri stene
            this.door.setPosition(this.gameWidth - this.wallThick - 245, this.gameHeight - this.wallThick);
            this.door.refreshBody();
            this.door.input.hitArea.setSize(75, 26);

            // Menu dverí a hráč nad dverami
            this.doorMenu.setPosition(this.door.x + 10, this.door.y - 75);
            this.player.setPosition(this.door.x + 37, this.door.y - 50);
        } else {
            // DVERE V IZBE: hore vľavo nalepené na ľavú stenu
            this.door.setTexture('doorUpperTexture');
            this.door.setOrigin(0, 0); // Pánt vľavo hore pri stene
            this.door.setPosition(this.wallThick, this.wallThick + 65);
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

        if (!this.isBadmintonMode)
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
        if (this.tableMenu.visible && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.table.x, this.table.y) > 160) this.tableMenu.setVisible(false);
        if (this.doorMenu.visible && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.door.x, this.door.y) > 140) this.doorMenu.setVisible(false);
        if ((this.doghouseMenu.visible || this.theoStatsUI.container.visible) && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.doghouse.x, this.doghouse.y) > 170) {
            this.doghouseMenu.setVisible(false);
            this.theoStatsUI.container.setVisible(false);
        }
        if (this.isPettingTheo && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.theo.x, this.theo.y) > 75) this.stopPettingTheo();
        if (this.isAimingBall) {
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.ball.x, this.ball.y) > 95) {
                this.isAimingBall = false;
                this.aimGraphics.clear();
            } else {
                this.drawAimArrow(this.input.activePointer);
            }
        }
        // --- APORTOVANIE LOPTIČKY ---
        if (this.isTheoOutside && gameState.currentLocation === 'outside' && !gameState.isModalOpen) {
            if (this.theoFetchState === 'toBall') {
                // 1. Theo beží rýchlo k loptičke
                this.physics.moveToObject(this.theo, this.ball, 260);

                if (Phaser.Math.Distance.Between(this.theo.x, this.theo.y, this.ball.x, this.ball.y) <= 32) {
                    this.theoFetchState = 'toPlayer';
                }
            } else if (this.theoFetchState === 'toPlayer') {
                // 2. Theo nesie loptičku v papuli späť k hráčovi
                this.physics.moveToObject(this.theo, this.player, 240);
                this.ball.setPosition(this.theo.x + this.theo.width / 2 + this.halfBall, this.theo.y);

                // Keď dobehne k hráčovi, položí loptičku pred neho a vráti sa k voľnému behaniu
                if (Phaser.Math.Distance.Between(this.theo.x, this.theo.y, this.player.x, this.player.y) <= 58) {
                    this.theoFetchState = 'none';
                    this.ball.setPosition(this.theo.x, this.theo.y);
                    this.setTheoSettings();
                    showFloatingText(this, this.theo.x, this.theo.y - 35, 'HAF!🐾');
                }
            }
        }
        // --- LOGIKA BEDMINTONU (HRÁČ DOLE, BOT HORE) ---
        if (this.isBadmintonMode) {
            const minPlayerY = (this.gameHeight / 2) + this.playerHeight / 2;
            if (this.player.y < minPlayerY) {
                this.player.y = minPlayerY;
            }
            
            // 1. Raketa hráča: nad/pod hráčom podľa polovice mapy + zrkadlové otočenie na ľavej polke
            const playerOnLeft = this.player.x < this.gameWidth / 2;
            this.playerRacket.setFlipX(playerOnLeft); // Zrkadlové otočenie pri prechode na ľavú polku
            this.playerRacket.setPosition(
                this.player.x,
                this.player.y - 28
            );

            // 2. Raketa bota (hore)
            const botOnLeft = this.bot.x < this.gameWidth / 2;
            this.botRacket.setFlipX(botOnLeft);
            this.botRacket.setPosition(
                this.bot.x,
                this.bot.y + 28
            );

            if (this.isBadmintonPlaying) {
                // 3. Točivá animácia košíka
                this.shuttlecock.angle += 10;

                // Uložíme aktuálnu pozíciu košíka do poľa (max. 10 posledných snímok = krátky chvostík)
                this.shuttleTrailPoints.push({ x: this.shuttlecock.x, y: this.shuttlecock.y });
                if (this.shuttleTrailPoints.length > 10) {
                    this.shuttleTrailPoints.shift(); // Odstráni najstarší bod
                }

                // Vykreslíme postupne miznúce biele krúžky za košíkom
                this.shuttleTrailGraphics.clear();
                this.shuttleTrailPoints.forEach((pt, index) => {
                    const ratio = (index + 1) / this.shuttleTrailPoints.length; // od 0.1 (chvost) po 1.0 (pri košíku)
                    this.shuttleTrailGraphics.fillStyle(0xffffff, ratio * 0.45); // jemná priehľadnosť max 45 %
                    this.shuttleTrailGraphics.fillCircle(pt.x, pt.y, ratio * 9); // polomer od 1 px po 9 px
                });

                // 4. Pohyb bota hore (sleduje os X košíka s 80 % šancou)
                if (this.shuttlecock.body.velocity.y < 0) {
                    const targetX = this.shuttlecock.x + (this.botMissOffset || 0);
                    const diffX = targetX - this.bot.x;
                    if (Math.abs(diffX) > 6) {
                        this.bot.setVelocityX(Math.sign(diffX) * 240);
                    } else {
                        this.bot.setVelocityX(0);
                    }
                } else {
                    // Keď košík letí dole k hráčovi, bot sa vracia do stredu
                    const centerDiff = (this.gameWidth / 2) - this.bot.x;
                    this.bot.setVelocityX(Math.abs(centerDiff) > 10 ? Math.sign(centerDiff) * 150 : 0);
                }

                // 5. Kontrola dotyku s okrajmi obrazovky (kto hodil do okraja, prehral)
                const margin = 16;
                const hitSideEdge = this.shuttlecock.x <= margin || this.shuttlecock.x >= this.gameWidth - margin;
                const hitTopOrBottomEdge = this.shuttlecock.y <= margin || this.shuttlecock.y >= this.gameHeight - margin;

                if (hitSideEdge) {
                    // Košík vyletel do boku (aut) -> prehral ten, kto ho odpálil
                    const winner = this.lastHitter === 'player'
                        ? 'Aut! VYHRAL RADINKO!💩'
                        : 'Aut! VYHRALA SI MIMKA!🎉💖';
                    this.endBadmintonRound(winner);
                } else if (hitTopOrBottomEdge) {
                    // Košík preletel cez horný alebo dolný okraj -> vyhral ten, kto ho odpálil
                    const winner = this.lastHitter === 'player'
                        ? 'VYHRALA SI MIMKA!🎉💖'
                        : 'VYHRAL RADINKO!💩';
                    this.endBadmintonRound(winner);
                }
            }
        }
        this.statsUI.container.x = this.player.x;
        this.statsUI.container.y = this.player.y - this.statsUI.offsetY;
        this.statsUI.handPhoneSprite.setPosition(this.player.x + 32, this.player.y + 18);
        this.statsUI.phoneMenu.setPosition(this.statsUI.handPhoneSprite.x + 50, this.statsUI.handPhoneSprite.y - 65);
    }

    startBadmintonSetup() {
        this.isBadmintonMode = true;
        this.switchLocation('outside');
        gameState.currentLocation = 'badminton';
        this.isBadmintonPlaying = false;

        // Skryje všetko okrem samotnej zelenej trávy
        this.outsideGroup.getChildren().forEach((child, index) => {
            child.setVisible(index === 0);
        });
        this.outsideObstacles.getChildren().forEach(obj => obj.body.enable = false);

        this.door.setVisible(false);
        this.door.body.enable = false;
        this.bottomWall.body.enable = false;
        this.bottomWallG.setVisible(false);
        this.theo.setVisible(false);
        this.theo.body.enable = false;

        this.badmintonGroup.setVisible(true);
        this.bot.body.enable = true;
        this.playerRacket.body.enable = true;
        this.botRacket.body.enable = true;
        this.shuttlecock.body.enable = true;

        // Hráč DOLE, bot HORE
        this.player.setPosition(this.gameWidth / 2, this.gameHeight - 100);
        this.bot.setPosition(this.gameWidth / 2, 100);

        // Raketa vodorovne (na šírku), aby sa s ňou dobre odbíjalo zdola nahor
        this.playerRacket.setDisplaySize(60, 28);
        this.botRacket.setDisplaySize(60, 28);

        this.shuttlecock.setPosition(this.gameWidth / 2, this.gameHeight / 2);
        this.shuttlecock.body.setVelocity(0);
        this.shuttlecock.setAngle(0);

        this.playBadmintonBtn.setVisible(true);
        this.endBadmintonBtn.setVisible(true);
        this.lastHitter = null;
        this.botWillHit = true;
    }

    startBadmintonRound() {
        this.rallyCount = 0;
        this.shuttleTrailPoints = [];
        this.shuttleTrailGraphics.clear();
        this.playBadmintonBtn.setVisible(false);
        this.endBadmintonBtn.setVisible(false);
        this.isBadmintonPlaying = true;
        this.lastHitter = 'bot'; // Aby ho mohol hráč hneď odbiť
        this.botWillHit = Phaser.Math.Between(1, 100) <= 80;

        this.shuttlecock.setPosition(this.gameWidth / 2, this.gameHeight / 2);
        // Úvodný servis smerom NADOL k hráčovi
        this.shuttlecock.body.setVelocity(Phaser.Math.Between(-90, 90), 360);
    }

    hitShuttlecock(racket, isPlayer) {
        if (!this.isBadmintonPlaying) return;
        if (isPlayer && this.lastHitter === 'player') return;
        if (!isPlayer && this.lastHitter === 'bot') return;

        this.lastHitter = isPlayer ? 'player' : 'bot';

        // Zvýšenie počtu odpalov v aktuálnej výmene a výpis +1, +2, +3...
        this.rallyCount++;
        showFloatingText(
            this,
            racket.x,
            racket.y + (isPlayer ? -35 : 35),
            `+${this.rallyCount}`
        );

        // 1. Výpočet miesta zásahu na rakete podľa osi X (-1 ľavý okraj, 0 stred, +1 pravý okraj)
        const diffX = this.shuttlecock.x - racket.x;
        const normalizedHit = Phaser.Math.Clamp(diffX / (racket.displayWidth / 2), -1, 1);

        // 2. Čím bližšie ku stredu rakety, tým vyššia rýchlosť košíka
        const centerAccuracy = 1 - Math.abs(normalizedHit);
        const speed = 380 + centerAccuracy * 260;

        // 3. Smer odpalu: hráč (dole) odbíja HORE (-1), bot (hore) odbíja DOLE (+1)
        const onBottomHalf = racket.y > this.gameHeight / 2;
        const dirY = onBottomHalf ? -1 : 1;
        const angle = normalizedHit * (Math.PI / 4); // Uhol doľava/doprava max 45°

        this.shuttlecock.body.setVelocity(
            Math.sin(angle) * speed,
            Math.cos(angle) * speed * dirY
        );

        // Po hráčovom údere sa vyžrebuje 80 % úspešnosť pre bota
        if (isPlayer) {
            this.botWillHit = Phaser.Math.Between(1, 100) <= 80;
            this.botMissOffset = this.botWillHit ? 0 : (Phaser.Math.RND.pick([-1, 1]) * 75);
        }
    }

    endBadmintonRound(winnerText) {
        this.shuttleTrailPoints = [];
        this.shuttleTrailGraphics.clear();
        this.isBadmintonPlaying = false;
        this.shuttlecock.body.setVelocity(0);
        this.bot.setVelocity(0);

        showFloatingText(this, this.gameWidth / 2, this.gameHeight / 2 - 70, winnerText);
        this.playBadmintonBtn.setVisible(true);
        this.endBadmintonBtn.setVisible(true);
    }

    exitBadminton() {
        this.isBadmintonMode = false;
        this.isBadmintonPlaying = false;
        this.shuttleTrailPoints = [];
        this.shuttleTrailGraphics.clear();

        // Skryje a vypne všetky prvky bedmintonu
        this.badmintonGroup.setVisible(false);
        this.bot.body.enable = false;
        this.playerRacket.body.enable = false;
        this.botRacket.body.enable = false;
        this.shuttlecock.body.enable = false;
        this.shuttlecock.body.setVelocity(0);

        // Prepne hráča späť do izby
        this.switchLocation('room');
    }
}