/* ============================================================ */
/*  PC Builder AR — ImmaTech · Cyberpunk Edition                */
/*  app.js — Logique principale                                 */
/*  Auteurs : Mounir, Matteo, Marwan                            */
/* ============================================================ */

// ========================
// CONFIGURATION DES ETAPES
// ========================
// modelScale / modelPosition / modelRotation : ajuster selon vos modeles GLB.
// Chaque modele a ses propres proportions — modifiez ces valeurs si necessaire.

const STEPS = [
    {
        id: 1,
        name: "Alimentation (PSU)",
        modelFile: "assets/models/psu_power_supply_unit.glb",
        modelScale: "3 3 3",
        modelPosition: "0 0.25 0",
        modelRotation: "0 0 0",
        quiz: {
            question: "Quel composant fournit l'energie electrique a tout le PC ?",
            options: [
                "La carte graphique (GPU)",
                "L'alimentation (PSU)",
                "La carte mere",
                "Le processeur (CPU)"
            ],
            correctIndex: 1,
            explanation: "L'alimentation (PSU) convertit le courant alternatif en courant continu pour alimenter tous les composants."
        }
    },
    {
        id: 2,
        name: "Carte Mere",
        modelFile: "assets/models/asus_strix_b-550-f_gaming_motherboard_realistic.glb",
        modelScale: "0.3 0.3 0.3",
        modelPosition: "0 0.2 0",
        modelRotation: "0 0 0",
        quiz: {
            question: "Quel composant sert de circuit principal pour connecter tous les autres ?",
            options: [
                "Le disque SSD",
                "Le boitier",
                "La carte mere",
                "Le ventirad"
            ],
            correctIndex: 2,
            explanation: "La carte mere est le PCB principal ou se connectent le CPU, la RAM, le GPU et tous les peripheriques."
        }
    },
    {
        id: 3,
        name: "Processeur (CPU)",
        modelFile: "assets/models/intel_cpu.glb",
        modelScale: "0.3 0.3 0.3",
        modelPosition: "0 0.2 0",
        modelRotation: "0 0 0",
        quiz: {
            question: "Ou s'installe le processeur (CPU) ?",
            options: [
                "Sur le slot PCI-Express",
                "Dans le socket de la carte mere",
                "A cote de l'alimentation",
                "Derriere la carte graphique"
            ],
            correctIndex: 1,
            explanation: "Le CPU s'installe sur le socket dedie de la carte mere (LGA ou AM5 selon la marque)."
        }
    },
    {
        id: 4,
        name: "Watercooling CPU",
        modelFile: "assets/models/corsair_h150i_elitie_cpu_liquid_cooler.glb",
        modelScale: "0.3 0.3 0.3",
        modelPosition: "0 0.25 0",
        modelRotation: "0 0 0",
        quiz: {
            question: "Pourquoi installe-t-on un systeme de refroidissement sur le CPU ?",
            options: [
                "Pour le proteger de la poussiere",
                "Pour le refroidir et eviter la surchauffe",
                "Pour augmenter sa puissance",
                "Pour reduire le bruit"
            ],
            correctIndex: 1,
            explanation: "Le systeme de refroidissement dissipe la chaleur produite par le CPU. Sans lui, le processeur surchauffe."
        }
    },
    {
        id: 5,
        name: "Memoire RAM",
        modelFile: "assets/models/ram_corsair_vengeance_ddr4_rgb_pro.glb",
        modelScale: "3 3 3",
        modelPosition: "0 0.2 0",
        modelRotation: "0 0 0",
        quiz: {
            question: "Quel est le role principal de la RAM ?",
            options: [
                "Stocker les fichiers de maniere permanente",
                "Afficher les graphismes",
                "Stocker temporairement les donnees en cours d'utilisation",
                "Connecter le PC a Internet"
            ],
            correctIndex: 2,
            explanation: "La RAM est une memoire volatile ultra-rapide qui stocke les donnees utilisees en temps reel."
        }
    },
    {
        id: 6,
        name: "Carte Graphique (GPU)",
        modelFile: "assets/models/asus_rog_geforce_rtx_4090_v2_0.glb",
        modelScale: "0.3 0.3 0.3",
        modelPosition: "0 0.2 0",
        modelRotation: "0 0 0",
        quiz: {
            question: "Dans quel slot s'installe generalement une carte graphique ?",
            options: [
                "Slot M.2",
                "Slot PCI-Express x16",
                "Slot SATA",
                "Slot RAM DDR5"
            ],
            correctIndex: 1,
            explanation: "Le GPU s'insere dans le slot PCI-Express x16 pour la bande passante necessaire aux donnees graphiques."
        }
    },
    {
        id: 7,
        name: "Stockage SSD NVMe",
        modelFile: "assets/models/m_2_nvme_ssd_samsung_990_pro_1tb_3d_model.glb",
        modelScale: "3 3 3",
        modelPosition: "0 0.2 0",
        modelRotation: "0 0 0",
        quiz: {
            question: "Quel avantage principal a un SSD par rapport a un HDD ?",
            options: [
                "Il est plus grand",
                "Il consomme plus d'energie",
                "Il est beaucoup plus rapide en lecture/ecriture",
                "Il stocke plus de donnees"
            ],
            correctIndex: 2,
            explanation: "Les SSD utilisent de la memoire flash, 5 a 20 fois plus rapide qu'un disque dur mecanique."
        }
    }
];

// Modele final affiche apres toutes les etapes
const FINAL_MODEL = {
    file: "assets/models/custom_gaming_pc.glb",
    scale: "0.25 0.25 0.25",
    position: "0 0.15 0",
    rotation: "0 0 0"
};

// ========================
// ETAT DU JEU
// ========================
let gameState = {
    currentStep: 0,
    score: 0,
    quizPerfect: 0,
    totalErrors: 0,
    startTime: null,
    markerFound: false,
    phase: 'welcome',  // welcome | quiz | transition | complete
    musicPlaying: false,
    currentModelEntity: null
};

const POINTS_QUIZ_PERFECT = 100;
const POINTS_QUIZ_RETRY   = 50;
const PENALTY_WRONG        = -20;

// Audio
let bgMusic = null;
let audioCtx = null;

// ========================
// INITIALISATION
// ========================
document.addEventListener('DOMContentLoaded', function () {
    // Marker detection
    var marker = document.querySelector('#main-marker');
    if (marker) {
        marker.addEventListener('markerFound', function () {
            gameState.markerFound = true;
            updateMarkerStatus(true);
        });
        marker.addEventListener('markerLost', function () {
            gameState.markerFound = false;
            updateMarkerStatus(false);
        });
    }

    // Init background music element
    bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.volume = 0.25;
        bgMusic.loop = true;
    }
});

// ========================
// DEMARRAGE
// ========================
function startExperience() {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    addMarkerStatus();
    gameState.startTime = Date.now();
    gameState.phase = 'quiz';
    startStep(0);
}

// ========================
// GESTION DES ETAPES
// ========================
function startStep(stepIndex) {
    if (stepIndex >= STEPS.length) {
        finishGame();
        return;
    }
    gameState.currentStep = stepIndex;
    gameState.phase = 'quiz';
    var step = STEPS[stepIndex];
    updateHUD(stepIndex);
    var nameEl = document.getElementById('component-name');
    if (nameEl) {
        nameEl.textContent = '[ ' + step.name + ' ]';
        nameEl.classList.add('visible');
    }
    document.getElementById('instruction-text').textContent =
        'Diagnostic en cours — identifiez : ' + step.name;
    loadComponentModel(step);
    showQuiz(step.quiz);
    document.getElementById('btn-action').classList.add('hidden');
}

function updateHUD(stepIndex) {
    var progress = ((stepIndex) / STEPS.length) * 100;
    document.getElementById('step-label').textContent =
        'ETAPE ' + (stepIndex + 1) + '/' + STEPS.length;
    document.getElementById('score-label').textContent =
        'SCORE ' + gameState.score;
    document.getElementById('progress-fill').style.width = progress + '%';
}

// ========================
// SYSTEME DE QUIZ
// ========================
function showQuiz(quiz) {
    var panel = document.getElementById('quiz-panel');
    var questionEl = document.getElementById('quiz-question');
    var optionsEl = document.getElementById('quiz-options');
    var feedbackEl = document.getElementById('quiz-feedback');
    feedbackEl.classList.add('hidden');
    feedbackEl.className = 'quiz-feedback hidden';
    panel.classList.remove('hidden');
    questionEl.textContent = quiz.question;
    optionsEl.innerHTML = '';
    var attempts = 0;
    quiz.options.forEach(function (option, index) {
        var btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.setAttribute('data-index', '0' + (index + 1));
        btn.textContent = option;
        btn.addEventListener('click', function () {
            if (btn.classList.contains('disabled')) return;
            handleQuizAnswer(index, quiz, btn, optionsEl, feedbackEl, attempts);
            attempts++;
        });
        optionsEl.appendChild(btn);
    });
}

function handleQuizAnswer(selectedIndex, quiz, selectedBtn, optionsEl, feedbackEl, attempts) {
    var isCorrect = selectedIndex === quiz.correctIndex;
    selectedBtn.classList.add(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
        var allBtns = optionsEl.querySelectorAll('.quiz-option');
        for (var i = 0; i < allBtns.length; i++) {
            allBtns[i].classList.add('disabled');
        }
        optionsEl.children[quiz.correctIndex].classList.add('correct');
        var points;
        if (attempts === 0) {
            points = POINTS_QUIZ_PERFECT;
            gameState.quizPerfect++;
        } else {
            points = POINTS_QUIZ_RETRY;
        }
        feedbackEl.textContent = 'CORRECT > +' + points + ' PTS — ' + quiz.explanation;
        feedbackEl.className = 'quiz-feedback correct';
        gameState.score += points;
        feedbackEl.classList.remove('hidden');
        document.getElementById('score-label').textContent = 'SCORE ' + gameState.score;
        setTimeout(function () {
            document.getElementById('quiz-panel').classList.add('hidden');
            gameState.phase = 'transition';
            document.getElementById('instruction-text').textContent =
                step_name_at(gameState.currentStep) + ' > identifie. Chargement suivant...';
            setTimeout(function () {
                var nameEl = document.getElementById('component-name');
                if (nameEl) nameEl.classList.remove('visible');
                startStep(gameState.currentStep + 1);
            }, 2000);
        }, 2500);
    } else {
        gameState.totalErrors++;
        gameState.score += PENALTY_WRONG;
        if (gameState.score < 0) gameState.score = 0;
        feedbackEl.textContent = 'ERREUR > ' + PENALTY_WRONG + ' PTS — Reessayez.';
        feedbackEl.className = 'quiz-feedback wrong';
        feedbackEl.classList.remove('hidden');
        selectedBtn.classList.add('disabled');
        document.getElementById('score-label').textContent = 'SCORE ' + gameState.score;
    }
}

function step_name_at(index) {
    return STEPS[index] ? STEPS[index].name : '';
}


// ========================
// CHARGEMENT DES MODELES 3D
// ========================
function loadComponentModel(step) {
    var marker = document.querySelector('#main-marker');
    if (!marker) return;
    removeCurrentModel();
    var loader = document.getElementById('loading-model');
    if (loader) loader.classList.add('active');
    var entity = document.createElement('a-entity');
    entity.setAttribute('id', 'current-component');
    entity.setAttribute('gltf-model', 'url(' + step.modelFile + ')');
    entity.setAttribute('position', step.modelPosition);
    entity.setAttribute('scale', '0 0 0');
    entity.setAttribute('rotation', step.modelRotation);
    entity.addEventListener('model-loaded', function () {
        if (loader) loader.classList.remove('active');
        entity.setAttribute('animation__scalein', {
            property: 'scale', from: '0 0 0', to: step.modelScale,
            dur: 800, easing: 'easeOutBack'
        });
        entity.setAttribute('animation__rotate', {
            property: 'rotation', from: step.modelRotation,
            to: rotateY360(step.modelRotation),
            dur: 10000, loop: true, easing: 'linear'
        });
    });
    entity.addEventListener('model-error', function () {
        if (loader) loader.classList.remove('active');
        console.warn('Erreur chargement modele:', step.modelFile);
    });
    marker.appendChild(entity);
    gameState.currentModelEntity = entity;
}

function rotateY360(baseRotation) {
    var parts = baseRotation.split(' ').map(Number);
    return parts[0] + ' ' + (parts[1] + 360) + ' ' + parts[2];
}

function removeCurrentModel() {
    if (gameState.currentModelEntity) {
        var parent = gameState.currentModelEntity.parentNode;
        if (parent) parent.removeChild(gameState.currentModelEntity);
        gameState.currentModelEntity = null;
    }
}

function showFinalModel() {
    var marker = document.querySelector('#main-marker');
    if (!marker) return;
    removeCurrentModel();
    var loader = document.getElementById('loading-model');
    if (loader) { loader.textContent = 'CHARGEMENT PC COMPLET...'; loader.classList.add('active'); }
    var entity = document.createElement('a-entity');
    entity.setAttribute('id', 'final-pc-model');
    entity.setAttribute('gltf-model', 'url(' + FINAL_MODEL.file + ')');
    entity.setAttribute('position', FINAL_MODEL.position);
    entity.setAttribute('scale', '0 0 0');
    entity.setAttribute('rotation', FINAL_MODEL.rotation);
    entity.addEventListener('model-loaded', function () {
        if (loader) loader.classList.remove('active');
        entity.setAttribute('animation__scalein', {
            property: 'scale', from: '0 0 0', to: FINAL_MODEL.scale,
            dur: 2000, easing: 'easeOutElastic'
        });
        entity.setAttribute('animation__rotate', {
            property: 'rotation', from: FINAL_MODEL.rotation,
            to: rotateY360(FINAL_MODEL.rotation),
            dur: 12000, loop: true, easing: 'linear'
        });
    });
    entity.addEventListener('model-error', function () {
        if (loader) loader.classList.remove('active');
    });
    marker.appendChild(entity);
    gameState.currentModelEntity = entity;
}

// ========================
// STUBS — effets et fin de jeu (a venir)
// ========================
function sfxCorrect() {}
function sfxWrong() {}
function sfxComplete() {}
function triggerFlash(type) {}
function triggerParticles(count, color) {}
function triggerGlitch() {}
function showScorePopup(text, positive) {}
function toggleMusic() {}
function startMusic() {}
function addMarkerStatus() {
    var s = document.createElement('div'); s.id = 'marker-status';
    s.textContent = 'RECHERCHE MARQUEUR HIRO...'; document.body.appendChild(s);
}
function updateMarkerStatus(found) {
    var s = document.getElementById('marker-status');
    if (!s) return;
    if (found) { s.textContent = 'MARQUEUR DETECTE'; s.classList.add('found');
        setTimeout(function(){ s.style.opacity='0'; }, 2000);
    } else { s.textContent = 'RECHERCHE MARQUEUR HIRO...'; s.classList.remove('found'); s.style.opacity='1'; }
}
function finishGame() {
    document.getElementById('instruction-text').textContent = 'Assemblage termine !';
    showFinalModel();
}
function restartExperience() { location.reload(); }
