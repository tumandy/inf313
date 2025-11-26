/* -------------------------------------------------- */
/* GAME LOGIC CLASS                                   */
/* -------------------------------------------------- */
class GameState {
    constructor() {
        this.round = 1;                  // Current round
        this.maxRounds = 7;              // Max rounds allowed
        this.playerSecret = "";           // Player's secret number
        this.computerSecret = "";         // CPU's secret number
        this.playerGuesses = 0;          
        this.computerGuesses = 0;
        this.gameOver = false;
        this.cpuCandidates = this.generateAllCandidates(); // All possible CPU guesses
    }

    generateAllCandidates() {
        const candidates = [];
        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j <= 9; j++) {
                if (i === j) continue;             // Skip duplicates
                for (let k = 1; k <= 9; k++) {
                    if (k === i || k === j) continue;
                    candidates.push(`${i}${j}${k}`); // Unique 3-digit string
                }
            }
        }
        return candidates;
    }

    generateSecret() {                   // Random secret number
        const idx = Math.floor(Math.random() * this.generateAllCandidates().length);
        return this.generateAllCandidates()[idx];
    }

    getFeedback(secret, guess) {        // Compute exact & misplaced digits
        let exact = 0, misplaced = 0;
        for (let i = 0; i < 3; i++) {
            if (guess[i] === secret[i]) exact++;          // Correct digit & position
            else if (secret.includes(guess[i])) misplaced++; // Correct digit, wrong position
        }
        return { exact, misplaced };
    }

    filterCandidates(guess, feedback) { // Keep only candidates matching feedback
        this.cpuCandidates = this.cpuCandidates.filter(candidate => {
            const sim = this.getFeedback(candidate, guess);
            return sim.exact === feedback.exact && sim.misplaced === feedback.misplaced;
        });
    }

    getCpuGuess() {                      // Pick random remaining candidate
        if (this.cpuCandidates.length === 0) return "123"; // fallback
        const idx = Math.floor(Math.random() * this.cpuCandidates.length);
        return this.cpuCandidates[idx];
    }
}

/* -------------------------------------------------- */
/* UI CONTROLLER                                      */
/* -------------------------------------------------- */
const game = new GameState();

// Overlay & Instructions
const overlay = document.getElementById("overlay");
const instructions = document.getElementById("instructions");
const helpBtn = document.getElementById("help-btn");
const closeBtn = document.getElementById("close-btn");

// Setup elements
const setupFrame = document.getElementById("setup-frame");
const setupInput = document.getElementById("setup-input");
const startBtn = document.getElementById("start-btn");
const setupError = document.createElement("p");
setupError.style.color = "#DC2626";
setupFrame.appendChild(setupError);

// Gameplay elements
const gameplayFrame = document.querySelector(".gameplay");
const gameplay = document.getElementById("gameplay-frame");
const playerList = document.getElementById("player-guesses-list");
const computerList = document.getElementById("computer-guesses-list");
const zeroGuesses = document.getElementsByClassName("no-guesses");
const roundBadge = document.getElementById("badge-round");
const playerSecretBadge = document.getElementById("badge-player-secret");

const turnBadge = document.getElementById("turn-indicator");
const guessInput = document.getElementById("guess-input");
const guessBtn = document.getElementById("guess-btn");
const gameError = document.createElement("p");
gameError.style.color = "#DC2626";
const currentTurnFrame = document.getElementById("currentTurn_frame");
document.getElementById("currentTurn_content").appendChild(gameError);

// Results
const resultsFrame = document.getElementById("results-frame");
const resCompBadge = document.getElementById("badge-computer-result");
const resPlayBadge = document.getElementById("badge-player-result");
const winnerTitle = document.getElementById("winner-title");
const restartBtn = document.getElementById("restart-btn");
const resultsDetails = document.getElementById("results-details");

/* --- Event Listeners --- */
window.onload = () => {
    overlay.classList.remove("hidden");     // Show instructions initially
    instructions.classList.remove("hidden");
};

closeBtn.addEventListener("click", () => { // Close instructions
    overlay.classList.add("hidden");
    instructions.classList.add("hidden");
});

overlay.addEventListener("click", (e) => { // Close if click outside instructions
    if (!instructions.contains(e.target)) {
        overlay.classList.add("hidden");
        instructions.classList.add("hidden");
    }
});

helpBtn.addEventListener("click", () => {  // Reopen instructions
    overlay.classList.remove("hidden");
    instructions.classList.remove("hidden");
});

startBtn.addEventListener("click", startGame);
guessBtn.addEventListener("click", handleTurn);
restartBtn.addEventListener("click", resetGame);

guessInput.addEventListener("keypress", e => { if (e.key === "Enter") handleTurn(); });
setupInput.addEventListener("keypress", e => { if (e.key === "Enter") startGame(); });

/* --- FUNCTIONS --- */
function isValid(numStr) { // Input validation
    if (!numStr || numStr.length !== 3) return "Must be 3 digits.";
    if (!/^\d+$/.test(numStr)) return "Digits only.";
    if (numStr.includes("0")) return "Digits 1–9 only.";
    if (new Set(numStr).size !== 3) return "Digits must be unique.";
    return null;
}

function createFeedbackHTML(feedback) { // Generate feedback icons
    let html = '<div class="feedback-group">';
    for (let i = 0; i < feedback.exact; i++) html += '<img src="assets/feedback_exact.svg">';
    for (let i = 0; i < feedback.misplaced; i++) html += '<img src="assets/feedback_misplaced.svg">';
    if (feedback.exact === 0 && feedback.misplaced === 0) html += '<span style="color:#ccc; font-weight:bold;">-</span>'; // no matches
    html += '</div>';
    return html;
}

function addGuessRow(container, guess, feedback) { // Add a guess to the UI
    Array.from(zeroGuesses).forEach(z => z.style.display = "none"); // hide placeholder
    const row = document.createElement("div");
    row.className = "guess-round";
    row.innerHTML = `<span class="guess">${guess.split("").join(" ")}</span>${createFeedbackHTML(feedback)}`;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight; // scroll to latest
}

function updateTurnBadge(isPlayerTurn) { // Update UI for turn
    if (isPlayerTurn) {
        turnBadge.textContent = "Your Turn!";
        turnBadge.classList.remove("purple");
        turnBadge.classList.add("blue");
        guessInput.style.display = "block";
        guessBtn.style.display = "block";
    } else {
        turnBadge.textContent = "Computer's Turn";
        turnBadge.classList.remove("blue");
        turnBadge.classList.add("purple");
        guessInput.style.display = "none";
        guessBtn.style.display = "none";
    }
}

function startGame() { // Initialize a new game
    const val = setupInput.value.toString();
    const error = isValid(val);
    if (error) {
        setupError.textContent = error;
        return;
    }

    game.playerSecret = val;
    game.computerSecret = game.generateSecret();
    game.round = 1;
    game.gameOver = false;
    game.playerGuesses = 0;
    game.computerGuesses = 0;
    game.cpuCandidates = game.generateAllCandidates();

    setupError.textContent = "";
    setupFrame.classList.add("hidden");
    gameplayFrame.classList.remove("hidden");
    resultsFrame.classList.add("hidden");

    playerList.innerHTML = '<h4>Your guesses</h4><span class="no-guesses">No guesses yet</span>';
    computerList.innerHTML = '<h4>Computer\'s guesses</h4><span class="no-guesses">No guesses yet</span>';

    roundBadge.textContent = game.round;
    playerSecretBadge.textContent = game.playerSecret;

    guessInput.value = "";
    guessInput.disabled = false;
    guessBtn.disabled = false;

    updateTurnBadge(true);
    guessInput.focus();
}

function handleTurn() { // Player + CPU turn
    if (game.gameOver) return;

    const playerGuess = guessInput.value.toString();
    const error = isValid(playerGuess);
    if (error) {
        gameError.textContent = error;
        guessInput.value = "";
        return;
    }
    gameError.textContent = "";

    game.playerGuesses++;
    addGuessRow(playerList, playerGuess, game.getFeedback(game.computerSecret, playerGuess));

    if (playerGuess === game.computerSecret) {
        endGame("Player");
        return;
    }

    guessInput.value = "";  
    guessInput.focus();

    updateTurnBadge(false);

    setTimeout(() => { // CPU turn with delay
        const cpuGuess = game.getCpuGuess();
        game.computerGuesses++;
        const cpuFeedback = game.getFeedback(game.playerSecret, cpuGuess);
        game.filterCandidates(cpuGuess, cpuFeedback);
        addGuessRow(computerList, cpuGuess, cpuFeedback);

        if (cpuGuess === game.playerSecret) {
            endGame("Computer");
            return;
        }

        game.round++;
        roundBadge.textContent = game.round;

        updateTurnBadge(true);
        guessInput.disabled = false;
        guessBtn.disabled = false;
        guessInput.focus();
    }, 800);
}

function endGame(winner) { // Display results
    game.gameOver = true;
    guessInput.disabled = true;
    guessBtn.disabled = true;

    resultsFrame.classList.remove("hidden");
    currentTurnFrame.classList.add("hidden");

    // Wait for layout to update, then scroll
    setTimeout(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    }, 50); // 50ms delay allows DOM to render

    resCompBadge.textContent = game.computerSecret;
    resCompBadge.classList.remove("blue")
    resCompBadge.classList.add("purple")
    resPlayBadge.textContent = game.playerSecret;

    const winnerDiv = document.createElement("div");
    winnerDiv.className = "winner-call";
    winnerDiv.innerHTML = "🎉 Winner!";

    // What message to show 
    if (winner === "Player") {
        playerList.appendChild(winnerDiv);
        winnerTitle.textContent = "You win!";
        resultsDetails.innerHTML = `You guessed Computer's secret number in ${game.playerGuesses} guess${game.playerGuesses > 1 ? 'es': ''}!`;
    }
    else if (winner === "Computer") {
        computerList.appendChild(winnerDiv); 
        winnerTitle.textContent = "Computer wins!";
        resultsDetails.innerHTML = `The Computer guessed your secret number in ${game.computerGuesses} guess${game.computerGuesses > 1 ? 'es': ''}!`;
    }
    else {
        winnerTitle.textContent = "It's a draw!";
        resultDetails.innerHTML = "No one was able to guess correctly after 7 rounds!"
    } 
}

function resetGame() { // Reset UI & state
    // Go back to setup, then gameplay
    resultsFrame.classList.add("hidden");
    gameplayFrame.classList.add("hidden");
    currentTurnFrame.classList.remove("hidden");
    setupFrame.classList.remove("hidden");

    // Clear inputs and errors
    setupInput.value = "";
    guessInput.value = "";
    gameError.textContent = "";
    setupError.textContent = "";

    // Clear results and status
    playerList.innerHTML = '<h4>Your guesses</h4><span class="no-guesses">No guesses yet</span>';
    computerList.innerHTML = '<h4>Computer\'s guesses</h4><span class="no-guesses">No guesses yet</span>';
    roundBadge.textContent = "1";
    playerSecretBadge.textContent = "";
    turnBadge.textContent = "";
    
    // Reset game state
    const newGame = new GameState();
    Object.assign(game, newGame);
}
