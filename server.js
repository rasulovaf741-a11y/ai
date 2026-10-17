const express = require("express");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Xabarlar noto'g'ri yuborildi."
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: messages,
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter xatosi:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter API xatosi."
      });
    }

    const answer = data?.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({
        error: "AI javobi olinmadi."
      });
    }

    res.json({
      answer: answer
    });

  } catch (error) {
    console.error("Server xatosi:", error);

    res.status(500).json({
      error: error.message || "Server xatosi."
    });
  }
});

app.listen(PORT, () => {
  console.log("");
  console.log("================================");
  console.log("        YENGILMAS AI ISHLADI");
  console.log("================================");
  console.log("");
  console.log(`http://localhost:${PORT}`);
  console.log("");
});