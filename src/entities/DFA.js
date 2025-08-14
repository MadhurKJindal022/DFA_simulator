// entities/DFA.js

const STORAGE_KEY = "dfas";

export const DFA = {
  async list() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  async get(id) {
    const savedDFAs = await this.list();
    return savedDFAs.find(dfa => dfa.id === id) || null;
  },

  async create(data) {
    const savedDFAs = await this.list();

    // Check for existing DFA with same name
    const existingIndex = savedDFAs.findIndex(dfa => dfa.name === data.name);

    if (existingIndex !== -1) {
      const confirmOverwrite = window.confirm(
        `A DFA named "${data.name}" already exists. Do you want to overwrite it?`
      );
      if (!confirmOverwrite) {
        // If user cancels, just return the old DFA without changes
        return savedDFAs[existingIndex];
      }

      // Overwrite existing
      const updated = { ...savedDFAs[existingIndex], ...data, id: savedDFAs[existingIndex].id };
      savedDFAs[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDFAs));
      return updated;
    }

    // Create new DFA
    const newDfa = { id: Date.now().toString(), ...data };
    savedDFAs.push(newDfa);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDFAs));
    return newDfa;
  },

  async delete(id) {
    let savedDFAs = await this.list();
    savedDFAs = savedDFAs.filter(dfa => dfa.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDFAs));
    return true;
  }
};
