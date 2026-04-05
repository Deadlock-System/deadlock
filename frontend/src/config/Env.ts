import { z } from 'zod';

const EnvSchema = z.object({
  VITE_GOOGLE_CLIENT_ID: z.string().min(1),
  VITE_API_URL: z.url(),
});

const parsedEnv = EnvSchema.safeParse(import.meta.env);
if (!parsedEnv.success)
  throw new Error(
    `Variáveis de ambiente inválidas: ${parsedEnv.error.message}`
  );

export const env = {
  googleClientId: parsedEnv.data.VITE_GOOGLE_CLIENT_ID,
  apiURL: parsedEnv.data.VITE_API_URL,
};
