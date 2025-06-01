import prisma from '../config/dbConfig.js';
import { getPokemonMedia } from '../services/pokeApiService.js';
import { pokemonSchema } from '../schemas/pokemonSchema.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function buscarPokemonsPorTipo(req, res) {
  const tipo = Number(req.query.tipo);

  if (!tipo || isNaN(tipo)) {
    return res
      .status(400)
      .json({ message: 'Informe o tipo como um número válido' });
  }

  try {
    const pokemons = await prisma.pokemon.findMany({
      where: {
        OR: [{ tipoPrincipalCodigo: tipo }, { tipoSecundarioCodigo: tipo }],
      },
      include: {
        tipoPrincipal: true,
        tipoSecundario: true,
      },
    });

    if (pokemons.length === 0) {
      return res
        .status(404)
        .json({ message: 'Nenhum Pokémon encontrado para este tipo' });
    }

    const pokemonsComMidia = await Promise.all(
      pokemons.map(async (pokemon) => {
        const { image, thumbnail, gif } = await getPokemonMedia(pokemon.nome);
        return { ...pokemon, imagem: image, miniatura: thumbnail, gif };
      }),
    );

    return res.json(pokemonsComMidia);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar pokémons' });
  }
}

export async function listarPokemons(req, res) {
  try {
    const pokemons = await prisma.pokemon.findMany({
      include: {
        tipoPrincipal: true,
        tipoSecundario: true,
      },
      // --- Adição para ordenar por código ---
      orderBy: {
        codigo: 'asc', // 'asc' para ordem crescente, 'desc' para decrescente
      },
      // ------------------------------------
    });

    const pokemonsComMidia = await Promise.all(
      pokemons.map(async (pokemon) => {
        const { image, thumbnail, gif } = await getPokemonMedia(pokemon.nome);
        return {
          ...pokemon,
          imagem: image,
          miniatura: thumbnail,
          gif: gif,
        };
      }),
    );

    res.json(pokemonsComMidia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar pokémons' });
  }
}

export const buscarPokemonPorCodigo = async (req, res) => {
  const codigo = Number(req.params.codigo);
  if (!codigo || isNaN(codigo)) {
    return res
      .status(400)
      .json({ message: 'Código inválido ou não informado' });
  }

  try {
    const pokemon = await prisma.pokemon.findUnique({
      where: { codigo },
      include: {
        tipoPrincipal: true,
        tipoSecundario: true,
      },
    });

    if (!pokemon) {
      return res.status(404).json({ message: 'Pokémon não encontrado' });
    }

    const { image, thumbnail, gif } = await getPokemonMedia(pokemon.nome);

    res.json({
      ...pokemon,
      imagem: image,
      miniatura: thumbnail,
      gif: gif,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar Pokémon' });
  }
};

export async function criarPokemon(req, res) {
  try {
    const parsed = pokemonSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { nome, tipoPrincipalId, tipoSecundarioId } = parsed.data;

    const tipoPrincipal = await prisma.tipo.findUnique({
      where: { codigo: tipoPrincipalId },
    });
    if (!tipoPrincipal) {
      return res.status(400).json({ message: 'Tipo principal não encontrado' });
    }

    let tipoSecundario = null;
    if (typeof tipoSecundarioId !== 'undefined' && tipoSecundarioId !== null) {
      tipoSecundario = await prisma.tipo.findUnique({
        where: { codigo: tipoSecundarioId },
      });
      if (!tipoSecundario) {
        return res
          .status(400)
          .json({ message: 'Tipo secundário não encontrado' });
      }
    }

    const maxCodigoResult = await prisma.pokemon.aggregate({
      _max: { codigo: true },
    });
    const novoCodigo = (maxCodigoResult._max.codigo || 0) + 1;

    const novoPokemon = await prisma.pokemon.create({
      data: {
        codigo: novoCodigo,
        nome,
        tipoPrincipal: {
          connect: { codigo: tipoPrincipal.codigo },
        },
        tipoSecundario: tipoSecundario
          ? { connect: { codigo: tipoSecundario.codigo } }
          : undefined,
      },
      include: {
        tipoPrincipal: true,
        tipoSecundario: true,
      },
    });

    const { image, thumbnail, gif } = await getPokemonMedia(novoPokemon.nome);

    res
      .status(201)
      .json({ ...novoPokemon, imagem: image, miniatura: thumbnail, gif: gif });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar pokémon' });
  }
}

export async function atualizarPokemon(req, res) {
  const pokemonCodigoOriginal = Number(req.params.codigo);

  try {
    const parsed = pokemonSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const {
      codigo: novoCodigo,
      nome,
      tipoPrincipalId,
      tipoSecundarioId,
    } = parsed.data;

    const pokemonExistente = await prisma.pokemon.findUnique({
      where: { codigo: pokemonCodigoOriginal },
    });

    if (!pokemonExistente) {
      return res.status(404).json({
        message: `Pokémon com código ${pokemonCodigoOriginal} não encontrado para atualização.`,
      });
    }

    if (novoCodigo !== undefined && novoCodigo !== pokemonCodigoOriginal) {
      const codigoDuplicado = await prisma.pokemon.findUnique({
        where: { codigo: novoCodigo },
      });

      if (codigoDuplicado) {
        return res.status(409).json({
          message: `O código '${novoCodigo}' já está em uso por outro Pokémon. Por favor, escolha um código único.`,
        });
      }
    }

    const tipoPrincipal = await prisma.tipo.findUnique({
      where: { codigo: tipoPrincipalId },
    });
    if (!tipoPrincipal) {
      return res.status(400).json({ message: 'Tipo principal não encontrado' });
    }

    let tipoSecundario = null;
    if (tipoSecundarioId !== undefined && tipoSecundarioId !== null) {
      tipoSecundario = await prisma.tipo.findUnique({
        where: { codigo: tipoSecundarioId },
      });
      if (!tipoSecundario) {
        return res
          .status(400)
          .json({ message: 'Tipo secundário não encontrado' });
      }
    }

    const pokemonAtualizado = await prisma.pokemon.update({
      where: { codigo: pokemonCodigoOriginal },
      data: {
        codigo: novoCodigo,
        nome,
        tipoPrincipal: {
          connect: { codigo: tipoPrincipal.codigo },
        },
        tipoSecundario: tipoSecundario
          ? { connect: { codigo: tipoSecundario.codigo } }
          : { disconnect: true },
      },
      include: {
        tipoPrincipal: true,
        tipoSecundario: true,
      },
    });

    const { image, thumbnail, gif } = await getPokemonMedia(
      pokemonAtualizado.nome,
    );

    res.json({
      ...pokemonAtualizado,
      imagem: image,
      miniatura: thumbnail,
      gif: gif,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          message: `Pokémon com código ${pokemonCodigoOriginal} não encontrado para atualização.`,
        });
      }
      if (error.code === 'P2002' && error.meta?.target) {
        if (error.meta.target.includes('nome')) {
          return res.status(409).json({
            message: `Já existe um Pokémon com o nome '${req.body.nome}'.`,
          });
        }
        if (error.meta.target.includes('codigo')) {
          return res.status(409).json({
            message: `O código '${req.body.codigo}' já está em uso por outro Pokémon (erro de unicidade do banco de dados).`,
          });
        }
      }
    }
    console.error('Erro ao atualizar Pokémon:', error);
    res.status(500).json({
      message: 'Ocorreu um erro interno ao tentar atualizar o Pokémon.',
    });
  }
}

export async function deletarPokemon(req, res) {
  const codigo = Number(req.params.codigo);

  try {
    const pokemon = await prisma.pokemon.findUnique({
      where: { codigo },
    });

    if (!pokemon) {
      return res
        .status(404)
        .json({ message: `Pokémon com código ${codigo} não encontrado.` });
    }

    await prisma.pokemon.delete({
      where: { codigo },
    });

    res.status(200).json({
      message: `O Pokémon "${pokemon.nome}" foi deletado com sucesso.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar pokémon' });
  }
}
