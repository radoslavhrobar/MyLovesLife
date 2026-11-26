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

export const quizQuestions = [
    {
        question: 'Aká je moja 2. najoblúbenejšia sladkosť?',
        options: [
            { text: 'Mars', isCorrect: false },
            { text: 'Billa kornútok', isCorrect: true },
            { text: 'Bueno', isCorrect: false },
            { text: 'Milka', isCorrect: false }
        ]
    },
    {
        question: 'Aká je moja najobľúbenejšia sladkosť?',
        options: [
            { text: 'Mars', isCorrect: true },
            { text: 'Billa kornútok', isCorrect: false },
            { text: 'Bueno', isCorrect: false },
            { text: 'Milka', isCorrect: false }
        ]
    },
    {
        question: 'Ako sa volala pláž v Grécku, na ktorej som nechal ten kamienok, čo som si chcel zobrať domov?',
        questionImg: 'stone',
        options: [
            { text: 'Paleokastritsa', isCorrect: false },
            { text: 'Issos', isCorrect: false },
            { text: 'Porto Timoni', isCorrect: true },
            { text: 'Gardenos', isCorrect: false }
        ]
    },
    {
        question: 'V akom období vznikla táto fotka a čo sme robili?',
        questionImg: 'illnessCar',
        options: [
            { text: 'Jar - chillovali v aute - choručka si bola', isCorrect: false },
            { text: 'Zima - chillovali v aute - išli sme ku mne potom', isCorrect: false },
            { text: 'Leto - chillovali v aute - choručka si bola', isCorrect: true }
        ]
    },
    {
        question: 'Kedy sme si to povedali?',
        questionImg: 'ily',
        options: [
            { text: '17. júl', isCorrect: false },
            { text: '19. jún', isCorrect: false },
            { text: '26. máj', isCorrect: false },
            { text: '12. jún', isCorrect: true }
        ]
    },
    {
        question: 'U koho sme si spravili takúto bombičku?',
        questionImg: 'fruitPlate',
        options: [
            { text: 'U teba', isCorrect: false },
            { text: 'U mňa', isCorrect: true }
        ]
    },
    {
        question: 'Aký je môj 3. najobľúbenejší plyšák?',
        options: [
            { text: 'Rudo', isCorrect: false },
            { text: 'Rosinka', isCorrect: false },
            { text: 'Mačička', isCorrect: true },
            { text: 'Pinky', isCorrect: false }
        ]
    },
    {
        question: 'Aký je môj najobľúbenejší seriál z týchto štyroch?',
        options: [
            { text: 'Supernatural', isCorrect: false },
            { text: 'Mentalista', isCorrect: false },
            { text: 'Akty X', isCorrect: false },
            { text: 'Prison Break', isCorrect: true }
        ]
    },
    {
        question: 'Ktoré auto z týchto štyroch by som si vybral? (všetky sú tesné, ale jedno vyhralo)',
        options: [
            { img: 'dodge', isCorrect: false },
            { img: 'audi', isCorrect: false },
            { img: 'mercedes', isCorrect: false },
            { img: 'lancer', isCorrect: true }
        ]
    }
];

export const bedOptions = {
    sleep: [
        { img: 'rudo', bedImg: 'rudoM', stat: 'energia', boost: 50},
        { img: 'rosinkaa', bedImg: 'rosinkaM', stat: 'energia', boost: 50},
        { img: 'ppernicek', bedImg: 'ppernicekM', stat: 'energia', boost: 50},
        { img: 'pinkyy', bedImg: 'pinkyM', stat: 'energia', boost: 50}
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
