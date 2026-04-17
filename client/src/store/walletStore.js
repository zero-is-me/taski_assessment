import { create } from "zustand";
import { fetchTransactions, fetchWallet } from "../api/wallet";
import { getErrorMessage } from "../api/axios";

export const useWalletStore = create((set) => ({
  wallet: null,
  transactions: [],
  pagination: null,
  loading: false,
  error: "",
  async hydrate(page = 1) {
    set({ loading: true, error: "" });
    try {
      const [{ data: walletData }, { data: txData }] = await Promise.all([fetchWallet(), fetchTransactions(page)]);
      set({
        wallet: walletData.data.wallet,
        transactions: txData.data.transactions,
        pagination: txData.data.pagination,
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ loading: false });
    }
  },
  setWallet(wallet) {
    set({ wallet });
  },
}));
