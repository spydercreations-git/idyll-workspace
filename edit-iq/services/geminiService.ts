
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIInsight, TransactionType } from "../types";

export const aiService = {
  async categorizeExpense(note: string): Promise<string> {
    // Initializing GoogleGenAI right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on this freelancer expense note: "${note}", suggest a single short category (e.g., Software, Hardware, Travel, Marketing, Internet). Return ONLY the category name.`,
      });
      // Correctly accessing .text property
      return response.text?.trim() || "General";
    } catch (error) {
      console.error("AI Error:", error);
      return "General";
    }
  },

  async generateInsights(transactions: Transaction[]): Promise<AIInsight[]> {
    if (transactions.length < 3) return [];

    // Initializing GoogleGenAI right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const dataStr = JSON.stringify(transactions.map(t => ({
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date
      })));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these Indian freelancer transactions (amounts are in INR) and provide 3 key insights. 
        One should be a profit-increasing tip, one a spending warning (if any), and one a simple prediction for next month.
        Make sure to reference amounts with the prefix '₹' in your response messages.
        Data: ${dataStr}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "One of: TIP, WARNING, PREDICTION" },
                message: { type: Type.STRING, description: "A concise insight message using ₹ symbol" },
                value: { type: Type.STRING, description: "Optional formatted value like ₹5,000" }
              },
              required: ["type", "message"]
            }
          }
        }
      });

      // Correctly accessing .text property and handling potential undefined value
      const jsonStr = response.text?.trim() || '[]';
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("AI Insights Error:", error);
      return [];
    }
  }
};
