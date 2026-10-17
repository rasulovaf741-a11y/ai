
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body?.messages;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Xabarlar noto'g'ri yuborildi."
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY sozlanmagan."
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages,
          max_tokens: 2000
        })
      }
    );

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

    return res.json({ answer });
  } catch (error) {
    console.error("Server xatosi:", error);

    return res.status(500).json({
      error: "Serverda xatolik yuz berdi."
    });
  }
});

module.exports = app;
