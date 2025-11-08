declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Server
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;

      // Database
      MONGO_URI: string;

      // JWT
      JWT_SECRET: string;
      ACCESS_TOKEN_TTL_MIN?: string;
      REFRESH_TOKEN_TTL_DAYS?: string;

      // CORS
      ALLOWED_ORIGINS?: string;

      // Google Gemini AI
      GEMINI_API_KEY: string;
      AI_MODEL?: string;
      ALLOW_EXTERNAL_PII?: string;

      // Crisis Resources
      CRISIS_EMERGENCY?: string;
      CRISIS_SOS_LINE?: string;
      CRISIS_SOS_TEXT?: string;

      // ElevenLabs Voice API
      ELEVENLABS_API_KEY?: string;
      ELEVENLABS_VOICE_ID?: string;
      ELEVENLABS_TTS_LATENCY?: string;
      ELEVENLABS_TTS_FORMAT?: string;
      ELEVENLABS_API_BASE?: string;
      ELEVENLABS_STT_MODEL?: string;
      MAX_STT_SECONDS?: string;
    }
  }
}

export {};
