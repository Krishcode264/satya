import { create } from 'zustand';
import axios from 'axios';

export const useAttackersStore = create((set) => ({
  attackers: [],
  selectedAttacker: null,
  loading: false,
  showModal: false,

  fetchAttackers: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("https://satya-ugee.onrender.com/api/report/attackers");
      set({ attackers: res.data.attackers, loading: false, showModal: true });
    } catch (err) {
      set({ loading: false });
      console.error(err);
    }
  },

  fetchAttackerDetails: async (fingerprint: string) => {
    set({ loading: true });
    try {
      const res = await axios.get(
        `https://satya-ugee.onrender.com/api/report/attacker/${fingerprint}`
      );
      set({ selectedAttacker: res.data, loading: false });
    } catch (err) {
      set({ loading: false });
      console.error(err);
    }
  },

  closeModal: () => set({ showModal: false, selectedAttacker: null })
}));
