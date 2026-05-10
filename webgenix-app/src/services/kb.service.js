import api from './api';

export const kbService = {
  getCategories: async () => {
    const response = await api.get('/kb/categories');
    return response.data;
  },

  getArticles: async (params) => {
    const response = await api.get('/kb/articles', { params });
    return response.data;
  },

  getArticle: async (id) => {
    const response = await api.get(`/kb/articles/${id}`);
    return response.data;
  },

  searchArticles: async (query) => {
    const response = await api.get('/kb/articles', { params: { search: query } });
    return response.data;
  }
};
