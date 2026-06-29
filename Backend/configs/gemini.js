import axios from "axios";

async function main(prompt) {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // Using the official free-tier wrapper for Gemini 2.0 Flash
        model: "openrouter/free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // OpenRouter returns data structured like OpenAI.
    // This extracts the text string perfectly.
    return response.data.choices[0].message.content;
  } catch (error) {
    // Gracefully pass the error back to your controller
    console.error(
      "OpenRouter API Error Details:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.error?.message || "AI Generation failed",
    );
  }
}

export default main;

// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// async function main(prompt) {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.0-flash",
//     contents: prompt,
//   });
//   return response.text;
// }

// export default main;
