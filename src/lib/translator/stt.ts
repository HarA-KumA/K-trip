import { createHash, randomUUID } from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

import type { ConciergeLocale, InterpreterSttRequest, InterpreterSttResponse } from "./types.ts";

const MOCK_TRANSCRIPTS: Record<ConciergeLocale, string[]> = {
  ko: [
    "앞머리는 조금만 다듬어 주세요.",
    "온도가 괜찮은지 확인해 주세요.",
  ],
  en: [
    "Please make it look natural.",
    "Could you reduce the volume here?",
  ],
  ja: [
    "前髪は自然な感じにしてください。",
    "少しだけ待ってください。",
  ],
  "zh-CN": [
    "请尽量做得自然一点。",
    "这里请少一点蓬松度。",
  ],
};

export interface InterpreterSttProvider {
  transcribe(request: InterpreterSttRequest): Promise<InterpreterSttResponse>;
}

export class MockInterpreterSttProvider implements InterpreterSttProvider {
  async transcribe(request: InterpreterSttRequest): Promise<InterpreterSttResponse> {
    const samples = MOCK_TRANSCRIPTS[request.language];
    const hash = createHash("sha256").update(request.audioBuffer).digest("hex");
    const sampleIndex = Number.parseInt(hash.slice(0, 2), 16) % samples.length;

    return {
      transcriptId: `stt_${randomUUID().slice(0, 8)}`,
      text: samples[sampleIndex] ?? samples[0],
      locale: request.language,
      engine: process.env.STT_PROVIDER_NAME ?? "mock-stt",
      fallbackUsed: true,
      confidence: 0.42,
      createdAt: new Date().toISOString(),
    };
  }
}

export class HttpInterpreterSttProvider implements InterpreterSttProvider {
  constructor(
    private readonly endpoint: string,
    private readonly apiKey?: string,
    private readonly engineName = process.env.STT_PROVIDER_NAME ?? "http-stt",
  ) {}

  async transcribe(request: InterpreterSttRequest): Promise<InterpreterSttResponse> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        audioBase64: Buffer.from(request.audioBuffer).toString("base64"),
        mimeType: request.mimeType,
        language: request.language,
      }),
    });

    if (!response.ok) {
      throw new Error(`STT provider request failed with status ${response.status}.`);
    }

    const body = (await response.json()) as {
      text?: string;
      engine?: string;
      confidence?: number | null;
    };

    if (!body.text) {
      throw new Error("STT provider did not return text.");
    }

    return {
      transcriptId: `stt_${randomUUID().slice(0, 8)}`,
      text: body.text,
      locale: request.language,
      engine: body.engine ?? this.engineName,
      fallbackUsed: false,
      confidence: typeof body.confidence === "number" ? body.confidence : null,
      createdAt: new Date().toISOString(),
    };
  }
}

export class GeminiInterpreterSttProvider implements InterpreterSttProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async transcribe(request: InterpreterSttRequest): Promise<InterpreterSttResponse> {
    const audioContent = Buffer.from(request.audioBuffer).toString("base64");

    const result = await this.model.generateContent([
      `Transcribe the speech in this audio to ${request.language}. Return only the text.`,
      {
        inlineData: {
          data: audioContent,
          mimeType: request.mimeType,
        },
      },
    ]);

    const text = result.response.text().trim();

    return {
      transcriptId: `stt_${randomUUID().slice(0, 8)}`,
      text,
      locale: request.language,
      engine: "gemini",
      fallbackUsed: false,
      confidence: null,
      createdAt: new Date().toISOString(),
    };
  }
}

export class InterpreterSttService {
  constructor(private readonly provider: InterpreterSttProvider = createInterpreterSttProvider()) {}

  async transcribe(request: InterpreterSttRequest) {
    if (request.audioBuffer.byteLength === 0) {
      throw new Error("Audio payload is empty.");
    }

    return this.provider.transcribe(request);
  }
}

export function createInterpreterSttProvider(): InterpreterSttProvider {
  const apiKey = process.env.STT_PROVIDER_API_KEY;
  const engineName = process.env.STT_PROVIDER_NAME;

  if (engineName === "gemini" && apiKey) {
    return new GeminiInterpreterSttProvider(apiKey);
  }

  if (!process.env.STT_PROVIDER_URL) {
    return new MockInterpreterSttProvider();
  }

  return new HttpInterpreterSttProvider(
    process.env.STT_PROVIDER_URL,
    process.env.STT_PROVIDER_API_KEY,
  );
}
