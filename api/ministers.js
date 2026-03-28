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
      console.log("Available keys:", Object.keys(ministerMap));
      return res.status(400).json({ error: "Unknown ministry" });
    }

    // Cleaner prompt (no double JSON confusion)
    const prompt = `
You are a strict JSON generator.

Return ONLY valid JSON.
No explanation.
No extra text.
No markdown.

Provide general public information about this person:

Name: ${ministerName}

If exact details are unknown, provide best reasonable estimates.

Return EXACTLY this format:

{
  "age": "string",
  "education": "string",
  "achievements": ["string", "string"]
}
`.trim();
    const aiResponse = await fetch(
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

    const data = await aiResponse.json();

    let textOutput =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    console.log("AI RAW TEXT:", textOutput);

    let parsed;
    try {
      const match = textOutput.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    } catch {
      parsed = null;
    }

    // Fallback safety
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
