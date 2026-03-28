import { ministerMap } from "../data/ministermap.js";

export default async function handler(req, res) {
  console.log("MINISTERS API HIT");
  try {
    const { ministry } = req.query;

    // Validate ministry
    if (!ministry || !ministerMap[ministry]) {
      return res.status(400).json({
        error: "Unknown ministry"
      });
    }

    const ministerName = ministerMap[ministry];

    // Build prompt including minister name in the JSON
    const prompt = `
${ministerName} holds ministerial position as: ${ministry}.
Give me age, education, achievements.

Return ONLY valid JSON.
Do NOT add explanations, notes, or extra text.
Do NOT add markdown.
Do NOT add backticks.
Do NOT add labels.
Return EXACTLY this structure:

{
  "age": "string",
  "education": "string",
  "achievements": ["string", "string", "string"]
}
`.trim();


    // Call Gemini 2.5 Flash
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
    console.log("FULL AI RESPONSE:", JSON.stringify(data, null, 2));

    let textOutput =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("FULL AI RESPONSE:", JSON.stringify(data, null, 2));
    console.log("AI RAW OUTPUT:", textOutput);

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

    // Always use ministerName from ministermap.js
    const result = {
      name: ministerName,
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
