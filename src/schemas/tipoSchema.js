import { z } from 'zod';

export const tipoSchema = z.object({
  nome: z
    .string()
    .min(1, { message: 'O nome é obrigatório' }) // Não pode ser vazio
    .max(50, { message: 'O nome deve ter no máximo 50 caracteres' }) // Limite razoável para nomes
    .trim(), // Remove espaços no início/fim
});
