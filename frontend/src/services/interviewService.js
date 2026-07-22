import api from "./api";

export const fetchInterviewSession = async (id, token) => {
  const res = await api.get(`/interviews/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createChildSession = async (payload, token) => {
  const res = await api.post("/interviews", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
