import { GoogleGenAI, type Content } from "@google/genai";
import fs from "node:fs";
import path from "node:path";
import { cfg } from "../shared/index.js";
import type { CandidateFace, SelfImpression } from "../mod/apimod/index.js";

const DIRECTIONS = [
  { label: "锐利 / 力量感", en: "sharp, powerful, battle-ready" },
  { label: "内敛 / 安静", en: "calm, quiet, introspective" },
  { label: "温暖 / 柔和", en: "warm, gentle, soft" },
  { label: "活泼 / 明亮", en: "lively, bright, energetic" },
] as const;

function isPlaceholderSecret(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes("your-gemini-api-key") ||
    normalized.includes("your-api-key") ||
    normalized.includes("changeme") ||
    normalized.includes("replace-me")
  );
}

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

function buildReferencePrompt(
  name: string,
  personality: string,
  description: string | undefined,
  direction: (typeof DIRECTIONS)[number],
  n: number,
): string {
  const descBlock = description
    ? `\nClient-provided appearance description: ${description}`
    : "";

  return `You are given a reference photo of a person.
Your task is to create an anime-style head-only portrait that captures
this person's key facial features (face shape, hairstyle, eye characteristics,
distinguishing features).
This is for kigurumi/mask design reference.

[POSE NORMALIZATION — CRITICAL]
Regardless of the pose, angle, or framing in the reference photo,
you MUST output a FRONT-FACING, straight-on head portrait.
Crop tightly to head and hair only — nothing below the jaw/neck.
Background: pure white (#FFFFFF), no shadows.

[STYLE CONVERSION — CRITICAL]
Convert to clean 2D anime style (Genshin Impact aesthetic).
Preserve the person's distinctive features but stylize them into anime form.

[CHARACTER CONTEXT]
Agent: ${name}
Personality: ${personality}${descBlock}
Visual direction: ${direction.en}

[VARIATION — MUST]
Direction ${n} of 4: ${direction.label}

Negative: generic face, realistic output, 3D, blurry, body visible, clothing visible.`;
}

export async function generateCandidates(
  sessionId: string,
  agentName: string,
  personality: string,
  selfImpression?: SelfImpression,
): Promise<CandidateFace[]> {
  if (isPlaceholderSecret(cfg().geminiApiKey)) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const client = new GoogleGenAI({
    apiKey: cfg().geminiApiKey,
    httpOptions: { baseUrl: cfg().geminiBaseUrl },
  });

  const hasRefImage = !!selfImpression?.reference_image;
  const extraPersonality = selfImpression?.description
    ? `${personality}, ${selfImpression.description}`
    : personality;

  const tasks = DIRECTIONS.map(async (dir, i) => {
    const faceId = `face_${i + 1}`;

    let contents: string | Content[];
    if (hasRefImage) {
      const prompt = buildReferencePrompt(
        agentName,
        personality,
        selfImpression!.description,
        dir,
        i + 1,
      );
      contents = [
        {
          role: "user" as const,
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: selfImpression!.reference_image!,
              },
            },
          ],
        },
      ];
    } else {
      contents = buildPrompt(agentName, extraPersonality, dir, i + 1);
    }

    const response = await client.models.generateContent({
      model: cfg().geminiImageModel,
      contents,
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
