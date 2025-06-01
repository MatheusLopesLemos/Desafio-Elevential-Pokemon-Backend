import { z } from 'zod';

export const pokemonSchema = z.object({
  codigo: z
    .number({
      invalid_type_error: 'O código do Pokémon deve ser um número',
    })
    .int('O código do Pokémon deve ser um número inteiro.')
    .positive('O código do Pokémon deve ser um número positivo.')
    .optional(),

  nome: z
    .string()
    .min(1, { message: 'O nome é obrigatório' })
    .max(50, { message: 'O nome deve ter no máximo 50 caracteres' })
    .trim(),

  tipoPrincipalId: z
    .number({
      required_error: 'O código do tipo principal é obrigatório',
      invalid_type_error: 'O código do tipo principal deve ser um número',
    })
    .int('O código do tipo principal deve ser um número inteiro.')
    .positive('O código do tipo principal deve ser um número positivo.'),

  tipoSecundarioId: z
    .number()
    .int('O código do tipo secundário deve ser um número inteiro.')
    .positive('O código do tipo secundário deve ser um número positivo.')
    .nullable()
    .optional(),
});
