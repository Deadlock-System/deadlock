import { env } from '../config/Env.ts';
const BASE_URL = env.apiURL;

export const api = {
  get: async (path: string) => {
    const response = await fetch(BASE_URL + path, {
      credentials: 'include',
    });

    return await response.json();
  },

  getPublic: async (path: string) => {
    const response = await fetch(BASE_URL + path);
    return await response.json();
  },

  post: async (path: string, data: any) => {
    console.log('PostData: ', data);
    const response = await fetch(BASE_URL + path, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  },

  patch: async (path: string, data: any) => {
    const response = await fetch(BASE_URL + path, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  delete: async (path: string) => {
    const response = await fetch(BASE_URL + path, {
      method: 'DELETE',
      credentials: 'include',
    });
    return await response.json();
  },
};
