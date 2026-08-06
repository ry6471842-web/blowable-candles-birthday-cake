const params = new URLSearchParams(window.location.search);
const name = params.get("name") || "Friend";
let candleCount = parseInt(params.get("candles")) || 4;
candleCount = Math.min(Math.max(candleCount, 1), 30);

const birthdayText = document.getElementById("birthdayText");
birthdayText.innerHTML = `
<div id="mainTitle">Happy Birthday♡, ${name}!</div>
<div id="subTitle">Make a wish and blow candles ⋆｡‧₊˚.</div>
`;

const cake = document.getElementById("cake");
const startBtn = document.getElementById("startBtn");
// 
const candlesContainer = document.getElementById("candles");
// 
const colors = [
"green-candle",
"purple-candle",
"blue-candle",
"yellow-candle",
];
const CAKE_VISUAL_WIDTH = 35;

function createCandles(count) {

const CANDLE_VISUAL_WIDTH = 2;
const availableWidth = CAKE_VISUAL_WIDTH;
const candlesPerRow = 6;
const shiftAmount = 4;

for (let i = 0; i < count; i++) {
    const candle = document.createElement("div");
    candle.classList.add("candle");
    const colorClass = colors[Math.floor(Math.random() * colors.length)];
    candle.classList.add(colorClass);

    const row = Math.floor(i / candlesPerRow);
    const col = i % candlesPerRow;
    const totalCandlesInRow = Math.min(
    candlesPerRow,
    count - row * candlesPerRow
    );
    const rowSpacing = availableWidth / (totalCandlesInRow + 1);

    const leftBase = rowSpacing * (col + 1) - CANDLE_VISUAL_WIDTH / 2;
    const rowShift = row % 2 === 0 ? 0 : shiftAmount;

    candle.style.position = "absolute";
    candle.style.top = "40px";
    candle.style.left = `${70 + col * 45}px`;
    cake.appendChild(candle);
}
}

createCandles(candleCount);

// === Blow Detection ===
let audioContext;
let blown = false;

async function startMicDetection() {
try {
    const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Resume audio context if suspended by browser policy
    if (audioContext.state === "suspended") {
    await audioContext.resume();
    }

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function detectBlow() {
    if (blown) return;

    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume energy
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const averageVolume = sum / dataArray.length;

    // Blow threshold (adjust between 40 - 70 depending on mic sensitivity)
    const BLOW_THRESHOLD = 50;

    if (averageVolume > BLOW_THRESHOLD) {
        blown = true;
        blowOutCandles();
    } else {
        requestAnimationFrame(detectBlow);
    }
    }

    detectBlow();
    startBtn.style.display = "none"; // Hide button after enabling mic
} catch (err) {
    console.error("Mic access error:", err);
    alert("Microphone access is required to blow out the candles!");
}
}

function blowOutCandles() {
const candles = document.querySelectorAll(".candle");
candles.forEach((candle) => {
    const delay = Math.random() * 800;
    setTimeout(() => {
    candle.classList.add("blown");
    }, delay);
});

// Update subTitle after short delay
setTimeout(() => {
    const subTitle = document.getElementById("subTitle");
    subTitle.textContent = `Yayy! Wishing you the happiest birthday ever!! ˙⋆✮`;
}, 1000);
}

// Trigger microphone detection on user interaction to bypass browser policies
startBtn.addEventListener("click", startMicDetection);