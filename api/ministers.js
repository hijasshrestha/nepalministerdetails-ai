export const config = {
  runtime: "nodejs"
};

import { ministerMap } from "../data/ministermap.js";

export default async function handler(req, res) {
  console.log("MINISTERS API HIT");

  try {
    const { ministry } = req.query;
    console.log("MINISTRY RECEIVED:", ministry);

    const ministerName = ministerMap[ministry];
    if (!ministerName) {
      return res.status(400).json({ error: "Unknown ministry" });
    }

    // Build prompt
    const prompt = `
${ministerName} holds ministerial position as: ${ministry}.
Give me age, education, achievements.

You MUST return ONLY valid JSON.
No explanations.
No markdown.
No commentary.
No backticks.

Return EXACTLY this structure:

{
  "age": "string",
  "education": "string",
  "achievements": ["string", "string"]
}
`.trim();

    // Call Gemini API
    const aiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await aiResponse.json();
    console.log("FULL AI RESPONSE:", JSON.stringify(data, null, 2));

    // Extract text
    let textOutput = "";
    try {
      textOutput =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch {
      textOutput = "";
    }

    console.log("AI RAW TEXT:", textOutput);

    // Extract JSON
    let parsed;
    try {
      const match = textOutput.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    } catch {
      parsed = null;
    }

    if (!parsed) {
      parsed = {
        age: "Not clearly known",
        education: "Not clearly known",
        achievements: ["Not clearly known"]
      };
    }

    return res.status(200).json({
      name: ministerName,
      age: parsed.age,
      education: parsed.education,
      achievements: parsed.achievements
    });
  } catch (err) {
    console.log("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
