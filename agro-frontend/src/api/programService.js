import axiosInstance from './axiosInstance';

// Service for subsidy program management
const programService = {
  async list(params = {}) {
    const { data } = await axiosInstance.get('/api/subsidy-programs', { params });
    return data;
  },

  async get(id) {
    const { data } = await axiosInstance.get(`/api/subsidy-programs/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await axiosInstance.post('/api/subsidy-programs', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await axiosInstance.put(`/api/subsidy-programs/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await axiosInstance.delete(`/api/subsidy-programs/${id}`);
    return data;
  }
};

export default programService;


