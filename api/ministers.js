export const config = {
  runtime: "nodejs"
};

import { ministerMap } from "../data/ministermap.js";

// Simple in-memory cache
const cache = {};

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

    // Return cached data if exists
    if (cache[ministerName]) {
      console.log("Returning cached data for", ministerName);
      return res.status(200).json(cache[ministerName]);
    }

    // AI prompt
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

    // Call Gemini 2.5 Flash
    let textOutput = "";
    try {
      const aiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
          process.env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            temperature: 0  // deterministic output
          })
        }
      );

      const raw = await aiResponse.text();
      console.log("GEMINI RAW:", raw);

      if (aiResponse.ok) {
        textOutput = raw.trim();
      } else {
        console.warn("Gemini API error:", raw);
      }
    } catch (err) {
      console.error("Gemini fetch/parsing error:", err);
    }

    // Robust JSON parsing
    let parsed;
    try {
      const start = textOutput.indexOf("{");
      const end = textOutput.lastIndexOf("}");
      parsed = start >= 0 && end >= 0 ? JSON.parse(textOutput.slice(start, end + 1)) : null;
    } catch {
      parsed = null;
    }

    // Fallback data
    if (!parsed) {
      parsed = {
        age: "Not clearly known",
        education: "Not clearly known",
        achievements: ["Not clearly known"]
      };
    }

    const responseData = {
      name: ministerName,
      age: parsed.age,
      education: parsed.education,
      achievements: parsed.achievements
    };

    // Cache result
    cache[ministerName] = responseData;

    return res.status(200).json(responseData);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
