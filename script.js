// script.js

// Elements
const instructions = document.getElementById("instructions");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-btn");
const helpBtn = document.getElementById("help-btn");
const startBtn = document.getElementById("start");
const setup = document.getElementById("setup-frame");
const gameplay = document.querySelector(".gameplay");
const results = document.getElementById("results")

// Test Data
const dummyWinner = "Player";
const dummyLoser = "Computer";
const dummyRounds = 5;
const dummyPlayerNumber = "427";
const dummyComputerNumber = "459";

const winner = document.getElementById("winner");
const winnerP = document.getElementById("winner-p");
const loserP = document.getElementById("loser-p");
const numRoundsP = document.getElementById("numRounds-p");
const badgePlayer = document.querySelector("#results #badge-player");
const badgeComputer = document.querySelector("#results #badge-computer")

// Show instructions on page load
window.onload = () => {
    overlay.style.display = "block";
    instructions.classList.remove("hidden");
    overlay.classList.remove("hidden")
    setup.classList.remove("hidden");
};

window.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("hidden"); // show overlay on load
});


// Close instructions
closeBtn.addEventListener("click", () => {
    instructions.classList.add("hidden");
    overlay.classList.add("hidden");
    setup.classList.remove("hidden");
});

// Re-open instructions using help button
helpBtn.addEventListener("click", () => {
    instructions.classList.remove("hidden");
    overlay.classList.remove("hidden");
});

// Start game: hide setup, show gameplay
startBtn.addEventListener("click", () => {
    setup.classList.add("hidden");
    gameplay.classList.remove("hidden");
    results.classList.add("hidden");
});

winner.textContent = `${dummyWinner} Wins!`;
winnerP.textContent = dummyWinner;
loserP.textContent = dummyLoser;
numRoundsP.textContent = dummyRounds;
badgePlayer.textContent = dummyPlayerNumber;
badgeComputer.textContent = dummyComputerNumber;

badgePlayer.style.backgroundColor = "#155DFC";
badgeComputer.style.backgroundColor = "#6619B8";
winner.style.color = "#155DFC;"