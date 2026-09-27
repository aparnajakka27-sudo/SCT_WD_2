let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let isRunning = false;
let laps = [];
let isDarkMode = true;

const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const millisecondsEl = document.getElementById('milliseconds');

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const lapBtn = document.getElementById('lap-btn');
const resetBtn = document.getElementById('reset-btn');

const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

const totalLapsEl = document.getElementById('total-laps');
const fastestLapEl = document.getElementById('fastest-lap');
const slowestLapEl = document.getElementById('slowest-lap');
const lapCountEl = document.getElementById('lap-count');
const lapsListEl = document.getElementById('laps-list');

const themeToggleBtn = document.getElementById('theme-toggle');

// Format time utility
function formatTime(timeInMs, includeMs = true) {
    const h = Math.floor(timeInMs / 3600000).toString().padStart(2, '0');
    const m = Math.floor((timeInMs % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((timeInMs % 60000) / 1000).toString().padStart(2, '0');
    const ms = (timeInMs % 1000).toString().padStart(3, '0');

    if (includeMs) return `${h}:${m}:${s}.${ms}`;
    return `${m}:${s}.${ms}`; // Simpler format for laps
}

function updateDisplay(time) {
    const h = Math.floor(time / 3600000).toString().padStart(2, '0');
    const m = Math.floor((time % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((time % 60000) / 1000).toString().padStart(2, '0');
    const ms = (time % 1000).toString().padStart(3, '0');

    hoursEl.textContent = h;
    minutesEl.textContent = m;
    secondsEl.textContent = s;
    millisecondsEl.textContent = `.${ms}`;
}

function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        updateDisplay(elapsedTime);
    }, 10);
    
    isRunning = true;
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    lapBtn.disabled = false;
    resetBtn.disabled = false;
    
    statusIndicator.classList.add('running');
    statusText.textContent = 'Running';
}

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    
    startBtn.textContent = 'Resume';
    
    statusIndicator.classList.remove('running');
    statusText.textContent = 'Paused';
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    elapsedTime = 0;
    laps = [];
    
    updateDisplay(0);
    renderLaps();
    
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    startBtn.textContent = 'Start';
    lapBtn.disabled = true;
    resetBtn.disabled = true;
    
    statusIndicator.classList.remove('running');
    statusText.textContent = 'Ready';
}

function recordLap() {
    if (!isRunning) return;
    
    const previousLapTotal = laps.length > 0 ? laps[0].total : 0;
    const lapTime = elapsedTime - previousLapTotal;
    
    laps.unshift({
        id: laps.length + 1,
        time: lapTime,
        total: elapsedTime
    });
    
    renderLaps();
}

function renderLaps() {
    totalLapsEl.textContent = laps.length;
    lapCountEl.textContent = `${laps.length} laps`;
    
    if (laps.length === 0) {
        lapsListEl.innerHTML = '<div class="empty-laps">No laps recorded yet.</div>';
        fastestLapEl.textContent = '--:--.---';
        slowestLapEl.textContent = '--:--.---';
        return;
    }
    
    // Find fastest and slowest
    let fastest = laps[0];
    let slowest = laps[0];
    
    laps.forEach(lap => {
        if (lap.time < fastest.time) fastest = lap;
        if (lap.time > slowest.time) slowest = lap;
    });
    
    fastestLapEl.textContent = formatTime(fastest.time, false);
    slowestLapEl.textContent = formatTime(slowest.time, false);
    
    lapsListEl.innerHTML = '';
    
    laps.forEach(lap => {
        const item = document.createElement('div');
        item.className = 'lap-item';
        
        let status = 'Normal';
        if (laps.length > 1) {
            if (lap.id === fastest.id) status = 'Fastest';
            if (lap.id === slowest.id) status = 'Slowest';
        }
        
        item.innerHTML = `
            <span>#${lap.id}</span>
            <span>+${formatTime(lap.time, false)}</span>
            <span>${formatTime(lap.total, false)}</span>
            <span>${status}</span>
        `;
        
        lapsListEl.appendChild(item);
    });
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleBtn.textContent = '🌙';
    }
}

// Initial setup
document.body.classList.add('dark-mode');
themeToggleBtn.textContent = '☀️';

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
lapBtn.addEventListener('click', recordLap);
themeToggleBtn.addEventListener('click', toggleTheme);
