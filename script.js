document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemon-list');
    const moreBtn = document.getElementById('more-btn');
    const pokemonDetails = document.getElementById('pokemon-details');
    let offset = 0;
    let caughtPokemon = [];

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('search-btn');

    const logo = document.getElementById('logo');
    const headerImage = document.getElementById('headerImage');
    

    const errorMessageContainer = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const errorCloseBtn = document.getElementById('error-close-btn');

    // Function to display the error message
    function displayErrorMessage(message) {
        errorText.textContent = message;
        errorMessageContainer.style.display = 'block';
        sessionStorage.setItem('hasError', 'true'); // Set the flag in sessionStorage
    }

    // Function to hide the error message
    function hideErrorMessage() {
        errorMessageContainer.style.display = 'none';
    }

    // Close button click event listener
    errorCloseBtn.addEventListener('click', () => {
        hideErrorMessage();
    });

    
    
    

    
    // Set the font for all elements
    document.body.style.fontFamily = 'Comic Sans MS';

    // Clicking on logo or header image should refresh the page
    logo.addEventListener('click', () => window.location.reload());
    headerImage.addEventListener('click', () => window.location.reload());


    // Function to filter Pokemon based on the search query
    async function filterPokemon(query) {
        try {
            // Fetch Pokemon details based on the search query
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
            const data = await response.json();

            // Display the found Pokemon
            displayPokemonDetails(data.id);

            // Clear previous error message, if any
            clearErrorMessage();
        } catch (error) {
            console.error('Error fetching Pokemon details:', error);

            // Display an error message
            displayErrorMessage('No Pokemon found with that name or ID');
        }
    }

    // Function to display an error message
    function displayErrorMessage(message) {
        const errorMessageContainer = document.getElementById('error-message');
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = 'block';
        // Append the close button to the error message container
        errorMessageContainer.appendChild(errorCloseButton);
    }

    // Function to clear the error message
    function clearErrorMessage() {
        const errorMessageContainer = document.getElementById('error-message');
        errorMessageContainer.textContent = '';
        errorMessageContainer.style.display = 'none';
    }

    // Event listener for the search button
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput.value;
        filterPokemon(searchTerm);
    });

    // Load caught Pokemon from local storage
    loadCaughtPokemon();

    // Load released Pokemon from local storage
    function loadReleasedPokemon() {
        const releasedPokemonStr = localStorage.getItem('releasedPokemon');
        if (releasedPokemonStr) {
            releasedPokemon = JSON.parse(releasedPokemonStr);
        }
    }

    // Fetch Pokemon details when a Pokemon is clicked
    pokemonList.addEventListener('click', (e) => {
        const pokemonCard = e.target.closest('.pokemon-card');
        if (pokemonCard) {
            const pokemonId = pokemonCard.dataset.id;
            fetchPokemonDetails(pokemonId);
        }
    });

    // Display caught Pokemon details
    pokemonDetails.addEventListener('click', (e) => {
        const backBtn = e.target.closest('#back-btn');
        if (backBtn) {
            displayPokemonList();
        }

        const caughtBtn = e.target.closest('#caught-btn');
        if (caughtBtn) {
            const pokemonId = caughtBtn.dataset.id;
            releasePokemon(pokemonId);
            displayPokemonList();
        }
    });

    // Function to fetch Pokemon from PokeAPI
async function fetchPokemon(offset = 0) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
        const data = await response.json();

        // Check if there is any data returned
        if (!data.results || data.results.length === 0) {
            console.error('No Pokemon data found');
            return;
        }

        const startNumber = offset + 1;
        displayPokemon(data.results, startNumber);
        appendMoreButton();
        updateCatchReleaseButtons();
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
    }
}

    // Function to append the "More" button
function appendMoreButton() {
    const pokedexContainer = document.querySelector('.pokedex-container');
    const moreBtnContainer = document.getElementById('more-btn-container');

    // Check if there are already Pokemon cards displayed
    const existingPokemonCards = document.querySelectorAll('.pokemon-card');

    if (existingPokemonCards.length > 0) {
        // Move the "More" button after the last Pokemon card
        const lastPokemonCard = existingPokemonCards[existingPokemonCards.length - 1];
        lastPokemonCard.parentNode.insertBefore(moreBtn, lastPokemonCard.nextSibling);
    } else {
        // If no Pokemon cards are present, append the "More" button to the container
        moreBtnContainer.appendChild(moreBtn);
    }
}

       // Function to display Pokemon in the grid with correct numbering, types, and background color
function displayPokemon(pokemonArray, startNumber) {
    const pokemonList = document.getElementById('pokemon-list');

    pokemonArray.forEach((pokemon, index) => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');
        const pokemonNumber = startNumber + index; // Calculate the correct Pokemon number

        pokemonCard.dataset.id = pokemonNumber.toString();

        const img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNumber}.png`; // Use the correct formula to get the image
        img.alt = pokemon.name;

        const name = document.createElement('p');
        name.textContent = capitalizeFirstLetter(pokemon.name);

        // Create a span for numbering
        const number = document.createElement('span');
        number.classList.add('pokemon-number');

        // Create a div for types
        const types = document.createElement('div');
        types.classList.add('pokemon-types');

        // Fetch detailed information about the Pokémon to get its types and dominant type
        fetch(pokemon.url)
            .then(response => response.json())
            .then(data => {
                data.types.forEach(typeInfo => {
                    const type = document.createElement('span');
                    type.textContent = typeInfo.type.name;
                    type.classList.add('pokemon-type');
                    types.appendChild(type);
                });

                // Determine the dominant type (use the first type for simplicity)
                const dominantType = data.types[0].type.name;

                // Set the background color based on the dominant type
                pokemonCard.style.backgroundColor = getTypeColor(dominantType);
            })
            .catch(error => console.error('Error fetching Pokemon details:', error));

        // Append the elements to the Pokemon card
        pokemonCard.appendChild(img);
        pokemonCard.appendChild(name);

        // Update this line to set the correct Pokemon number
        number.textContent = pokemonNumber;

        pokemonCard.appendChild(number);
        pokemonCard.appendChild(types);

        if (caughtPokemon.includes(pokemonCard.dataset.id)) {
            pokemonCard.classList.add('caught');
        }

        pokemonList.appendChild(pokemonCard);
    });
}


    // Function to get color based on Pokemon type
    function getTypeColor(type) {
        switch (type) {
            case 'grass':
                return '#D5EFC8'; // Green
            case 'fire':
                return '#F8B284'; // Orange
            case 'water':
                return '#D0DEF9'; // Blue
            case 'normal':
                return '#ABABAB'; // Grey
            // Add more cases for other types as needed
            default:
                return '#A8A878'; // Default color
        }
    }
    
    // Fetch Pokemon details from PokeAPI
    async function fetchPokemonDetails(pokemonId) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data = await response.json();
        displayPokemonDetails(data);
    }

    const closeButton = document.querySelector('.close');

    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');

    // Function to display more information about a Pokemon in a modal
    async function displayPokemonDetails(pokemonId) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const data = await response.json();
            
            // Add a "Release" button to release the Pokemon
            const releaseButton = document.createElement('button');
            releaseButton.textContent = 'Release';
            releaseButton.id = 'release-btn';
            releaseButton.dataset.id = pokemonId;
            releaseButton.classList.add('modal-button'); // Add a class for styling
    
            releaseButton.addEventListener('click', () => {
                toggleCaughtStatus(pokemonId);
            });
    
            // Add a "Close" button to close the modal
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '&times;'; // Use the 'x' character (multiplication symbol) for close button
            closeButton.id = 'close-btn';
            closeButton.classList.add('modal-button'); // Add a class for styling
            closeButton.addEventListener('click', () => {
                modalContainer.style.display = 'none';
            });
    
            // Check if the Pokemon is already caught
            const isCaught = caughtPokemon.includes(pokemonId);
    
            // Add a "Catch" or "Release" button based on whether the Pokemon is already caught
            const actionButton = isCaught ? releaseButton : createCatchButton(pokemonId);
    
            // Clear previous details
            modalContent.innerHTML = '';
    
            // Set modal background color based on the first Pokemon type
            const modalType = data.types.length > 0 ? data.types[0].type.name : 'default';
            const backgroundColor = getTypeColor(modalType);
            modalContent.style.backgroundColor = backgroundColor;
    
            // Display larger image
            const largerImage = document.createElement('img');
            largerImage.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
            largerImage.alt = data.name;
    
            // Display additional details
            const details = document.createElement('div');
            details.classList.add('pokemon-details-info');
            details.innerHTML = `
                <p>Name: ${capitalizeFirstLetter(data.name)}</p>
                <p>Height: ${data.height / 10} m</p>
                <p>Weight: ${data.weight / 10} kg</p>
                <p>Base Experience: ${data.base_experience}</p>
            `;
            // Set modal border color to black
            modalContent.style.border = '4px solid black';

            // Set modal rounded corners
            modalContent.style.borderRadius = '15px';

            modalContent.appendChild(largerImage);
            modalContent.appendChild(details);
            modalContent.appendChild(actionButton);

        // Add spacing between the "Catch/Release" button and the "Close" button
            modalContent.appendChild(document.createElement('br')); // Add a line break for spacing
            modalContent.appendChild(closeButton);

        modalContainer.style.display = 'flex';
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
    }
}

// Function to create the "Catch" button
function createCatchButton(pokemonId) {
    const catchButton = document.createElement('button');
    catchButton.innerHTML = 'Catch';
    catchButton.id = 'catch-btn';
    catchButton.dataset.id = pokemonId;
    catchButton.classList.add('modal-button'); // Add a class for styling

    catchButton.addEventListener('click', () => {
        toggleCaughtStatus(pokemonId);
    });

    return catchButton;
}

    // Function to toggle the caught status of a Pokemon
function toggleCaughtStatus(pokemonId) {
    const index = caughtPokemon.indexOf(pokemonId);
    if (index === -1) {
        caughtPokemon.push(pokemonId); // Pokemon is not caught, add to the list
    } else {
        caughtPokemon.splice(index, 1); // Pokemon is caught, remove from the list
    }

    // Check if the Pokemon is already released
    const isReleased = releasedPokemon.includes(pokemonId);

    // Save the updated caught Pokemon list
    saveCaughtPokemon();

    // Notify the inventory page about the updated caught and released Pokemon arrays
    parent.postMessage({ action: 'updateCaughtAndReleasedPokemon', caughtPokemon, releasedPokemon }, '*');

    // Update the modal content to reflect the new caught status
    displayPokemonDetails(pokemonId);

    // Update catch/release buttons in the main page
    updateCatchReleaseButtons(isReleased);
}
    
        // Event listener for Pokemon cards
    pokemonList.addEventListener('click', (event) => {
        const pokemonCard = event.target.closest('.pokemon-card');
        if (pokemonCard) {
            const pokemonId = pokemonCard.dataset.id;
            displayPokemonDetails(pokemonId);
        }
    });

    // Event listener for the "More" button
    moreBtn.addEventListener('click', () => {
        offset += 20;
        fetchPokemon(offset);
    });

    // Fetch initial Pokemon data
    fetchPokemon();


    // Event listener for the "Catch" or "Release" button in the modal
    modalContent.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-id]');

        if (button) {
            const pokemonId = button.dataset.id;

            // Toggle the caught status
            toggleCaughtStatus(pokemonId);

            // Update catch/release buttons in the main page
            updateCatchReleaseButtons();
        }
    });

// Add console.log statements for debugging
modalContent.addEventListener('click', (event) => {
    console.log('Modal Content Clicked');
    const button = event.target.closest('button[data-id]');
    
    if (button) {
        console.log('Button Clicked');
        const pokemonId = button.dataset.id;
        toggleCaughtStatus(pokemonId);
    }
});

// ...

function toggleCaughtStatus(pokemonId) {
    console.log('Toggle Caught Status');
    const index = caughtPokemon.indexOf(pokemonId);
    if (index === -1) {
        console.log('Pokemon Caught');
        caughtPokemon.push(pokemonId);
    } else {
        console.log('Pokemon Released');
        caughtPokemon.splice(index, 1);
    }

    saveCaughtPokemon();
    displayPokemonDetails(pokemonId);
}


    // Close the modal when clicking the close button or outside the modal
    closeButton.addEventListener('click', () => {
        modalContainer.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modalContainer) {
            modalContainer.style.display = 'none';
        }
    });

    // Release caught Pokemon
    function releasePokemon(pokemonId) {
        const index = caughtPokemon.indexOf(pokemonId);
        if (index !== -1) {
            caughtPokemon.splice(index, 1);
            saveCaughtPokemon();
        }
    }

// Function to update catch/release buttons for Pokemon already caught in the inventory
function updateCatchReleaseButtons(isReleased = false) {
    const pokemonCards = document.querySelectorAll('.pokemon-card');
    pokemonCards.forEach((pokemonCard) => {
        const pokemonId = pokemonCard.dataset.id;
        const catchButton = pokemonCard.querySelector('#catch-btn');
        const releaseButton = pokemonCard.querySelector('#release-btn');

        // Check if the Pokemon is caught based on local storage
        const isCaught = caughtPokemon.includes(pokemonId);

        if (isCaught && !releasedPokemon.includes(pokemonId)) {
            releaseButton.style.display = 'inline-block';
            catchButton.style.display = 'none';
            releaseButton.textContent = 'Release'; // Set the text content to "Release"
        } else {
            releaseButton.style.display = 'none';
            catchButton.style.display = 'inline-block';
        }

        // If the Pokémon is released in the inventory, keep the button released in the main page
        if (isReleased && releasedPokemon.includes(pokemonId)) {
            releaseButton.style.display = 'inline-block';
            catchButton.style.display = 'none';
            releaseButton.textContent = 'Released'; // Set the text content to "Released"
            releaseButton.disabled = true; // Optionally disable the released button
        }
    });
}

// Display Pokemon list
function displayPokemonList() {
    pokemonDetails.style.display = 'none';
    moreBtn.style.display = 'block';
    pokemonList.style.display = 'grid';

    // Fetch more Pokemon
    fetchPokemon();

    // Load caught Pokemon from local storage
    loadCaughtPokemon();

    // Load released Pokemon from local storage
    loadReleasedPokemon();

    // Update catch/release buttons for Pokemon already caught in the inventory
    updateCatchReleaseButtons();
}
    // Save caught Pokemon to local storage
    function saveCaughtPokemon() {
        localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
    }

    // Capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Load caught Pokemon from local storage
    function loadCaughtPokemon() {
        const caughtPokemonStr = localStorage.getItem('caughtPokemon');
        if (caughtPokemonStr) {
            caughtPokemon = JSON.parse(caughtPokemonStr);
        }
    }

    loadCaughtPokemon();
});

    // Save released Pokemon to local storage
    function saveReleasedPokemon() {
        localStorage.setItem('releasedPokemon', JSON.stringify(releasedPokemon));
    }
    
    // Event listener for the Pokemon inventory button
    const inventoryButton = document.getElementById('inventoryButton');
    inventoryButton.addEventListener('click', () => {
        window.location.href = 'inventory.html';
    });

    // Initialize an array to keep track of released Pokemon
let releasedPokemon = [];

// Event listener for the message from the inventory page
window.addEventListener('message', (event) => {
    const data = event.data;
    if (data) {
        if (data.action === 'back') {
            console.log('Received back action from inventory page');
            // Handle the back action
            handleBackAction();
        } else if (data.releasedPokemon) {
            releasedPokemon = data.releasedPokemon;
            console.log('Received releasedPokemon from inventory page:', releasedPokemon);
        } else if (data.caughtPokemon) {
            caughtPokemon = data.caughtPokemon;
            console.log('Received caughtPokemon from inventory page:', caughtPokemon);

            // Update catch/release buttons in the main page
            updateCatchReleaseButtons();
        }
    }
});

// Function to handle the back action
function handleBackAction() {
    // Redirect to the main page
    window.location.href = 'index.html';

    // Update the catch/release buttons with isReleased set to false
    updateCatchReleaseButtons(false);
}


 // Event listener for the "Back" button
 const inventoryBackButton = document.getElementById('inventory-back-btn');
 inventoryBackButton.addEventListener('click', () => {
     // Send a message to notify the main page that the user is going back
     parent.postMessage({ action: 'back', caughtPokemon }, '*');
 });