document.addEventListener('DOMContentLoaded', () => {
    const inventoryList = document.getElementById('inventory-list');
    let caughtPokemon = [];

    // Load caught Pokemon from local storage
    function loadCaughtPokemon() {
        const caughtPokemonStr = localStorage.getItem('caughtPokemon');
        if (caughtPokemonStr) {
            caughtPokemon = JSON.parse(caughtPokemonStr);
        }
    }
    
// Display caught Pokemon in the inventory
async function displayInventory() {
    inventoryList.innerHTML = '';

    for (const pokemonId of caughtPokemon) {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card', 'caught'); // Add 'pokemon-card' class and 'caught' class
        pokemonCard.dataset.id = pokemonId;

        // Fetch details for each caught Pokemon
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data = await response.json();

        // Create elements similar to main page
        const img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
        img.alt = data.name;

        const name = document.createElement('p');
        name.textContent = capitalizeFirstLetter(data.name);

        // Create release button
        const releaseButton = document.createElement('button');
        releaseButton.textContent = 'Release';
        releaseButton.classList.add('release-button');

        // Add event listener to release button
        releaseButton.addEventListener('click', () => releasePokemon(pokemonId));

        // Append elements to the Pokemon card
        pokemonCard.appendChild(img);
        pokemonCard.appendChild(name);
        pokemonCard.appendChild(releaseButton);

        inventoryList.appendChild(pokemonCard);
    }
}

// Function to release a Pokemon
function releasePokemon(pokemonId) {
    // Implement the logic to release the Pokemon, e.g., remove it from the caughtPokemon array and update local storage
    // After releasing, call displayInventory to update the display
    const index = caughtPokemon.indexOf(pokemonId);
    if (index !== -1) {
        caughtPokemon.splice(index, 1);
        localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
        displayInventory();
    }
}


    // Load caught Pokemon and display inventory when the page loads
    loadCaughtPokemon();
    displayInventory();

    // Capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
const backToMainButton = document.getElementById('backToMain');

    // Event listener for the back button
    backToMainButton.addEventListener('click', () => {
        // Redirect to the main page
        window.location.href = 'index.html';
    });

    const inventorySearchInput = document.getElementById('inventorySearchInput');
    const inventorySearchButton = document.getElementById('inventorySearchButton');

    // Event listener for the search button in the inventory page
    inventorySearchButton.addEventListener('click', () => {
        const searchTerm = inventorySearchInput.value;
        filterInventoryPokemon(searchTerm);
    });

    // Event listener for the search input in the inventory page
    inventorySearchInput.addEventListener('input', () => {
        const searchTerm = inventorySearchInput.value;
        filterInventoryPokemon(searchTerm);
    });

    // Function to filter Pokémon in the inventory page based on the search query
    function filterInventoryPokemon(query) {
        const inventoryPokemonCards = document.querySelectorAll('.inventory-pokemon-card');
        inventoryPokemonCards.forEach(pokemonCard => {
            const pokemonName = pokemonCard.querySelector('p').textContent.toLowerCase();
            const displayStyle = pokemonName.includes(query.toLowerCase()) ? 'block' : 'none';
            pokemonCard.style.display = displayStyle;
        });
    }

    // Event listener for the "Back" button in the inventory page
const inventoryBackButton = document.getElementById('inventory-back-btn');
inventoryBackButton.addEventListener('click', () => {
    // Send a message to notify the main page that the user is going back
    parent.postMessage({ action: 'back', caughtPokemon }, '*');
});

// Event listener for the message from the main page
window.addEventListener('message', (event) => {
    const data = event.data;
    if (data) {
        if (data.action === 'back') {
            // Handle the back action
            handleBackAction(data.releasedPokemon);
        } else if (data.releasedPokemon) {
            releasedPokemon = data.releasedPokemon;
            // Update the display for released Pokemon
            displayInventory();
        } else if (data.caughtPokemon) {
            caughtPokemon = data.caughtPokemon;

            // Update catch/release buttons in the inventory page
            updateCatchReleaseButtons();
        }
    }
});

// Function to handle the back action
function handleBackAction(releasedPokemonFromMainPage) {
    // Update releasedPokemon array with data from the main page
    releasedPokemon = releasedPokemonFromMainPage || [];

    // Redirect to the main page
    window.location.href = 'index.html';
}



