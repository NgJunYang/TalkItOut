import FormData from 'form-data';

// Environment configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_BASE = process.env.ELEVENLABS_API_BASE || 'https://api.elevenlabs.io';
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'Rachel';
const ELEVENLABS_TTS_LATENCY = process.env.ELEVENLABS_TTS_LATENCY || '2';
const ELEVENLABS_TTS_FORMAT = process.env.ELEVENLABS_TTS_FORMAT || 'audio/mpeg';
const ELEVENLABS_STT_MODEL = process.env.ELEVENLABS_STT_MODEL || 'eleven_multilingual_v2';
const MAX_STT_SECONDS = parseInt(process.env.MAX_STT_SECONDS || '60', 10);

// Validate API key on initialization
if (!ELEVENLABS_API_KEY) {
  console.warn('WARNING: ELEVENLABS_API_KEY is not set. Voice features will be disabled.');
} else {
  console.log('ElevenLabs API Key loaded:', ELEVENLABS_API_KEY.substring(0, 10) + '...');
}

export const isVoiceEnabled = (): boolean => {
  return !!ELEVENLABS_API_KEY;
};

/**
 * Synthesizes speech from text using ElevenLabs TTS
 * @param text - The text to convert to speech
 * @param voiceId - Optional voice ID (defaults to env ELEVENLABS_VOICE_ID)
 * @returns Audio buffer
 */
export async function synthesizeSpeech(text: string, voiceId?: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for speech synthesis');
  }

  const targetVoiceId = voiceId || ELEVENLABS_VOICE_ID;
  const url = `${ELEVENLABS_API_BASE}/v1/text-to-speech/${targetVoiceId}/stream?optimize_streaming_latency=${ELEVENLABS_TTS_LATENCY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Accept': ELEVENLABS_TTS_FORMAT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS error:', response.status, errorText);
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
}

/**
 * Transcribes audio to text using ElevenLabs STT
 * @param fileBuffer - The audio file buffer
 * @param mimeType - The MIME type of the audio file (e.g., 'audio/webm', 'audio/wav')
 * @returns Transcribed text
 */
export async function transcribeAudio(fileBuffer: Buffer, mimeType: string): Promise<string> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Audio file is required for transcription');
  }

  // Estimate duration and enforce MAX_STT_SECONDS
  // Rough estimation: for webm/opus at 48kbps, ~6KB per second
  const estimatedDurationSeconds = fileBuffer.length / 6000;
  if (estimatedDurationSeconds > MAX_STT_SECONDS) {
    throw new Error(`Audio file is too long. Maximum duration is ${MAX_STT_SECONDS} seconds.`);
  }

  // ElevenLabs Speech-to-Text API endpoint
  const url = `${ELEVENLABS_API_BASE}/v1/speech-to-text`;

  try {
    // Determine file extension from MIME type
    let extension = 'webm';
    if (mimeType.includes('wav')) extension = 'wav';
    else if (mimeType.includes('m4a')) extension = 'm4a';
    else if (mimeType.includes('mp3')) extension = 'mp3';
    else if (mimeType.includes('mpeg')) extension = 'mp3';
    else if (mimeType.includes('ogg')) extension = 'ogg';
    else if (mimeType.includes('opus')) extension = 'webm';

    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: `audio.${extension}`,
      contentType: mimeType,
    });
    formData.append('model', ELEVENLABS_STT_MODEL);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        ...formData.getHeaders(),
      },
      body: formData as any,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs STT error:', response.status, errorText);
      throw new Error(`ElevenLabs STT failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // ElevenLabs STT returns { text: "..." }
    if (!result.text) {
      throw new Error('No transcription returned from ElevenLabs');
    }

    return result.text.trim();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
