// 1. Seleção de elementos (retornarão null caso não existam na página atual)
const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
const pokemonDisplay = document.getElementById('pokemonDisplay');

const limit = 10;
let offset = 0;
const maxRecords = 151;

// ==========================================
// LÓGICA DA PÁGINA INICIAL (index.html)
// ==========================================
function loadPokemonItens(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    const newHtml = pokemons.map((pokemon) => `
            <a href="pokemon.html?id=${pokemon.number}">
                <li class="pokemon ${pokemon.type}">
                    <span class="number">#${pokemon.number}</span>
                    <span class="name">${pokemon.name}</span>
                    <div class="detail">
                        <ol class="types">
                            ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                        </ol>
                        <img src="${pokemon.photo}" alt="${pokemon.name}" />
                    </div>
                </li>
            </a>
        `).join('')
    pokemonList.innerHTML += newHtml
  })
}

// Só executa se estiver na index.html (onde o pokemonList existe)
if (pokemonList) {
  loadPokemonItens(offset, limit);

  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      offset += limit;
      const qtdRecordNextPage = offset + limit;

      if (qtdRecordNextPage >= maxRecords) {
        const newLimit = maxRecords - offset;
        loadPokemonItens(offset, newLimit);
        loadMoreButton.parentElement.removeChild(loadMoreButton);
      } else {
        loadPokemonItens(offset, limit);
      }
    });
  }
}

// ==========================================
// LÓGICA DO DISPLAY (pokemon.html)
// ==========================================
function loadPokemonDisplay() {
  const urlParams = new URLSearchParams(window.location.search);
  const pokemonId = urlParams.get('id');

  if (pokemonId) {
    pokeApi.getPokemonById(pokemonId).then((pokemon) => {
      document.title = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) + " | Pokédex";

      const pokemonNumber = String(pokemon.number).padStart(3, '0');
      const pokemonHtml = `
      <div class="pokemon-container ${pokemon.type}">

          <div class="pokemonDetailsTopSection">
            <a href="index.html">
              <button>
                <i class="bi bi-arrow-left"></i>
              </button>
            </a>
          </div>

          <div class="nameBesideId">
            <div class="nameAndType">
              <h1>${pokemon.name}</h1>
              <ol class="types">
                ${pokemon.types.map((type) => `
                <li class="type ${type}">${type}</li>
                `).join('')}
              </ol>
            </div>

            <div class="id">
              <h1>#${pokemonNumber}</h1>
            </div>

          </div>

          <img src="${pokemon.photo}" alt="${pokemon.name}" />

        </div>
`;
      pokemonDisplay.innerHTML = pokemonHtml;
    });
  } else {
    pokemonDisplay.innerHTML = `<p>Pokémon não encontrado.</p>`;
  }
}

// Só executa se estiver na pokemon.html (onde o pokemonDisplay existe)
if (pokemonDisplay) {
  loadPokemonDisplay();
}