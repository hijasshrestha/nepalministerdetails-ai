// api/ministers.js
export const config = { runtime: "nodejs" };

import { ministerMap } from "../data/ministermap.js";

export default async function handler(req, res) {
  try {
    const { ministry } = req.query;
    if (!ministry) {
      return res.status(400).json({ error: "Please provide a ministry" });
    }

    const name = ministerMap[ministry];
    if (!name) {
      return res.status(400).json({ error: "Unknown ministry" });
    }

    // Simple prompt: free-form text about the minister
    const prompt = `Write 2-3 short sentences about "${name}", their background and role.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    console.log("RAW GEMINI RESPONSE:", data);

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.status(200).json({ result: answer });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.toString() });
  }
}
