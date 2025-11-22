import { create } from 'zustand';

export type PageType = 'home' | 'login' | 'search' | 'feedback' | 'register' | 'upload';

interface TrapState {
  // Login page state
  loginUsername: string;
  loginPassword: string;
  
  // Search page state
  searchQuery: string;
  
  // Feedback page state
  feedbackName: string;
  feedbackEmail: string;
  feedbackComment: string;
  
  // Register page state
  registerName: string;
  registerEmail: string;
  registerPassword: string;
  
  // Upload page state
  uploadFile: File | null;
  uploadDescription: string;
  
  // UI state
  activePage: PageType;
  isLoading: boolean;
  serverMessage: string;
  
  // Actions
  setLoginUsername: (username: string) => void;
  setLoginPassword: (password: string) => void;
  setSearchQuery: (query: string) => void;
  setFeedbackName: (name: string) => void;
  setFeedbackEmail: (email: string) => void;
  setFeedbackComment: (comment: string) => void;
  setRegisterName: (name: string) => void;
  setRegisterEmail: (email: string) => void;
  setRegisterPassword: (password: string) => void;
  setUploadFile: (file: File | null) => void;
  setUploadDescription: (description: string) => void;
  setActivePage: (page: PageType) => void;
  setIsLoading: (loading: boolean) => void;
  setServerMessage: (message: string) => void;
  resetForm: () => void;
}

export const useTrapStore = create<TrapState>((set) => ({
  // Initial state
  loginUsername: '',
  loginPassword: '',
  searchQuery: '',
  feedbackName: '',
  feedbackEmail: '',
  feedbackComment: '',
  registerName: '',
  registerEmail: '',
  registerPassword: '',
  uploadFile: null,
  uploadDescription: '',
  activePage: 'home',
  isLoading: false,
  serverMessage: '',
  
  // Setters
  setLoginUsername: (loginUsername) => set({ loginUsername }),
  setLoginPassword: (loginPassword) => set({ loginPassword }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFeedbackName: (feedbackName) => set({ feedbackName }),
  setFeedbackEmail: (feedbackEmail) => set({ feedbackEmail }),
  setFeedbackComment: (feedbackComment) => set({ feedbackComment }),
  setRegisterName: (registerName) => set({ registerName }),
  setRegisterEmail: (registerEmail) => set({ registerEmail }),
  setRegisterPassword: (registerPassword) => set({ registerPassword }),
  setUploadFile: (uploadFile) => set({ uploadFile }),
  setUploadDescription: (uploadDescription) => set({ uploadDescription }),
  setActivePage: (activePage) => set({ activePage, serverMessage: '' }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setServerMessage: (serverMessage) => set({ serverMessage }),
  
  resetForm: () => set({
    loginUsername: '',
    loginPassword: '',
    searchQuery: '',
    feedbackName: '',
    feedbackEmail: '',
    feedbackComment: '',
    registerName: '',
    registerEmail: '',
    registerPassword: '',
    uploadFile: null,
    uploadDescription: '',
    serverMessage: '',
  }),
}));
