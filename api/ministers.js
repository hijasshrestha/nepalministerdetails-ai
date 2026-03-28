export default async function handler(req, res) {
  try {
    let body = {};
    if (req.body) {
      body = req.body;
    } else {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString();
      body = JSON.parse(raw || "{}");
    }

    const { name } = body;
    if (!name) {
      return res.status(400).json({ error: "Please provide a name" });
    }

    // Simple prompt: just a couple of sentences about the person
    const prompt = `Write 2-3 short sentences about "${name}", their background and role.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("RAW GEMINI RESPONSE:", data);

    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";

    res.status(200).json({ result: answer });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.toString() });
  }
}
