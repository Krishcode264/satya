import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AnalyzeInputParams {
  userInput: string;
  page: string;
  field: string;
}

export interface AnalyzeResponse {
  success: boolean;
  message: string;
}

export const analyzeInput = async (
  userInput: string,
  page: string,
  field: string
): Promise<AnalyzeResponse> => {
  try {
    const response = await axios.post<{ message: string }>(
      `${API_URL}/api/analyze`,
      {
        userInput,
        page,
        field
      }
    );
    return { success: true, message: response.data.message };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, message: 'Connection error. Please try again.' };
  }
};

