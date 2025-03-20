const apiKey = '348c6700ccmshfd1fce3ae71368dp1be489jsn6ede2c9e4daa';
const apiHost = 'free-to-play-games-database.p.rapidapi.com';

const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
    }
};

// App state
let gamesList = [];
let filteredGames = [];
let currentPage = 0;
const itemsPerPage = 8;
let isLoading = false;
let currentCategory = '';

// DOM Elements
const gamesContainer = document.getElementById('gamesList');
const loadMoreButton = document.getElementById('loadMoreButton');
const searchButton = document.getElementById('searchButton');
const categoryInput = document.getElementById('categoryInput');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const loader = document.getElementById('loader');

// Theme Management
function initTheme() {
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Add animation to all game cards when theme changes
    document.querySelectorAll('.game-card').forEach(card => {
        card.classList.add('theme-transition');
        setTimeout(() => card.classList.remove('theme-transition'), 500);
    });
}

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// API Functions
async function fetchAllGames() {
    if (isLoading) return;
    
    showLoader();
    
    const url = 'https://free-to-play-games-database.p.rapidapi.com/api/games';
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        gamesList = await response.json();
        filteredGames = [...gamesList];
        
        hideLoader();
        renderGames(true);
    } catch (error) {
        console.error('Error fetching all games:', error);
        gamesContainer.innerHTML = '<p class="no-results">Error fetching games. Please try again.</p>';
        loadMoreButton.classList.add('hidden');
        hideLoader();
    }
}

async function fetchGamesByCategory(category) {
    if (isLoading) return;
    
    showLoader();
    currentCategory = category;
    
    const url = `https://free-to-play-games-database.p.rapidapi.com/api/games?category=${encodeURIComponent(category)}`;
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        filteredGames = await response.json();
        
        if (!Array.isArray(filteredGames)) {
            throw new TypeError('The API response is not an array.');
        }
        
        currentPage = 0;
        gamesContainer.innerHTML = '';
        
        hideLoader();
        
        if (filteredGames.length === 0) {
            gamesContainer.innerHTML = `<p class="no-results">No games found for "${category}". Try another category.</p>`;
            loadMoreButton.classList.add('hidden');
        } else {
            renderGames(true);
        }
    } catch (error) {
        console.error('Error fetching games by category:', error);
        gamesContainer.innerHTML = '<p class="no-results">Error fetching games. Please try again.</p>';
        loadMoreButton.classList.add('hidden');
        hideLoader();
    }
}

// UI Functions
function renderGames(isNewSearch = false) {
    if (!Array.isArray(filteredGames)) {
        console.error('filteredGames is not an array:', filteredGames);
        return;
    }
    
    if (isNewSearch) {
        gamesContainer.innerHTML = '';
        currentPage = 0;
    }
    
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const gamesToRender = filteredGames.slice(startIndex, endIndex);

    if (gamesToRender.length === 0 && currentPage === 0) {
        gamesContainer.innerHTML = '<p class="no-results">No games found.</p>';
        loadMoreButton.classList.add('hidden');
        return;
    } else if (gamesToRender.length === 0) {
        loadMoreButton.classList.add('hidden');
        return;
    }

    gamesToRender.forEach((game, index) => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.style.animationDelay = `${0.1 * index}s`;
        
        gameCard.innerHTML = `
            <img src="${game.thumbnail}" alt="${game.title} thumbnail">
            <div class="info">
                <h3>${game.title}</h3>
                <a href="${game.game_url}" target="_blank" class="play-btn">Play</a>
            </div>
            <span class="free-badge">FREE</span>
        `;
        
        gamesContainer.appendChild(gameCard);
    });

    currentPage++;
    
    if (currentPage * itemsPerPage >= filteredGames.length) {
        loadMoreButton.classList.add('hidden');
    } else {
        loadMoreButton.classList.remove('hidden');
    }
}

function showLoader() {
    isLoading = true;
    loader.classList.add('visible');
    loadMoreButton.classList.add('hidden');
}

function hideLoader() {
    isLoading = false;
    loader.classList.remove('visible');
}

// Handle "Enter" key in search input
categoryInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchGames();
    }
});

// Event Handlers
function searchGames() {
    const category = categoryInput.value.trim();
    if (category) {
        fetchGamesByCategory(category);
    } else {
        alert('Please enter a category or tag to search.');
    }
}

// Init Function
function initApp() {
    // Create and add theme toggle button if it doesn't exist
    if (!document.getElementById('themeToggle')) {
        const themeButton = document.createElement('button');
        themeButton.id = 'themeToggle';
        themeButton.className = 'theme-toggle';
        themeButton.innerHTML = '<i id="themeIcon" class="fas fa-sun"></i>';
        document.body.appendChild(themeButton);
        
        themeButton.addEventListener('click', toggleTheme);
    }
    
    // Create loader if it doesn't exist
    if (!document.getElementById('loader')) {
        const loaderElement = document.createElement('div');
        loaderElement.id = 'loader';
        loaderElement.className = 'loader';
        document.querySelector('.container').insertBefore(loaderElement, gamesContainer);
    }
    
    // Add Font Awesome if it doesn't exist
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
    
    // Initialize theme
    initTheme();
    
    // Event listeners
    searchButton.addEventListener('click', searchGames);
    
    loadMoreButton.addEventListener('click', () => {
        renderGames(false);
    });
    
    // Initial load
    fetchAllGames();
}

// Initialize app when DOM is fully loaded
window.addEventListener('DOMContentLoaded', initApp);
