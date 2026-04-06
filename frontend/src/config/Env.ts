import { z } from 'zod';

const stringToBoolean = (val: string) => val.toLowerCase() === 'true';

const EnvSchema = z.object({
  VITE_GOOGLE_CLIENT_ID: z.string().min(1),
  VITE_API_URL: z.url(),
  VITE_SHOW_VOTES: z.string().transform(stringToBoolean),
  VITE_SHOW_COMMENTS: z.string().transform(stringToBoolean),
  VITE_SHOW_VIEWS: z.string().transform(stringToBoolean),
  VITE_SHOW_BOOKMARK: z.string().transform(stringToBoolean),
});

const parsedEnv = EnvSchema.safeParse(import.meta.env);
if (!parsedEnv.success)
  throw new Error(
    `Variáveis de ambiente inválidas: ${parsedEnv.error.message}`
  );

export const env = {
  googleClientId: parsedEnv.data.VITE_GOOGLE_CLIENT_ID,
  apiURL: parsedEnv.data.VITE_API_URL,
  showVotes: parsedEnv.data.VITE_SHOW_VOTES,
  showComments: parsedEnv.data.VITE_SHOW_COMMENTS,
  showViews: parsedEnv.data.VITE_SHOW_VIEWS,
  showBookmark: parsedEnv.data.VITE_SHOW_BOOKMARK,
};
