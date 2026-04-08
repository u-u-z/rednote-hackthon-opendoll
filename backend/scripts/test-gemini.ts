import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: { baseUrl: process.env.GEMINI_BASE_URL! },
});

const model = process.env.GEMINI_IMAGE_MODEL!;
console.log(`[test] using model: ${model}`);
console.log(`[test] base url: ${process.env.GEMINI_BASE_URL}`);

const prompt = `Generate an anime character head-only portrait.
The character has bright pink hair, large expressive eyes, and a gentle smile.
Head only, white background, clean 2D anime style, Genshin Impact aesthetic.
Negative: realistic, 3D, body visible, clothing visible.`;

console.log("[test] sending request...");

try {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  console.log("[test] response received");

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    console.error("[test] no parts in response");
    console.log(JSON.stringify(response, null, 2));
    process.exit(1);
  }

  for (const part of parts) {
    if (part.text) {
      console.log("[test] text:", part.text);
    }
    if (part.inlineData) {
      const filename = "test_pink_hair.png";
      fs.mkdirSync("data/images", { recursive: true });
      fs.writeFileSync(
        `data/images/${filename}`,
        Buffer.from(part.inlineData.data!, "base64"),
      );
      console.log(`[test] image saved: data/images/${filename} (${part.inlineData.mimeType})`);
    }
  }

  console.log("[test] done!");
} catch (err) {
  console.error("[test] error:", err);
  process.exit(1);
}
