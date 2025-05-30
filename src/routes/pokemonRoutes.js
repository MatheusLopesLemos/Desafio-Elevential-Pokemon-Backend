import express from 'express';
import * as pokemonControllers from '../controllers/pokemonControllers.js';

const router = express.Router();

router.get('/', pokemonControllers.listarPokemons);
router.get('/:codigo', pokemonControllers.buscarPokemonPorCodigo);
router.post('/', pokemonControllers.criarPokemon);
router.put('/:codigo', pokemonControllers.atualizarPokemon);
router.delete('/:codigo', pokemonControllers.deletarPokemon);

export default router;