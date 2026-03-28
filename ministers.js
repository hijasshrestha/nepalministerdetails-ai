 
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    let body = {};

    // Handle Vercel body parsing fallback
    if (req.body) {
      body = req.body;
    } else {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString();
      body = JSON.parse(raw || "{}");
    }

    const { ministry } = body;

    if (!ministry) {
      return res.status(400).json({ error: "Ministry is required" });
    }

    // AI prompt — now AI figures out EVERYTHING
    const prompt = `
You are given the name of a ministry in Nepal.

Ministry: ${ministry}

Your task:
1. Identify the CURRENT minister of this ministry.
2. Provide their approximate age (or age range).
3. Provide their highest known educational qualification.
4. Provide 3–5 notable achievements prior to becoming minister.

Return ONLY this JSON:

{
  "ministerName": "string",
  "age": "string",
  "education": "string",
  "achievements": ["string", "string", "string"]
}

If any information is unclear or not publicly confirmed, write "Not clearly known".
Do NOT add any extra text outside the JSON.
    `.trim();

    // Call Gemini API
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

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        ministerName: "Not clearly known",
        age: "Not clearly known",
        education: "Not clearly known",
        achievements: ["Not clearly known"]
      };
    }

    return res.status(200).json({
      ministerName: parsed.ministerName || "Not clearly known",
      age: parsed.age || "Not clearly known",
      education: parsed.education || "Not clearly known",
      achievements: Array.isArray(parsed.achievements)
        ? parsed.achievements
        : ["Not clearly known"]
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
