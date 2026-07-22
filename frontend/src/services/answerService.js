import api from "./api";

export const submitQuestionAnswer = async (payload, token) => {
  const res = await api.post("/answers/submit", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const submitRoundEvaluations = async (payload, token) => {
  const res = await api.post("/answers/submit-oa", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
