import express from 'express';
import * as tipoControllers from '../controllers/tipoControllers.js';

const router = express.Router();

router.get('/', tipoControllers.listarTipos);
router.get('/:codigo', tipoControllers.buscarTipoPorCodigo);
router.post('/', tipoControllers.criarTipo);
router.put('/:codigo', tipoControllers.atualizarTipo);
router.delete('/:codigo', tipoControllers.deletarTipo);

export default router;
