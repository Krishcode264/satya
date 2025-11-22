interface AnalyzeRequest {
  userInput: string;
  page: string;
  field: string;
}

interface AnalyzeResponse {
  message: string;
  delay?: boolean;
  attackDetected?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const analyzeInput = async (data: AnalyzeRequest): Promise<string> => {
  try {
    const url = `${API_URL}/api/analyze`;
    
    console.log('Sending request to:', url);
    console.log('Request data:', data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const result: AnalyzeResponse = await response.json();
    console.log('Response data:', result);
    
    if (!result.message) {
      throw new Error('Invalid response format: missing message');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Connection error. Please try again.');
  }
};
