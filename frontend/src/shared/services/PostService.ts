import { api } from '../Api';

export const postService = {
  getPosts: async () => {
    return await api.get('/posts');
  },
};
