import express from 'express';
import pokemonRoutes from './pokemonRoutes.js';
import tipoRoutes from './tipoRoutes.js';

const router = express.Router();

router.use('/pokemons', pokemonRoutes);
router.use('/tipos', tipoRoutes);

export default router;