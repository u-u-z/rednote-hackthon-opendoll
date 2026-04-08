import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";
import { cfg } from "../shared/index.js";
import type { CandidateFace } from "../mod/apimod/index.js";

const DIRECTIONS = [
  { label: "锐利 / 力量感", en: "sharp, powerful, battle-ready" },
  { label: "内敛 / 安静", en: "calm, quiet, introspective" },
  { label: "温暖 / 柔和", en: "warm, gentle, soft" },
  { label: "活泼 / 明亮", en: "lively, bright, energetic" },
] as const;

function buildPrompt(
  name: string,
  personality: string,
  direction: (typeof DIRECTIONS)[number],
  n: number,
): string {
  return `Generate an anime character head-only portrait based on the following personality.
This is for kigurumi/mask design reference.

[OUTPUT: HEAD ONLY — MUST]
Output ONLY the head and hair. Crop tightly, nothing below jaw/neck.
Background: pure white (#FFFFFF), no shadows.

[CHARACTER → VISUAL — MUST]
Agent: ${name}
Personality: ${personality}
Visual direction: ${direction.en}

Face design MUST reflect personality:
* Expression matches emotional baseline
* Palette reflects warmth/coolness
* Face shape and eyes convey energy level

[STYLE — MUST]
Clean 2D anime, Genshin Impact aesthetic, suitable for mask reference.

[VARIATION — MUST]
Direction ${n} of 4: ${direction.label}

Negative: generic face, realistic, 3D, blurry, body visible, clothing visible.`;
}

export async function generateCandidates(
  sessionId: string,
  agentName: string,
  personality: string,
): Promise<CandidateFace[]> {
  const client = new GoogleGenAI({
    apiKey: cfg().geminiApiKey,
    httpOptions: { baseUrl: cfg().geminiBaseUrl },
  });

  const tasks = DIRECTIONS.map(async (dir, i) => {
    const faceId = `face_${i + 1}`;
    const prompt = buildPrompt(agentName, personality, dir, i + 1);

    const response = await client.models.generateContent({
      model: cfg().geminiImageModel,
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error(`No response for ${faceId}`);

    for (const part of parts) {
      if (part.inlineData) {
        const imgDir = path.join(cfg().dataDir, "images");
        const filename = `${sessionId}_${faceId}.png`;
        fs.writeFileSync(
          path.join(imgDir, filename),
          Buffer.from(part.inlineData.data!, "base64"),
        );
        return {
          id: faceId,
          image_url: `/api/images/${filename}`,
          style_hint: dir.label,
        } satisfies CandidateFace;
      }
    }

    throw new Error(`No image in response for ${faceId}`);
  });

  return Promise.all(tasks);
}
