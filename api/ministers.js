import { ministerMap } from "../data/ministermap.js";

export default async function handler(req, res) {
  try {
    const { ministry } = req.query;

    // Validate ministry
    if (!ministry || !ministerMap[ministry]) {
      return res.status(400).json({
        error: "Unknown ministry"
      });
    }

    const ministerName = ministerMap[ministry];

    // Build your exact prompt
    const prompt = `
${ministerName} holds ministerial position as: ${ministry}.
Give me age, education, achievements.

Return ONLY this JSON:
{
  "age": "string",
  "education": "string",
  "achievements": ["string", "string", "string"]
}
    `.trim();

    // Call AI
    const aiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
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
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(textOutput);
    } catch {
      parsed = {
        age: "Not clearly known",
        education: "Not clearly known",
        achievements: ["Not clearly known"]
      };
    }

    // Ensure all fields exist
    const result = {
      age: parsed.age || "Not clearly known",
      education: parsed.education || "Not clearly known",
      achievements:
        Array.isArray(parsed.achievements) && parsed.achievements.length > 0
          ? parsed.achievements
          : ["Not clearly known"]
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Server error"
    });
  }
}
