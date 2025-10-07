import axiosInstance from './axiosInstance';

export const createServicesProgram = async (payload) => {
  const res = await axiosInstance.post('/api/services/programs', payload);
  return res.data?.program;
};

export const getServicesProgram = async (id) => {
  const res = await axiosInstance.get(`/api/services/programs/${id}`);
  return res.data?.program;
};

export const addProgramService = async (id, payload) => {
  const res = await axiosInstance.post(`/api/services/programs/${id}/services`, payload);
  return res.data?.program;
};

export const addBeneficiaryServiceRecord = async (id, beneficiaryId, payload) => {
  const res = await axiosInstance.post(`/api/services/programs/${id}/beneficiaries/${beneficiaryId}/records`, payload);
  return res.data?.record;
};

export const getProgramSummary = async (id) => {
  const res = await axiosInstance.get(`/api/services/programs/${id}/summary`);
  return res.data;
};


