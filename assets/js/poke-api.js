const pokeApi = {}

function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types

    pokemon.types = types
    pokemon.type = type

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default

    return pokemon
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon)
}

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails)
}


pokeApi.getPokemonById = (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;

    return fetch(url)
        .then((response) => response.json())
        .then((pokeDetail) => {
            // 1. Reaproveita sua função original para montar o básico
            const pokemon = convertPokeApiDetailToPokemon(pokeDetail);

            // 2. Mapeia altura (decímetros para metros) e peso (hectogramas para kg)
            pokemon.height = (pokeDetail.height / 10).toFixed(2);
            pokemon.weight = (pokeDetail.weight / 10).toFixed(1);

            // 3. Mapeia as habilidades
            pokemon.abilities = pokeDetail.abilities.map((a) => a.ability.name).join(', ');

            // 4. Faz uma segunda requisição para pegar os dados de espécie e cruzamento
            return fetch(pokeDetail.species.url)
                .then((response) => response.json())
                .then((speciesDetail) => {
                    // Pega o nome da espécie em inglês (ex: remove a palavra " Pokémon" de "Seed Pokémon")
                    const genera = speciesDetail.genera.find((g) => g.language.name === 'en');
                    pokemon.species = genera ? genera.genus.replace(' Pokémon', '') : '';

                    // Mapeia os Grupos de Ovos
                    pokemon.eggGroups = speciesDetail.egg_groups.map((e) => e.name).join(', ');

                    // Calcula o gênero (a API retorna a chance de ser fêmea em oitavos. -1 é sem gênero)
                    if (speciesDetail.gender_rate === -1) {
                        pokemon.genderMale = -1; // Usado como flag para "Genderless"
                    } else {
                        pokemon.genderFemale = (speciesDetail.gender_rate / 8) * 100;
                        pokemon.genderMale = 100 - pokemon.genderFemale;
                    }

                    return pokemon;
                });
        });
}
