export class APIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  }

  async checkHealth() {
    console.log(this.baseUrl)
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  async generateText(prompt: string) {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || "Failed to generate text");
    }

    return response.json();
  }
}

export const api = new APIClient();