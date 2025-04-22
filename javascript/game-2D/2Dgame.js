//-----------------------------------------------------------------------------
//  CONSTANT AND VARIABLE DECLARATIONS
//-----------------------------------------------------------------------------

const PIECE = document.getElementById('piece');
const INCREASE = document.getElementById('increase');
const DECREASE = document.getElementById('decrease'); 
const DIFFICULTY = document.getElementById('difficulty');
const TIMER = document.getElementById('timer');
const SCORE = document.getElementById('score');
const RESET_MESSAGE = document.getElementById('resetMessage');
const DIFFICULTY_MESSAGE = document.getElementById('difficultyMessage');
const SCORE_LIST = document.getElementById('scoreList');
const BTN_START = document.getElementById('btnStart');

// Difficulty levels configuration
const DIFFICULTY_LEVELS = {
    easy: {
        size: 70,
        color: "#4AAD52"
    },
    normal: {
        size: 50,
        color: "#F3C969"
    },
    hard: {
        size: 30,
        color: "#E63B2E"
    }
};

let posX;
let posY;
let time = 0;
let points = 0;
let isTimerOn = false;
let currentDifficulty = 'normal';
let scoreHistory = [];
let currentSession = 0;
let sessionPoints = 0;
let countdownInterval;

//-----------------------------------------------------------------------------
//  INITIALIZATION
//-----------------------------------------------------------------------------

// This function runs every 0.7 seconds
setInterval(changePosition, 700);

// Clicking the piece triggers the function
PIECE.addEventListener('click', pieceClick);

BTN_START.addEventListener('click', handleSession);

// Clicking the buttons triggers the corresponding functions
INCREASE.addEventListener('click', handleDifficultyIncrease);
DECREASE.addEventListener('click', handleDifficultyDecrease);

// Set initial difficulty
setDifficulty('normal');

//-----------------------------------------------------------------------------
//  FUNCTIONS
//-----------------------------------------------------------------------------

function handleSession() {
    if (!isTimerOn) {
        startNewSession();
    } else {
        console.log('Timer is already running');
    }
}

function startNewSession() {
    console.log('Starting new session');
    
    // Clear any existing countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    currentSession++;
    sessionPoints = 0;
    RESET_MESSAGE.style.display = 'none';
    time = 20;
    TIMER.innerHTML = time;
    isTimerOn = true;
    
    console.log('Starting countdown');
    
    // Start the countdown interval
    countdownInterval = setInterval(countdown, 1000);
}

function countdown() {
    console.log('Countdown tick: ' + time);
    
    if (time > 0) {
        time--;
        TIMER.innerHTML = time;
    } else {
        // Timer reached zero
        clearInterval(countdownInterval);
        endSession();
    }
}

function endSession() {
    console.log('Session ended');
    
    RESET_MESSAGE.style.display = 'block';
    isTimerOn = false;
    
    // Save the session score when timer reaches zero
    addToScoreHistory(sessionPoints, currentDifficulty, currentSession);
}

/**
 * Adds a score to the history and updates the display
 */
function addToScoreHistory(score, difficulty, session) {
    const scoreItem = {
        score: score,
        difficulty: difficulty,
        session: session,
        timestamp: new Date().toLocaleTimeString()
    };
    
    scoreHistory.unshift(scoreItem); // Add to beginning of array
    updateScoreDisplay();
}

/**
 * Updates the score history display
 */
function updateScoreDisplay() {
    SCORE_LIST.innerHTML = '';
    scoreHistory.forEach(item => {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'score-item';
        scoreElement.innerHTML = `
            <span class="score-value">${item.score} points</span>
            <span class="score-difficulty ${item.difficulty}">${item.difficulty}</span>
            <span class="score-session">Session ${item.session}</span>
            <small class="text-muted">${item.timestamp}</small>
        `;
        SCORE_LIST.appendChild(scoreElement);
    });
}

/**
 * Sets the difficulty level and updates the piece accordingly
 */
function setDifficulty(level) {
    currentDifficulty = level;
    const config = DIFFICULTY_LEVELS[level];
    PIECE.style.width = config.size + 'px';
    PIECE.style.height = config.size + 'px';
    PIECE.style.backgroundColor = config.color;
    DIFFICULTY.innerHTML = level;
    
    // Update the color of the difficulty span
    const difficultySpan = document.querySelector('#difficulty');
    switch(level) {
        case 'easy':
            difficultySpan.style.color = "#4AAD52"; // Green
            break;
        case 'normal':
            difficultySpan.style.color = "#F3C969"; // Yellow
            break;
        case 'hard':
            difficultySpan.style.color = "#E63B2E"; // Red
            break;
    }
}

/**
 * Generates random numbers and ensures they fit within the board size.
 * Both the board and the piece have CSS property position: relative;
 * This simplifies coordinates within the board (0 - 500), ignoring
 * their placement on the page. We subtract the piece size to prevent
 * it from going outside the boundaries.
 */
function changePosition() {
    posX = Math.floor(Math.random() * (500 - PIECE.offsetWidth));
    posY = Math.floor(Math.random() * (500 - PIECE.offsetHeight));        
        
    PIECE.style.top = posY + 'px';
    PIECE.style.left = posX + 'px';
}

/**
 * Adds the remaining time to the score when clicking the piece.
 * Then resets the timer to 20 and increases the difficulty.
 */
function pieceClick() {
    // Add points to both total and session scores
    points += time;
    sessionPoints += time;
    
    SCORE.innerHTML = points;
    
    if (time > 0) {
        // Reset timer to 20 and continue the session
        time = 20;
        TIMER.innerHTML = time;
        increaseDifficulty();
    } else {
        // Start a new session if timer is at zero
        startNewSession();
    }
}

function handleDifficultyIncrease() {
    if (isTimerOn) {
        showDifficultyMessage();
        return;
    }
    increaseDifficulty();
}

function handleDifficultyDecrease() {
    if (isTimerOn) {
        showDifficultyMessage();
        return;
    }
    decreaseDifficulty();
}

function showDifficultyMessage() {
    DIFFICULTY_MESSAGE.style.display = 'block';
    setTimeout(() => {
        DIFFICULTY_MESSAGE.style.display = 'none';
    }, 3000);
}

/**
 * Increases the difficulty level (easy -> normal -> hard)
 */
function increaseDifficulty() {
    switch(currentDifficulty) {
        case 'easy':
            setDifficulty('normal');
            break;
        case 'normal':
            setDifficulty('hard');
            break;
        case 'hard':
            // Already at maximum difficulty
            break;
    }
}

/**
 * Decreases the difficulty level (hard -> normal -> easy)
 */
function decreaseDifficulty() {
    switch(currentDifficulty) {
        case 'hard':
            setDifficulty('normal');
            break;
        case 'normal':
            setDifficulty('easy');
            break;
        case 'easy':
            // Already at minimum difficulty
            break;
    }
}
