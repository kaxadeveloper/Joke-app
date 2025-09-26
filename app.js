// Simple Joke App JS

// Elements
const setupEl = document.getElementById('setup');
const punchEl = document.getElementById('punch');
const sourceEl = document.getElementById('source');
const newBtn = document.getElementById('newBtn');
const surpriseBtn = document.getElementById('surpriseBtn');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const sourceSelect = document.getElementById('sourceSelect');
const savedList = document.getElementById('savedList');
const autoRead = document.getElementById('autoRead');

// Built-in fallback jokes
const localJokes = [
  { setup: "Why do programmers prefer dark mode?", punch: "Because light attracts bugs." },
  { setup: "How do you comfort a JavaScript bug?", punch: "You console it." },
  { setup: "What do you call a sketchy neighborhood in the browser?", punch: "The 'DOM' district." },
  { setup: "Why did the developer go broke?", punch: "Because he used up all his cache." },
  { setup: "I told my computer I needed a break.", punch: "It said: 'No problem — I'll go to sleep.'" },
  { setup: "One-liner: I would tell you a UDP joke...", punch: "But you might not get it." }
];

// Load saved jokes from localStorage
const saved = JSON.parse(localStorage.getItem('saved-jokes') || '[]');

function renderSaved() {
  savedList.innerHTML = '';
  if (saved.length === 0) {
    savedList.innerHTML = '<div class="small">No saved jokes yet — click Save when you like one.</div>';
    return;
  }
  saved.slice().reverse().forEach((j) => {
    const d = document.createElement('div');
    d.className = 'item';
    d.tabIndex = 0;
    d.innerHTML = `<strong>${escapeHtml(j.setup)}</strong><div class="small">${escapeHtml(j.punch)}</div>`;
    savedList.appendChild(d);
  });
}
renderSaved();

// Helpers
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function fetchJoke() {
  try {
    const res = await fetch('https://official-joke-api.appspot.com/random_joke');
    if (!res.ok) throw new Error('API error');
    const j = await res.json();
    return { setup: j.setup || '', punch: j.punchline || j.punch || '' };
  } catch (e) {
    return null;
  }
}

// Main function: show a joke
async function showJoke(opts = { type: 'api' }) {
  punchEl.textContent = '';
  setupEl.classList.add('pulse');
  setTimeout(() => setupEl.classList.remove('pulse'), 600);

  let joke;

  if (opts.type === 'api') {
    const j = await fetchJoke();
    if (j) {
      joke = j;
    } else {
      // fallback to local
      joke = localJokes[Math.floor(Math.random() * localJokes.length)];
    }
  } else if (opts.type === 'local') {
    joke = localJokes[Math.floor(Math.random() * localJokes.length)];
  }

  if (joke) {
    setupEl.textContent = joke.setup;
    punchEl.textContent = joke.punch;

    if (autoRead.checked) {
      const utterance = new SpeechSynthesisUtterance(
        `${joke.setup} ... ${joke.punch}`
      );
      speechSynthesis.speak(utterance);
    }
  }
}

// Event listeners
newBtn.addEventListener('click', () =>
  showJoke({ type: sourceSelect.value })
);

surpriseBtn.addEventListener('click', () =>
  showJoke({ type: Math.random() > 0.5 ? 'api' : 'local' })
);

copyBtn.addEventListener('click', () => {
  const text = `${setupEl.textContent} ${punchEl.textContent}`;
  if (text.trim()) {
    navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1000);
  }
});

saveBtn.addEventListener('click', () => {
  const joke = { setup: setupEl.textContent, punch: punchEl.textContent };
  if (joke.setup && joke.punch) {
    saved.push(joke);
    localStorage.setItem('saved-jokes', JSON.stringify(saved));
    renderSaved();
    saveBtn.textContent = 'Saved!';
    setTimeout(() => (saveBtn.textContent = 'Save'), 1000);
  }
});

// Show an initial joke on load
showJoke({ type: 'api' });
