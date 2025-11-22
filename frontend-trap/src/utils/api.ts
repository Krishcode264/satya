interface AnalyzeRequest {
  userInput: string;
  page?: string;
  field?: string;
}

interface AnalyzeResponse {
  message: string;
  delay?: boolean;
  attackDetected?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const analyzeInput = async (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
  try {
    const url = `${API_URL}/api/analyze`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Server error: ${response.status} - ${message}`);
    }

    const result = await response.json();

    if (!result.message) {
      throw new Error("Invalid response from server");
    }

    return result;

  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Connection error. Please try again.");
  }
};
