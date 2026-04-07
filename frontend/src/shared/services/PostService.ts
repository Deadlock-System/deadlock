import { api } from '../Api';

export const postService = {
  getPosts: async (page = 1) => {
    return await api.get(`/posts?page=${page}&limit=20`);
  },

  getPostById: async (id: string) => {
    return await api.get(`/posts/${id}`);
  },

  getCommentsByPostId: async (id: string) => {
    return await api.get(`/posts/${id}/comments`);
  },

  addComments: async (id: string, data: any) => {
    return await api.post(`/posts/${id}/comments`, data);
  },
};
