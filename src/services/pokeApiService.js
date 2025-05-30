import axios from 'axios';

export async function getPokemonMedia(nome) {
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nome.toLowerCase()}`);
    const id = response.data.id;

    const image = response.data.sprites.other['official-artwork'].front_default;
    const thumbnail = response.data.sprites.front_default;
    const gif = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

    return { image, thumbnail, gif };
  } catch (error) {
    console.error('Erro ao buscar imagem na PokeAPI:', error.message);
    return { image: null, thumbnail: null, gif: null };
  }
}