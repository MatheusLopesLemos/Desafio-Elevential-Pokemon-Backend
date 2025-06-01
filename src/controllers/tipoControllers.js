import prisma from '../config/dbConfig.js';
import { tipoSchema } from '../schemas/tipoSchema.js';

// Listar todos os tipos
export async function listarTipos(req, res) {
  try {
    const tipos = await prisma.tipo.findMany();
    res.json(tipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar tipos' });
  }
}

// Buscar tipo por código
export async function buscarTipoPorCodigo(req, res) {
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
}

// Criar novo tipo com validação Zod
export async function criarTipo(req, res) {
  try {
    const parsed = tipoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { nome } = parsed.data;

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
}

// Atualizar tipo com validação Zod
export async function atualizarTipo(req, res) {
  const codigo = Number(req.params.codigo);

  try {
    const parsed = tipoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { nome } = parsed.data;

    const tipoAtualizado = await prisma.tipo.update({
      where: { codigo },
      data: { nome },
    });

    res.json(tipoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar tipo' });
  }
}

// Deletar tipo por código
export async function deletarTipo(req, res) {
  const codigo = Number(req.params.codigo);

  try {
    const tipo = await prisma.tipo.findUnique({ where: { codigo } });
    if (!tipo) {
      return res
        .status(404)
        .json({ message: `Tipo com código ${codigo} não encontrado.` });
    }

    await prisma.tipo.delete({ where: { codigo } });

    res
      .status(200)
      .json({ message: `O tipo "${tipo.nome}" foi deletado com sucesso.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar tipo' });
  }
}
