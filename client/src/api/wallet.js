import api from "./axios";

export const fetchWallet = () => api.get("/wallet");
export const addMoney = (payload) => api.post("/wallet/add", payload);
export const fetchTransactions = (page = 1) => api.get(`/wallet/transactions?page=${page}&limit=10`);
