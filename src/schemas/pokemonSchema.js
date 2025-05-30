import { z } from 'zod';

export const pokemonSchema = z.object({
  nome: z
    .string()
    .min(1, { message: 'O nome é obrigatório' })
    .max(50, { message: 'O nome deve ter no máximo 50 caracteres' })
    .trim(),
  tipoPrincipalCodigo: z.number({
    required_error: 'O código do tipo principal é obrigatório',
    invalid_type_error: 'O código do tipo principal deve ser um número',
  }),
  tipoSecundarioCodigo: z.number().nullable().optional(),
});