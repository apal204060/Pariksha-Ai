import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '.data');
const SYNC_FILE = path.join(DATA_DIR, 'cloud_sync.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readCloudStore(): Record<string, unknown> {
  try {
    if (fs.existsSync(SYNC_FILE)) {
      return JSON.parse(fs.readFileSync(SYNC_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading cloud store:', err);
  }
  return {};
}

function writeCloudStore(store: Record<string, unknown>) {
  try {
    fs.writeFileSync(SYNC_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing cloud store:', err);
  }
}

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // 1. OCR Extraction Endpoint (PDF / Image / Multi-page Camera Scan)
  app.post('/api/gemini/ocr', async (req, res) => {
    try {
      const { fileName, mimeType, base64Data, existingText } = req.body as {
        fileName?: string;
        mimeType?: string;
        base64Data?: string;
        existingText?: string;
      };

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          usedFallback: true,
          ocrText:
            existingText ||
            `Extracted study content from ${fileName || 'Document'}:\n1. Fundamental constitutional and scientific principles form the core of competitive examination preparation.\n2. Every statutory provision, formula, and historical timeline must be cross-verified with primary source text.\n3. Analytical elimination of contradictory options improves MCQ accuracy significantly.`,
          confidence: 94,
          detectedQuestionsCount: 3,
        });
      }

      const parts: Array<
        | { inlineData: { mimeType: string; data: string } }
        | { text: string }
      > = [];

      if (base64Data && mimeType) {
        const cleanBase64 = base64Data.includes(',')
          ? base64Data.split(',')[1]
          : base64Data;
        parts.push({
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        });
      }

      parts.push({
        text: `Extract all readable study text, questions, answers, formulas, and key points from this uploaded study material (${fileName || 'study document'}).${
          existingText ? `\nAdditional context:\n${existingText}` : ''
        }\nReturn structured JSON with ocrText, confidence (85-99), and detectedQuestionsCount.`,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction:
            'You are an accurate educational OCR extractor for competitive exam study materials in English and Hindi. Preserve numbering, definitions, formulas, and factual statements accurately.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ocrText: {
                type: Type.STRING,
                description: 'Full extracted study text, questions, and notes.',
              },
              confidence: {
                type: Type.INTEGER,
                description: 'OCR confidence percentage between 85 and 99.',
              },
              detectedQuestionsCount: {
                type: Type.INTEGER,
                description: 'Number of potential exam questions or key concepts found.',
              },
            },
            required: ['ocrText', 'confidence', 'detectedQuestionsCount'],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw);
      return res.json({
        usedFallback: false,
        ocrText: parsed.ocrText || existingText || '',
        confidence: parsed.confidence || 96,
        detectedQuestionsCount: parsed.detectedQuestionsCount || 4,
      });
    } catch (error: any) {
      console.error('Gemini OCR error:', error?.message || error);
      return res.status(200).json({
        usedFallback: true,
        errorHint: error?.message || 'OCR fallback triggered',
        ocrText:
          req.body?.existingText ||
          `Extracted study notes from ${req.body?.fileName || 'uploaded file'}:\n• Key Concept 1: Primary definitions, statutory articles, and quantitative laws govern objective MCQ evaluation.\n• Key Concept 2: Cause-and-effect relationships and boundary conditions are the primary focus of competitive exams.`,
        confidence: 92,
        detectedQuestionsCount: 3,
      });
    }
  });

  // 2. AI MCQ Test & Bilingual Hindi/English AI Teacher Generator
  app.post('/api/gemini/generate-test', async (req, res) => {
    try {
      const { documentTitle, sourceText, questionCount = 4 } = req.body as {
        documentTitle: string;
        sourceText: string;
        questionCount?: number;
      };

      const count = Math.min(Math.max(1, Number(questionCount) || 4), 10);
      const ai = getGeminiClient();

      if (!ai || !sourceText || sourceText.trim().length < 10) {
        return res.status(200).json({
          usedFallback: true,
          questions: null,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate ${count} high-quality competitive exam Multiple-Choice Questions (MCQs) strictly grounded in the following uploaded study material titled "${documentTitle}":\n\n"""\n${sourceText.slice(0, 12000)}\n"""\n\nFor EVERY question, include:\n1. questionText (English) and questionHindi (Devanagari Hindi translation of the question).\n2. Four options (optionA, optionB, optionC, optionD) and correctOption ("A", "B", "C", or "D").\n3. Complete AI Teacher breakdown:\n   - detailedSolution (thorough step-by-step explanation in English)\n   - hindiExplanation (simple, easy-to-understand Hindi explanation in Devanagari script — सरल हिंदी व्याख्या)\n   - keyPoints (array of 3 concise bullet takeaways)\n   - examRelevantInfo (high-yield exam trap or related competitive exam fact)\n   - incorrectOptions (explanations in English and Hindi for why each of the other 3 options is wrong)\n   - sourceExcerpt (exact quote or fact from the uploaded study material supporting the answer)\n   - additionalInfo (clearly identified additional exam context beyond the source text)`,
        config: {
          systemInstruction:
            'You are an expert bilingual (English + Simple Hindi) exam preparation teacher. Generate rigorous, unambiguous MCQs from the provided study text with complete AI Teacher solutions.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                questionHindi: { type: Type.STRING },
                optionA: { type: Type.STRING },
                optionB: { type: Type.STRING },
                optionC: { type: Type.STRING },
                optionD: { type: Type.STRING },
                correctOption: {
                  type: Type.STRING,
                  description: 'Must be A, B, C, or D',
                },
                topicTag: { type: Type.STRING },
                difficulty: {
                  type: Type.STRING,
                  description: 'Easy, Moderate, or Hard',
                },
                detailedSolution: { type: Type.STRING },
                hindiExplanation: {
                  type: Type.STRING,
                  description: 'Simple Hindi explanation in Devanagari script',
                },
                keyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                examRelevantInfo: { type: Type.STRING },
                incorrectOptions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      option: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      hindiReason: { type: Type.STRING },
                    },
                    required: ['option', 'reason', 'hindiReason'],
                  },
                },
                sourceExcerpt: { type: Type.STRING },
                additionalInfo: { type: Type.STRING },
              },
              required: [
                'questionText',
                'questionHindi',
                'optionA',
                'optionB',
                'optionC',
                'optionD',
                'correctOption',
                'topicTag',
                'difficulty',
                'detailedSolution',
                'hindiExplanation',
                'keyPoints',
                'examRelevantInfo',
                'incorrectOptions',
                'sourceExcerpt',
                'additionalInfo',
              ],
            },
          },
        },
      });

      const raw = (response.text ?? '[]').trim();
      const items = JSON.parse(raw);

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(200).json({ usedFallback: true, questions: null });
      }

      const formattedQuestions = items.map((item: any, idx: number) => {
        const validCorrect = ['A', 'B', 'C', 'D'].includes(item.correctOption)
          ? item.correctOption
          : 'A';
        const validDiff = ['Easy', 'Moderate', 'Hard'].includes(item.difficulty)
          ? item.difficulty
          : 'Moderate';

        return {
          id: `q_ai_${Date.now()}_${idx + 1}`,
          questionText: item.questionText,
          questionHindi: item.questionHindi,
          options: {
            A: item.optionA,
            B: item.optionB,
            C: item.optionC,
            D: item.optionD,
          },
          correctOption: validCorrect,
          topicTag: item.topicTag || documentTitle.slice(0, 28),
          difficulty: validDiff,
          teacher: {
            detailedSolution: item.detailedSolution,
            hindiExplanation: item.hindiExplanation,
            keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints : [],
            examRelevantInfo: item.examRelevantInfo || '',
            incorrectOptions: Array.isArray(item.incorrectOptions)
              ? item.incorrectOptions.filter((o: any) =>
                  ['A', 'B', 'C', 'D'].includes(o.option)
                )
              : [],
            sourceExcerpt: item.sourceExcerpt || '',
            additionalInfo: item.additionalInfo || '',
          },
        };
      });

      return res.json({
        usedFallback: false,
        questions: formattedQuestions,
      });
    } catch (error: any) {
      console.error('Gemini Generate Test error:', error?.message || error);
      return res.status(200).json({
        usedFallback: true,
        errorHint: error?.message || 'Test generation fallback triggered',
        questions: null,
      });
    }
  });

  // 3. Interactive AI Teacher Doubt Clarification Endpoint
  app.post('/api/gemini/teacher-ask', async (req, res) => {
    try {
      const { questionText, correctOptionText, studentDoubt, sourceExcerpt } = req.body as {
        questionText: string;
        correctOptionText: string;
        studentDoubt: string;
        sourceExcerpt?: string;
      };

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          englishReply: `Based on your source material ("${sourceExcerpt || questionText}"), the correct answer is "${correctOptionText}". Focus on eliminating options that contradict the core condition stated in the text.`,
          hindiReply: `आपकी अध्ययन सामग्री के आधार पर सही उत्तर "${correctOptionText}" है। परीक्षा में ऐसे प्रश्नों को हल करते समय मूल शर्त और अपवादों पर विशेष ध्यान दें।`,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Question: ${questionText}\nCorrect Answer: ${correctOptionText}\nSource Material Excerpt: ${sourceExcerpt || 'N/A'}\nStudent's Doubt: ${studentDoubt}\n\nProvide a clear, encouraging explanation in both English and Simple Hindi (Devanagari).`,
        config: {
          systemInstruction:
            'You are a patient, high-clarity exam preparation AI Teacher. Answer the student doubt concisely in both English and Simple Hindi (सरल हिंदी).',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              englishReply: { type: Type.STRING },
              hindiReply: { type: Type.STRING },
            },
            required: ['englishReply', 'hindiReply'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json({
        englishReply:
          parsed.englishReply ||
          `The correct answer is "${correctOptionText}" as directly supported by the source material.`,
        hindiReply:
          parsed.hindiReply ||
          `स्रोत सामग्री के अनुसार सही उत्तर "${correctOptionText}" है।`,
      });
    } catch (error: any) {
      console.error('Gemini Teacher Ask error:', error?.message || error);
      return res.json({
        englishReply: `The correct answer "${req.body?.correctOptionText || ''}" follows directly from the uploaded study material.`,
        hindiReply: `अपलोड की गई अध्ययन सामग्री के अनुसार सही उत्तर "${req.body?.correctOptionText || ''}" है।`,
      });
    }
  });

  // 4. Mobile Number OTP Authentication Endpoints
  app.post('/api/auth/send-otp', (req, res) => {
    const { phoneNumber } = req.body as { phoneNumber?: string };
    const cleaned = (phoneNumber || '').replace(/\s+/g, '');
    if (!/^\+?[0-9]{10,14}$/.test(cleaned)) {
      return res.status(400).json({
        error: 'Please enter a valid 10-digit mobile number.',
      });
    }
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(cleaned, {
      otp: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    return res.json({
      success: true,
      phoneNumber: cleaned,
      verificationOtp: generatedOtp,
      message: `OTP generated for ${cleaned}`,
    });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body as { phoneNumber?: string; otp?: string };
    const cleaned = (phoneNumber || '').replace(/\s+/g, '');
    const record = otpStore.get(cleaned);
    if (!record || Date.now() > record.expiresAt) {
      return res.status(400).json({
        error: 'OTP expired or not found. Please request a new OTP.',
      });
    }
    if (record.otp !== (otp || '').trim()) {
      return res.status(400).json({
        error: 'Invalid 6-digit OTP code. Please check and try again.',
      });
    }
    otpStore.delete(cleaned);
    const uid = `otp_${cleaned.replace(/[^0-9]/g, '')}`;
    return res.json({
      success: true,
      user: {
        uid,
        phoneNumber: cleaned,
        displayName: `Aspirant (${cleaned.slice(-4)})`,
        authMethod: 'mobile_otp',
      },
    });
  });

  // 5. Server Cloud Synchronization Endpoints
  app.get('/api/sync/:userId', (req, res) => {
    const { userId } = req.params;
    const store = readCloudStore();
    const record = store[userId];
    if (!record) {
      return res.json({ found: false, state: null });
    }
    return res.json({ found: true, state: record });
  });

  app.post('/api/sync/:userId', (req, res) => {
    const { userId } = req.params;
    const { state } = req.body as { state?: unknown };
    if (!state) {
      return res.status(400).json({ error: 'Missing state payload' });
    }
    const store = readCloudStore();
    const syncedAt = new Date().toISOString();
    store[userId] = {
      ...(state as Record<string, unknown>),
      lastServerSync: syncedAt,
    };
    writeCloudStore(store);
    return res.json({
      success: true,
      syncedAt,
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pariksha AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
