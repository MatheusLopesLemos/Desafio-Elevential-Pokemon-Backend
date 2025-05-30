import prisma from '../config/dbConfig.js';

export const listarTipos = async (req, res) => {
  try {
    const tipos = await prisma.tipo.findMany();
    res.json(tipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar tipos' });
  }
};

export const buscarTipoPorCodigo = async (req, res) => {
  const codigo = Number(req.params.codigo);
  try {
    const tipo = await prisma.tipo.findUnique({ where: { codigo } });
    if (!tipo) {
      return res.status(404).json({ message: 'Tipo não encontrado' });
    }
    res.json(tipo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar tipo' });
  }
};

export const criarTipo = async (req, res) => {
  const { nome } = req.body;

  try {
    const maxCodigo = await prisma.tipo.aggregate({ _max: { codigo: true } });
    const novoCodigo = (maxCodigo._max.codigo || 0) + 1;

    const novoTipo = await prisma.tipo.create({
      data: {
        codigo: novoCodigo,
        nome,
      },
    });

    res.status(201).json(novoTipo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar tipo' });
  }
};

export const atualizarTipo = async (req, res) => {
  const codigo = Number(req.params.codigo);
  const { nome } = req.body;

  try {
    const tipoAtualizado = await prisma.tipo.update({
      where: { codigo },
      data: { nome },
    });
    res.json(tipoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar tipo' });
  }
};

export const deletarTipo = async (req, res) => {
  const codigo = Number(req.params.codigo);
  try {
    const tipo = await prisma.tipo.findUnique({ where: { codigo } });
    if (!tipo) {
      return res.status(404).json({ message: `Tipo com código ${codigo} não encontrado.` });
    }

    await prisma.tipo.delete({ where: { codigo } });

    res.status(200).json({ message: `O tipo "${tipo.nome}" foi deletado com sucesso.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar tipo' });
  }
};
