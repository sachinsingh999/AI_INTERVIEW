import api from "./api";

export const runCompilerTests = async (payload) => {
  const res = await api.post("/compiler/run", payload);
  return res.data;
};

export const submitCompilerCode = async (payload) => {
  const res = await api.post("/compiler/submit", payload);
  return res.data;
};
