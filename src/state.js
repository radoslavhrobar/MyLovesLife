export const gameState = {
    isModalOpen: false,
    currentLocation: 'room'
};

export const statsConfig = {
    zamilovanost: { value: 90, icon: '❤️', color: 0xff4d6d },
    energia: { value: 50, icon: '⚡', color: 0xf1c40f },
    nalada: { value: 70, icon: '😊', color: 0x2ecc71 },
    hlad: { value: 40, icon: '🍽️', color: 0xe67e22 },
    smad: { value: 65, icon: '💧', color: 0x3498db }
};

export const theoStatsConfig = {
    jedlo: { value: 100, icon: '🍖', color: 0xe67e22 },
    voda: { value: 100, icon: '💧', color: 0x3498db },
    laska: { value: 100, icon: '❤️', color: 0xe84393 }
};

export const bedOptions = {
    sleep: [
        { img: 'sleep1', label: 'Rýchly šlofík', icon: '💤', stat: 'energia', boost: 25 },
        { img: 'sleep2', label: 'Spánok v objatí', icon: '🫂', stat: 'energia', boost: 50 },
        { img: 'sleep1', label: 'Víkendové leňošenie', icon: '🛌', stat: 'energia', boost: 40 }
    ],
    movie: [
        { img: 'farma', effects: [{ stat: 'energia', boost: 30}, { stat: 'nalada', boost: 20}] },
        { img: 'loveisland', effects: [{ stat: 'energia', boost: 20}, { stat: 'nalada', boost: 10}] },
        { img: 'ruza', effects: [{ stat: 'energia', boost: 15}, { stat: 'nalada', boost: 15}] },
        { img: 'zamena', effects: [{ stat: 'energia', boost: 25}, { stat: 'nalada', boost: 20}] }
    ]
};

export const foodOptions = [
    // Slaná maškrta: zasýti, zlepší náladu, ale trochu vysuší (mierny smäd)
    { img: 'snackday', effects: [{ stat: 'hlad', boost: 20 }, { stat: 'nalada', boost: 15 }, { stat: 'smad', boost: -5 }] },

    // Rýchly cukor / ovocie: dodá rýchlu energiu a dobrú náladu
    { img: 'bananas', effects: [{ stat: 'hlad', boost: 15 }, { stat: 'energia', boost: 15 }, { stat: 'nalada', boost: 20 }] },

    // Ľahké sýte jedlo: pekne zasýti a pridá energiu
    { img: 'mozzarella', effects: [{ stat: 'hlad', boost: 35 }, { stat: 'energia', boost: 20 }, { stat: 'nalada', boost: 10 }] },

    // Teplá polievka: poriadne zasýti a zároveň doplní aj tekutiny (smäd)
    { img: 'kapustnica', effects: [{ stat: 'hlad', boost: 45 }, { stat: 'smad', boost: 20 }, { stat: 'energia', boost: 25 }, { stat: 'nalada', boost: 30 }] },

    // Svieži šalát: zasýti a dodá ľahkú energiu
    { img: 'salat', effects: [{ stat: 'hlad', boost: 45 }, { stat: 'energia', boost: 15 }, { stat: 'nalada', boost: 25 }] },

    // Sladká klasika: najviac zasýti a vystrelí náladu na maximum
    { img: 'sulance', effects: [{ stat: 'hlad', boost: 50 }, { stat: 'nalada', boost: 30 }, { stat: 'energia', boost: 5 }] }
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
