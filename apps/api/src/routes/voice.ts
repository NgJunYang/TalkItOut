import { Router, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { synthesizeSpeech, transcribeAudio, isVoiceEnabled } from '../services/elevenlabs.service';

const router = Router();

// Configure multer for in-memory file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    const allowedMimeTypes = [
      'audio/webm',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/m4a',
      'audio/mp4',
      'audio/mpeg',
      'audio/mp3',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

// Validation schemas
const ttsRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(5000, 'Text must not exceed 5000 characters'),
  voiceId: z.string().optional(),
});

/**
 * POST /voice/tts - Text-to-Speech
 * Converts text to audio using ElevenLabs
 */
router.post(
  '/tts',
  authenticate,
  validateBody(ttsRequestSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      if (!isVoiceEnabled()) {
        return res.status(503).json({
          error: 'Voice features are not available. ElevenLabs API key is not configured.',
        });
      }

      const { text, voiceId } = req.body;

      // Generate speech
      const audioBuffer = await synthesizeSpeech(text, voiceId);

      // Set appropriate headers for audio streaming
      const format = process.env.ELEVENLABS_TTS_FORMAT || 'audio/mpeg';
      res.setHeader('Content-Type', format);
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

      // Send the audio buffer
      res.send(audioBuffer);
    } catch (error) {
      console.error('TTS error:', error);
      next(error);
    }
  }
);

/**
 * POST /voice/stt - Speech-to-Text
 * Transcribes audio to text using ElevenLabs
 */
router.post(
  '/stt',
  authenticate,
  upload.single('file'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      if (!isVoiceEnabled()) {
        return res.status(503).json({
          error: 'Voice features are not available. ElevenLabs API key is not configured.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'Audio file is required',
        });
      }

      const { buffer, mimetype } = req.file;

      // Transcribe audio
      const text = await transcribeAudio(buffer, mimetype);

      res.json({ text });
    } catch (error) {
      console.error('STT error:', error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('too long')) {
          return res.status(400).json({
            error: error.message,
          });
        }
      }

      next(error);
    }
  }
);

/**
 * GET /voice/config - Get voice configuration
 * Returns public voice configuration for the frontend
 */
router.get('/config', authenticate, async (req: AuthRequest, res: Response) => {
  res.json({
    enabled: isVoiceEnabled(),
    defaultVoiceId: process.env.ELEVENLABS_VOICE_ID || 'Rachel',
    maxRecordingSeconds: parseInt(process.env.MAX_STT_SECONDS || '60', 10),
  });
});

export default router;
