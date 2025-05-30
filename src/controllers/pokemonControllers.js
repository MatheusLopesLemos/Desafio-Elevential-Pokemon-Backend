import prisma from '../config/dbConfig.js';
import { getPokemonMedia } from '../services/pokeApiService.js';

// Listar todos os pokémons com tipos incluídos e imagem
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
      })
    );

    res.json(pokemonsComMidia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar pokémons' });
  }
}

// Buscar pokémon por código com imagem
export async function buscarPokemonPorCodigo(req, res) {
  const codigo = Number(req.params.codigo);

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

    const imageUrl = await getPokemonImage(pokemon.nome);

    res.json({ ...pokemon, imagem: imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar pokémon' });
  }
}

// Criar novo pokémon com código gerado automaticamente
export async function criarPokemon(req, res) {
  const { nome, tipoPrincipalCodigo, tipoSecundarioCodigo } = req.body;

  if (typeof tipoPrincipalCodigo === 'undefined') {
    return res.status(400).json({ message: 'tipoPrincipalCodigo é obrigatório' });
  }

  try {
    // Buscar tipos pelo código
    const tipoPrincipal = await prisma.tipo.findUnique({
      where: { codigo: tipoPrincipalCodigo },
    });
    if (!tipoPrincipal) {
      return res.status(400).json({ message: 'Tipo principal não encontrado' });
    }

    let tipoSecundario = null;
    if (typeof tipoSecundarioCodigo !== 'undefined' && tipoSecundarioCodigo !== null) {
      tipoSecundario = await prisma.tipo.findUnique({
        where: { codigo: tipoSecundarioCodigo },
      });
      if (!tipoSecundario) {
        return res.status(400).json({ message: 'Tipo secundário não encontrado' });
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

    const imageUrl = await getPokemonImage(novoPokemon.nome);

    res.status(201).json({ ...novoPokemon, imagem: imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar pokémon' });
  }
}

// Atualizar pokémon por código
export async function atualizarPokemon(req, res) {
  const codigo = Number(req.params.codigo);
  const { nome, tipoPrincipalCodigo, tipoSecundarioCodigo } = req.body;

  if (typeof tipoPrincipalCodigo === 'undefined') {
    return res.status(400).json({ message: 'tipoPrincipalCodigo é obrigatório' });
  }

  try {
    // Buscar tipos pelo código
    const tipoPrincipal = await prisma.tipo.findUnique({
      where: { codigo: tipoPrincipalCodigo },
    });
    if (!tipoPrincipal) {
      return res.status(400).json({ message: 'Tipo principal não encontrado' });
    }

    let tipoSecundario = null;
    if (typeof tipoSecundarioCodigo !== 'undefined' && tipoSecundarioCodigo !== null) {
      tipoSecundario = await prisma.tipo.findUnique({
        where: { codigo: tipoSecundarioCodigo },
      });
      if (!tipoSecundario) {
        return res.status(400).json({ message: 'Tipo secundário não encontrado' });
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
          : { disconnect: true }, // desconecta se null
      },
      include: {
        tipoPrincipal: true,
        tipoSecundario: true,
      },
    });

    const imageUrl = await getPokemonImage(pokemonAtualizado.nome);

    res.json({ ...pokemonAtualizado, imagem: imageUrl });
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
      return res.status(404).json({ message: `Pokémon com código ${codigo} não encontrado.` });
    }

    await prisma.pokemon.delete({
      where: { codigo },
    });

    res.status(200).json({ message: `O Pokémon "${pokemon.nome}" foi deletado com sucesso.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar pokémon' });
  }
}
