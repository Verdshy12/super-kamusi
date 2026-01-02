const searchInput = document.getElementById('searchInput');
const resultsGrid = document.getElementById('results');
const resultCount = document.getElementById('resultCount');

let dictionaryData = [];

// --- CONFIGURATION ---
// These keys must match your JSON file exactly!
const KEY_SWAHILI = 'Word';
const KEY_DEFINITION = 'Meaning';
const KEY_ENGLISH = 'english_word';
// ---------------------

// 1. Load Data
async function loadDictionary() {
    try {
        const res = await fetch('kamusi_final.json');

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        dictionaryData = await res.json();
        console.log(`Loaded ${dictionaryData.length} words.`);

        // Show 12 random "Words of the Day" on startup
        const randomWords = dictionaryData.sort(() => 0.5 - Math.random()).slice(0, 12);
        outputHtml(randomWords);

    } catch (err) {
        console.error("Error loading dictionary:", err);
        resultsGrid.innerHTML = `
        <div style="text-align:center; padding: 20px; color: #7f1d1d; background: #fca5a5; border-radius: 8px;">
        <strong>Failed to load data.</strong><br>
        Please ensure 'kamusi_final.json' is in the folder and you are running a local server.
        </div>`;
    }
}

// 2. Search Logic
const searchWords = (searchText) => {
    if (searchText.length === 0) {
        resultsGrid.innerHTML = '';
        resultCount.innerText = "Start typing to search...";
        return;
    }

    const regex = new RegExp(`^${searchText}`, 'gi'); // Matches start of word

    // Filter logic: Checks both Swahili AND English words
    let matches = dictionaryData.filter(item => {
        const swahili = item[KEY_SWAHILI] ? item[KEY_SWAHILI].toString() : "";
        const english = item[KEY_ENGLISH] ? item[KEY_ENGLISH].toString() : "";

        return swahili.match(regex) || english.match(regex);
    });

    outputHtml(matches.slice(0, 50)); // Limit to 50 results for performance
    resultCount.innerText = `Found ${matches.length} matches`;
};

// 3. Render Cards
const outputHtml = matches => {
    if (matches.length > 0) {
        const html = matches.map(match => `
        <div class="card">
        <div class="card-header">
        <span class="pos">Swahili</span>
        <button onclick="window.openReportModal('${match[KEY_SWAHILI]}')" class="btn-report" title="Report Error">🚩</button>
        </div>

        <h3>${match[KEY_SWAHILI]}</h3>
        <p class="definition">${match[KEY_DEFINITION] || "No definition available."}</p>

        <div class="translation-row">
        🇬🇧 ${match[KEY_ENGLISH] || "Translation pending..."}
        </div>
        </div>
        `).join('');
        resultsGrid.innerHTML = html;
    } else {
        resultsGrid.innerHTML = `<p style="text-align:center; color:#777; margin-top:20px;">No matches found for this word.</p>`;
    }
};

// Event Listener for Typing
searchInput.addEventListener('input', () => searchWords(searchInput.value));

// Init Load
loadDictionary();


// --- MODAL LOGIC (Controls the Pop-up) ---
const modal = document.getElementById("reportModal");

if(modal) {
    const span = document.getElementsByClassName("close-btn")[0];
    const wordInput = document.getElementById("reportWord");
    const displayWord = document.getElementById("displayWord");

    // Function to Open Modal (Available globally)
    window.openReportModal = (word) => {
        modal.style.display = "block";
        if(wordInput) wordInput.value = word;       // Fills hidden input
        if(displayWord) displayWord.innerText = word; // Updates visual text
    }

    // Close on X click
    span.onclick = () => { modal.style.display = "none"; }

    // Close on Outside click
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    }
}
