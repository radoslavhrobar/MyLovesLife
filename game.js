// Základná konfigurácia hry
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Spustenie samotnej hry
const game = new Phaser.Game(config);

function preload() {
    // Sem budeme neskôr načítavať obrázky, zvuky a postavičky
}

this.add.text()
function create() {
    // Tento kód sa spustí raz na začiatku hry
    this.add.text(400, 300, 'Naša hra začína!', {
        fontSize: '32px',
        fill: '#fff'
    }).setOrigin(0.5);
}

function update() {
    // Tento kód beží neustále dookola (napr. kontrola stlačených kláves)
}

