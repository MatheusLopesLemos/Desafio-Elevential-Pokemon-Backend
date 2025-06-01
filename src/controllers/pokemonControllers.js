import prisma from '../config/dbConfig.js';
import { getPokemonMedia } from '../services/pokeApiService.js';
import { pokemonSchema } from '../schemas/pokemonSchema.js';

export async function buscarPokemonsPorTipo(req, res) {
  const tipo = Number(req.query.tipo); // tipo vindo da query param

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

    // Adiciona mídia (imagem, miniatura, gif)
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

// Listar todos os pokémons com tipos incluídos e mídia (imagem, miniatura, gif)
export async function listarPokemons(req, res) {
  try {
    const pokemons = await prisma.pokemon.findMany({
      include: {
        tipoPrincipal: true,
        tipoSecundario: true,
      },
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

// Buscar pokémon por código com mídia (imagem, miniatura, gif)
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

    res.json(pokemon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar Pokémon' });
  }
};

// Criar novo pokémon com código gerado automaticamente e validação com Zod
export async function criarPokemon(req, res) {
  try {
    const parsed = pokemonSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { nome, tipoPrincipalCodigo, tipoSecundarioCodigo } = parsed.data;

    // Buscar tipos pelo código
    const tipoPrincipal = await prisma.tipo.findUnique({
      where: { codigo: tipoPrincipalCodigo },
    });
    if (!tipoPrincipal) {
      return res.status(400).json({ message: 'Tipo principal não encontrado' });
    }

    let tipoSecundario = null;
    if (
      typeof tipoSecundarioCodigo !== 'undefined' &&
      tipoSecundarioCodigo !== null
    ) {
      tipoSecundario = await prisma.tipo.findUnique({
        where: { codigo: tipoSecundarioCodigo },
      });
      if (!tipoSecundario) {
        return res
          .status(400)
          .json({ message: 'Tipo secundário não encontrado' });
      }
    }

    // Buscar maior código atual
    const maxCodigoResult = await prisma.pokemon.aggregate({
      _max: { codigo: true },
    });
    const novoCodigo = (maxCodigoResult._max.codigo || 0) + 1;

    // Criar o Pokémon
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

// Atualizar pokémon por código com validação Zod e mídia
export async function atualizarPokemon(req, res) {
  const codigo = Number(req.params.codigo);

  try {
    const parsed = pokemonSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { nome, tipoPrincipalCodigo, tipoSecundarioCodigo } = parsed.data;

    // Buscar tipos pelo código
    const tipoPrincipal = await prisma.tipo.findUnique({
      where: { codigo: tipoPrincipalCodigo },
    });
    if (!tipoPrincipal) {
      return res.status(400).json({ message: 'Tipo principal não encontrado' });
    }

    let tipoSecundario = null;
    if (
      typeof tipoSecundarioCodigo !== 'undefined' &&
      tipoSecundarioCodigo !== null
    ) {
      tipoSecundario = await prisma.tipo.findUnique({
        where: { codigo: tipoSecundarioCodigo },
      });
      if (!tipoSecundario) {
        return res
          .status(400)
          .json({ message: 'Tipo secundário não encontrado' });
      }
    }

    // Atualizar o Pokémon
    const pokemonAtualizado = await prisma.pokemon.update({
      where: { codigo },
      data: {
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
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar pokémon' });
  }
}

// Deletar pokémon por código
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
