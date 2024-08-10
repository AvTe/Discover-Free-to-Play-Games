const apiKey = '348c6700ccmshfd1fce3ae71368dp1be489jsn6ede2c9e4daa';
const apiHost = 'free-to-play-games-database.p.rapidapi.com';

const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
    }
};

let gamesList = [];
let currentPage = 0;
const itemsPerPage = 8;

// Fetch and render all games
async function fetchAllGames() {
    const url = 'https://free-to-play-games-database.p.rapidapi.com/api/games';
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        gamesList = await response.json();
        renderGames();
    } catch (error) {
        console.error('Error fetching all games:', error);
        document.getElementById('gamesList').innerHTML = '<p>Error fetching games. Please try again.</p>';
        document.getElementById('loadMoreButton').style.display = 'none';
    }
}

// Render games in the DOM
function renderGames() {
    if (!Array.isArray(gamesList)) {
        console.error('gamesList is not an array:', gamesList);
        return;
    }
    
    const gamesContainer = document.getElementById('gamesList');
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const gamesToRender = gamesList.slice(startIndex, endIndex);

    if (gamesToRender.length === 0 && currentPage === 0) {
        gamesContainer.innerHTML = '<p>No games found.</p>';
        document.getElementById('loadMoreButton').style.display = 'none';
        return;
    } else if (gamesToRender.length === 0) {
        document.getElementById('loadMoreButton').style.display = 'none';
        return;
    }

    gamesToRender.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <img src="${game.thumbnail}" alt="${game.title} thumbnail">
            <div class="info">
                <h3>${game.title}</h3>
                <a href="${game.game_url}" target="_blank">Play</a>
            </div>
            <span class="free-badge">FREE</span>
        `;
        gamesContainer.appendChild(gameCard);
    });

    currentPage++;
    if (currentPage * itemsPerPage >= gamesList.length) {
        document.getElementById('loadMoreButton').style.display = 'none';
    } else {
        document.getElementById('loadMoreButton').style.display = 'block';
    }
}

// Fetch games by category
async function fetchGamesByCategory(category) {
    const url = `https://free-to-play-games-database.p.rapidapi.com/api/games?category=${encodeURIComponent(category)}`;
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        gamesList = await response.json();
        if (!Array.isArray(gamesList)) {
            throw new TypeError('The API response is not an array.');
        }
        currentPage = 0;
        document.getElementById('gamesList').innerHTML = '';
        renderGames();
    } catch (error) {
        console.error('Error fetching games by category:', error);
        document.getElementById('gamesList').innerHTML = '<p>Error fetching games. Please try again.</p>';
        document.getElementById('loadMoreButton').style.display = 'none';
    }
}

// Event listener for search
document.getElementById('searchButton').addEventListener('click', () => {
    const category = document.getElementById('categoryInput').value.trim();
    if (category) {
        fetchGamesByCategory(category);
    } else {
        alert('Please enter a category or tag to search.');
    }
});

// Event listener for load more button
document.getElementById('loadMoreButton').addEventListener('click', renderGames);

// Load initial games on page load
window.onload = fetchAllGames;

