export const gameState = {
    isModalOpen: false,
    currentLocation: 'room'
};

export const statsConfig = {
    zamilovanost: { value: 90, icon: '❤️', color: 0xff4d6d },
    energia: { value: 50, icon: '⚡', color: 0xf1c40f },
    nalada: { value: 70, icon: '😊', color: 0x2ecc71 },
    hlad: { value: 40, icon: '🍔', color: 0xe67e22 },
    smad: { value: 65, icon: '💧', color: 0x3498db }
};

export const bedOptions = {
    sleep: [
        { img: 'sleep1', label: 'Rýchly šlofík', icon: '💤', stat: 'energia', boost: 25 },
        { img: 'sleep2', label: 'Spánok v objatí', icon: '🫂', stat: 'energia', boost: 50 },
        { img: 'sleep1', label: 'Víkendové leňošenie', icon: '🛌', stat: 'energia', boost: 40 }
    ],
    movie: [
        { img: 'movie1', label: 'Romantický večer', icon: '💖', stat: 'zamilovanost', boost: 20 },
        { img: 'movie2', label: 'Náš obľúbený film', icon: '🍿', stat: 'nalada', boost: 30 },
        { img: 'movie1', label: 'Maratón seriálov', icon: '📺', stat: 'nalada', boost: 25 },
        { img: 'movie2', label: 'Rozprávka pred spaním', icon: '✨', stat: 'zamilovanost', boost: 15 }
    ]
};

export const foodOptions = [
    { img: 'food1', stat: 'hlad', boost: 25, icon: '🍔' },
    { img: 'food2', stat: 'hlad', boost: 35, icon: '🍕' }
];

export function showFloatingText(scene, x, y, message) {
    let txt = scene.add.text(x, y, message, {
        fontSize: '18px',
        fill: '#ff72c4',
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
