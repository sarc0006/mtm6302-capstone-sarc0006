document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemon-list');
    const moreBtn = document.getElementById('more-btn');
    const pokemonDetails = document.getElementById('pokemon-details');
    let offset = 0;
    let caughtPokemon = [];

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // Add an event listener to the search button
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm !== '') {
            searchPokemon(searchTerm);
        } else {
            // If the search term is empty, display all Pokemon
            fetchPokemon();
        }
    });

    // Function to search for Pokemon
    async function searchPokemon(searchTerm) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
            const data = await response.json();

            // Display the found Pokemon
            displayPokemon([{ name: data.name, url: data.species.url }]);
        } catch (error) {
            // If the Pokemon is not found, display an error message
            console.error('Pokemon not found');
            pokemonList.innerHTML = '<p>Pokemon not found.</p>';
        }
    }
    
    
    // Fetch initial Pokemon data
    fetchPokemon();

    // Fetch more Pokemon when the "More" button is clicked
    moreBtn.addEventListener('click', () => {
        offset += 20;
        fetchPokemon();
    });

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

    // Fetch Pokemon from PokeAPI
    async function fetchPokemon() {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
        const data = await response.json();
        displayPokemon(data.results);
    }

    
       // Function to display Pokemon in the grid with correct numbering, types, and background color
    function displayPokemon(pokemonArray) {
        pokemonArray.forEach((pokemon, index) => {
            const pokemonCard = document.createElement('div');
            pokemonCard.classList.add('pokemon-card');
            pokemonCard.dataset.id = (offset + index + 1).toString(); // Calculate the correct numbering

            const img = document.createElement('img');
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonCard.dataset.id}.png`;
            img.alt = pokemon.name;

            const name = document.createElement('p');
            name.textContent = capitalizeFirstLetter(pokemon.name);

            // Create a span for numbering
            const number = document.createElement('span');
            number.textContent = pokemonCard.dataset.id;
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
                return '#78C850'; // Green
            case 'fire':
                return '#F08030'; // Orange
            case 'water':
                return '#6890F0'; // Blue
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

    const pokemonModal = document.getElementById('pokemon-modal');
    const closeButton = document.querySelector('.close');

    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');

    // Function to display more information about a Pokemon in a modal
    async function displayPokemonDetails(pokemonId) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const data = await response.json();

            // Clear previous details
            modalContent.innerHTML = '';

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

            // Add a "Close" button to close the modal
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => {
                modalContainer.style.display = 'none';
            });

            modalContent.appendChild(largerImage);
            modalContent.appendChild(details);
            modalContent.appendChild(closeButton);
            modalContainer.style.display = 'block';
        } catch (error) {
            console.error('Error fetching Pokemon details:', error);
        }
    }

    // Event listener for Pokemon cards
    pokemonList.addEventListener('click', (event) => {
        const pokemonCard = event.target.closest('.pokemon-card');
        if (pokemonCard) {
            const pokemonId = pokemonCard.dataset.id;
            displayPokemonDetails(pokemonId);
        }
    });

    // Close the modal when clicking the close button or outside the modal
    closeButton.addEventListener('click', () => {
        pokemonModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === pokemonModal) {
            pokemonModal.style.display = 'none';
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

    // Display Pokemon list
    function displayPokemonList() {
        pokemonDetails.style.display = 'none';
        moreBtn.style.display = 'block';
        pokemonList.style.display = 'grid';

        fetchPokemon();
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

