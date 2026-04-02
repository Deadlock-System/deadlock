import { env } from '../config/Env.ts';
const BASE_URL = env.apiURL;

export const api = {
  get: async (path: string) => {
    const response = await fetch(BASE_URL + path, {
      credentials: 'include',
    });

    return await response.json();
  },
};
