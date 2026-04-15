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
        modelScale: "0.05 0.05 0.05",
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
        modelRotation: "-90 0 0",
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
        modelScale: "0.25 0.25 0.25",
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
    scale: "0.005 0.005 0.005",
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
// MUSIQUE
// ========================
function toggleMusic() {
    var btn = document.getElementById('music-btn');
    if (!bgMusic) return;

    if (gameState.musicPlaying) {
        bgMusic.pause();
        gameState.musicPlaying = false;
        btn.classList.add('muted');
        btn.textContent = '//';
    } else {
        bgMusic.play().catch(function () { });
        gameState.musicPlaying = true;
        btn.classList.remove('muted');
        btn.textContent = '♪';
    }
}

function startMusic() {
    if (!bgMusic || gameState.musicPlaying) return;
    bgMusic.play().then(function () {
        gameState.musicPlaying = true;
        var btn = document.getElementById('music-btn');
        if (btn) btn.textContent = '♪';
    }).catch(function () { });
}

// ========================
// SOUND EFFECTS (Web Audio API)
// ========================
function initAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playBeep(freq, duration, type) {
    initAudioCtx();
    if (!audioCtx) return;

    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function sfxCorrect() {
    playBeep(880, 0.15, 'square');
    setTimeout(function () { playBeep(1100, 0.15, 'square'); }, 100);
    setTimeout(function () { playBeep(1320, 0.25, 'square'); }, 200);
}

function sfxWrong() {
    playBeep(200, 0.3, 'sawtooth');
    setTimeout(function () { playBeep(150, 0.4, 'sawtooth'); }, 150);
}

function sfxComplete() {
    var notes = [523, 659, 784, 1047, 1319];
    notes.forEach(function (f, i) {
        setTimeout(function () { playBeep(f, 0.3, 'square'); }, i * 120);
    });
}

// ========================
// DEMARRAGE
// ========================
function startExperience() {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    addMarkerStatus();
    startMusic();

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

    // Show component name
    var nameEl = document.getElementById('component-name');
    if (nameEl) {
        nameEl.textContent = '[ ' + step.name + ' ]';
        nameEl.classList.add('visible');
    }

    // Instruction
    document.getElementById('instruction-text').textContent =
        'Diagnostic en cours — identifiez : ' + step.name;

    // Load and display the 3D model on the marker
    loadComponentModel(step);

    // Show quiz
    showQuiz(step.quiz);

    // Hide action button
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
// 3D MODEL MANAGEMENT
// ========================
function loadComponentModel(step) {
    var marker = document.querySelector('#main-marker');
    if (!marker) return;

    // Remove previous model if exists
    removeCurrentModel();

    // Show loading indicator
    var loader = document.getElementById('loading-model');
    if (loader) loader.classList.add('active');

    // Create new entity
    var entity = document.createElement('a-entity');
    entity.setAttribute('id', 'current-component');
    entity.setAttribute('gltf-model', 'url(' + step.modelFile + ')');
    entity.setAttribute('position', step.modelPosition);
    entity.setAttribute('scale', '0 0 0');
    entity.setAttribute('rotation', step.modelRotation);

    // When model loads, animate it in
    entity.addEventListener('model-loaded', function () {
        // Hide loading indicator
        if (loader) loader.classList.remove('active');

        // Scale-in animation
        entity.setAttribute('animation__scalein', {
            property: 'scale',
            from: '0 0 0',
            to: step.modelScale,
            dur: 800,
            easing: 'easeOutBack'
        });

        // Continuous rotation (sauf si desactive pour ce composant)
        if (step.rotate !== false) {
            entity.setAttribute('animation__rotate', {
                property: 'rotation',
                from: step.modelRotation,
                to: rotateY360(step.modelRotation),
                dur: 10000,
                loop: true,
                easing: 'linear'
            });
        }
    });

    entity.addEventListener('model-error', function () {
        if (loader) loader.classList.remove('active');
        console.warn('Erreur chargement modele:', step.modelFile);
    });

    marker.appendChild(entity);
    gameState.currentModelEntity = entity;
}

function rotateY360(baseRotation) {
    // Parse base rotation and add 360 to Y
    var parts = baseRotation.split(' ').map(Number);
    return parts[0] + ' ' + (parts[1] + 360) + ' ' + parts[2];
}

function removeCurrentModel() {
    if (gameState.currentModelEntity) {
        var parent = gameState.currentModelEntity.parentNode;
        if (parent) {
            parent.removeChild(gameState.currentModelEntity);
        }
        gameState.currentModelEntity = null;
    }
}

function showFinalModel() {
    var marker = document.querySelector('#main-marker');
    if (!marker) return;

    removeCurrentModel();

    var loader = document.getElementById('loading-model');
    if (loader) {
        loader.textContent = 'CHARGEMENT PC COMPLET...';
        loader.classList.add('active');
    }

    var entity = document.createElement('a-entity');
    entity.setAttribute('id', 'final-pc-model');
    entity.setAttribute('gltf-model', 'url(' + FINAL_MODEL.file + ')');
    entity.setAttribute('position', FINAL_MODEL.position);
    entity.setAttribute('scale', '0 0 0');
    entity.setAttribute('rotation', FINAL_MODEL.rotation);

    entity.addEventListener('model-loaded', function () {
        if (loader) loader.classList.remove('active');

        // Epic scale-in
        entity.setAttribute('animation__scalein', {
            property: 'scale',
            from: '0 0 0',
            to: FINAL_MODEL.scale,
            dur: 2000,
            easing: 'easeOutElastic'
        });

        // Continuous rotation
        entity.setAttribute('animation__rotate', {
            property: 'rotation',
            from: FINAL_MODEL.rotation,
            to: rotateY360(FINAL_MODEL.rotation),
            dur: 12000,
            loop: true,
            easing: 'linear'
        });
    });

    entity.addEventListener('model-error', function () {
        if (loader) loader.classList.remove('active');
        console.warn('Erreur chargement modele final');
    });

    marker.appendChild(entity);
    gameState.currentModelEntity = entity;
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
        // Disable all options
        var allBtns = optionsEl.querySelectorAll('.quiz-option');
        for (var i = 0; i < allBtns.length; i++) {
            allBtns[i].classList.add('disabled');
        }
        optionsEl.children[quiz.correctIndex].classList.add('correct');

        var points;
        if (attempts === 0) {
            points = POINTS_QUIZ_PERFECT;
            gameState.quizPerfect++;
            feedbackEl.textContent = 'CORRECT > +' + points + ' PTS — ' + quiz.explanation;
            feedbackEl.className = 'quiz-feedback correct';
        } else {
            points = POINTS_QUIZ_RETRY;
            feedbackEl.textContent = 'CORRECT > +' + points + ' PTS — ' + quiz.explanation;
            feedbackEl.className = 'quiz-feedback correct';
        }

        gameState.score += points;
        feedbackEl.classList.remove('hidden');
        document.getElementById('score-label').textContent = 'SCORE ' + gameState.score;

        // Effects
        sfxCorrect();
        triggerFlash('correct');
        triggerParticles(30, 'var(--green)');
        showScorePopup('+' + points, true);

        // Transition to next step
        setTimeout(function () {
            document.getElementById('quiz-panel').classList.add('hidden');
            gameState.phase = 'transition';

            // Brief pause to admire the model, then next
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

        // Effects
        sfxWrong();
        triggerFlash('wrong');
        triggerGlitch();
        showScorePopup(PENALTY_WRONG, false);
    }
}

function step_name_at(index) {
    return STEPS[index] ? STEPS[index].name : '';
}

// ========================
// VISUAL EFFECTS
// ========================
function triggerFlash(type) {
    var flash = document.getElementById('flash-overlay');
    if (!flash) return;
    flash.className = 'flash-overlay flash-' + type;
    setTimeout(function () {
        flash.className = 'flash-overlay';
    }, type === 'complete' ? 1000 : 500);
}

function triggerParticles(count, color) {
    var container = document.getElementById('particles-container');
    if (!container) return;

    for (var i = 0; i < count; i++) {
        var p = document.createElement('div');
        p.className = 'particle';
        p.style.background = color;
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.boxShadow = '0 0 6px ' + color;

        var angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5);
        var distance = 80 + Math.random() * 200;
        var dx = Math.cos(angle) * distance;
        var dy = Math.sin(angle) * distance;

        p.style.setProperty('--dx', dx + 'px');
        p.style.setProperty('--dy', dy + 'px');
        p.style.animation = 'particle-fly ' + (0.6 + Math.random() * 0.8) + 's ease-out forwards';

        container.appendChild(p);

        // Cleanup
        (function (el) {
            setTimeout(function () {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 1500);
        })(p);
    }
}

function triggerGlitch() {
    document.body.classList.add('glitch-active');
    setTimeout(function () {
        document.body.classList.remove('glitch-active');
    }, 300);
}

function showScorePopup(text, positive) {
    var popup = document.createElement('div');
    popup.className = 'score-popup ' + (positive ? 'positive' : 'negative');
    popup.textContent = text;
    document.body.appendChild(popup);
    setTimeout(function () {
        if (popup.parentNode) popup.parentNode.removeChild(popup);
    }, 1300);
}

// ========================
// MARKER STATUS
// ========================
function addMarkerStatus() {
    var statusEl = document.createElement('div');
    statusEl.id = 'marker-status';
    statusEl.textContent = 'RECHERCHE MARQUEUR HIRO...';
    document.body.appendChild(statusEl);
}

function updateMarkerStatus(found) {
    var statusEl = document.getElementById('marker-status');
    if (!statusEl) return;
    if (found) {
        statusEl.textContent = 'MARQUEUR DETECTE';
        statusEl.classList.add('found');
        setTimeout(function () { statusEl.style.opacity = '0'; }, 2000);
    } else {
        statusEl.textContent = 'RECHERCHE MARQUEUR HIRO...';
        statusEl.classList.remove('found');
        statusEl.style.opacity = '1';
    }
}

// ========================
// FIN DU JEU
// ========================
function finishGame() {
    gameState.phase = 'complete';

    // Calculate time
    var elapsed = Date.now() - gameState.startTime;
    var minutes = Math.floor(elapsed / 60000);
    var seconds = Math.floor((elapsed % 60000) / 1000);
    var timeStr = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

    // Calculate rank
    var maxScore = POINTS_QUIZ_PERFECT * STEPS.length;
    var percentage = (gameState.score / maxScore) * 100;

    var rank, rankClass, message;
    if (percentage >= 90) {
        rank = 'S+'; rankClass = 'gold';
        message = 'Performance exceptionnelle. Vous maitrisez l\'assemblage PC.';
    } else if (percentage >= 70) {
        rank = 'A'; rankClass = 'silver';
        message = 'Solide. Vous connaissez les bases de l\'assemblage.';
    } else if (percentage >= 50) {
        rank = 'B'; rankClass = 'bronze';
        message = 'Acceptable. Continuez a pratiquer.';
    } else {
        rank = 'C'; rankClass = 'beginner';
        message = 'Termine. Revoyez les fondamentaux et retentez.';
    }

    // Effects
    sfxComplete();
    triggerFlash('complete');
    triggerParticles(50, 'var(--cyan)');

    // Update HUD
    document.getElementById('progress-fill').style.width = '100%';
    document.getElementById('step-label').textContent = 'TERMINE';

    var nameEl = document.getElementById('component-name');
    if (nameEl) {
        nameEl.textContent = '[ ASSEMBLAGE COMPLET ]';
        nameEl.classList.add('visible');
    }

    document.getElementById('instruction-text').textContent =
        'PC assemble avec succes. Admirez votre build en 3D.';

    // Show the final complete PC model
    showFinalModel();

    // Show end screen after delay
    setTimeout(function () {
        document.getElementById('hud').classList.add('hidden');
        var endScreen = document.getElementById('end-screen');
        endScreen.classList.remove('hidden');

        document.getElementById('rank-badge').textContent = rank;
        document.getElementById('rank-badge').className = 'rank-badge ' + rankClass;
        document.getElementById('final-message').textContent = message;
        document.getElementById('final-score').textContent = gameState.score;
        document.getElementById('final-time').textContent = timeStr;
        document.getElementById('final-rank').textContent = rank;
        document.getElementById('quiz-perfect').textContent = gameState.quizPerfect;
        document.getElementById('total-errors').textContent = gameState.totalErrors;
    }, 5000);
}

// ========================
// RECOMMENCER
// ========================
function restartExperience() {
    gameState = {
        currentStep: 0,
        score: 0,
        quizPerfect: 0,
        totalErrors: 0,
        startTime: Date.now(),
        markerFound: gameState.markerFound,
        phase: 'quiz',
        musicPlaying: gameState.musicPlaying,
        currentModelEntity: null
    };

    // Remove any model on marker
    removeCurrentModel();

    // Also remove final model if present
    var finalModel = document.querySelector('#final-pc-model');
    if (finalModel && finalModel.parentNode) {
        finalModel.parentNode.removeChild(finalModel);
    }

    // UI reset
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('progress-fill').style.width = '0%';

    var nameEl = document.getElementById('component-name');
    if (nameEl) nameEl.classList.remove('visible');

    startStep(0);
}
