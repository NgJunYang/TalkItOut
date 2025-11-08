import { synthesizeSpeech, transcribeAudio, isVoiceEnabled } from '../services/elevenlabs.service';

// Mock fetch globally
global.fetch = jest.fn();

describe('ElevenLabs Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isVoiceEnabled', () => {
    it('should return true if ELEVENLABS_API_KEY is set', () => {
      process.env.ELEVENLABS_API_KEY = 'test-api-key';
      expect(isVoiceEnabled()).toBe(true);
    });

    it('should return false if ELEVENLABS_API_KEY is not set', () => {
      delete process.env.ELEVENLABS_API_KEY;
      expect(isVoiceEnabled()).toBe(false);
    });
  });

  describe('synthesizeSpeech', () => {
    beforeEach(() => {
      process.env.ELEVENLABS_API_KEY = 'test-api-key';
      process.env.ELEVENLABS_VOICE_ID = 'Rachel';
      process.env.ELEVENLABS_API_BASE = 'https://api.elevenlabs.io';
      process.env.ELEVENLABS_TTS_LATENCY = '2';
    });

    it('should synthesize speech successfully', async () => {
      const mockAudioBuffer = Buffer.from('mock-audio-data');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockAudioBuffer.buffer,
      });

      const result = await synthesizeSpeech('Hello world');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/text-to-speech/Rachel/stream?optimize_streaming_latency=2',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'xi-api-key': 'test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should throw error if API key is not configured', async () => {
      delete process.env.ELEVENLABS_API_KEY;

      await expect(synthesizeSpeech('Hello world')).rejects.toThrow(
        'ElevenLabs API key not configured'
      );
    });

    it('should throw error if text is empty', async () => {
      await expect(synthesizeSpeech('')).rejects.toThrow(
        'Text is required for speech synthesis'
      );
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid API key',
      });

      await expect(synthesizeSpeech('Hello world')).rejects.toThrow(
        'ElevenLabs TTS failed: 401 Unauthorized'
      );
    });

    it('should use custom voice ID when provided', async () => {
      const mockAudioBuffer = Buffer.from('mock-audio-data');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockAudioBuffer.buffer,
      });

      await synthesizeSpeech('Hello world', 'custom-voice-id');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('custom-voice-id'),
        expect.any(Object)
      );
    });
  });

  describe('transcribeAudio', () => {
    beforeEach(() => {
      process.env.ELEVENLABS_API_KEY = 'test-api-key';
      process.env.ELEVENLABS_API_BASE = 'https://api.elevenlabs.io';
      process.env.ELEVENLABS_STT_MODEL = 'eleven_multilingual_v2';
      process.env.MAX_STT_SECONDS = '60';
    });

    it('should transcribe audio successfully', async () => {
      const mockAudioBuffer = Buffer.from('mock-audio-data');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: 'Hello world' }),
      });

      const result = await transcribeAudio(mockAudioBuffer, 'audio/webm');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/speech-to-text',
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(result).toBe('Hello world');
    });

    it('should throw error if API key is not configured', async () => {
      delete process.env.ELEVENLABS_API_KEY;
      const mockAudioBuffer = Buffer.from('mock-audio-data');

      await expect(transcribeAudio(mockAudioBuffer, 'audio/webm')).rejects.toThrow(
        'ElevenLabs API key not configured'
      );
    });

    it('should throw error if buffer is empty', async () => {
      const emptyBuffer = Buffer.from('');

      await expect(transcribeAudio(emptyBuffer, 'audio/webm')).rejects.toThrow(
        'Audio file is required for transcription'
      );
    });

    it('should handle API errors', async () => {
      const mockAudioBuffer = Buffer.from('mock-audio-data');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid audio format',
      });

      await expect(transcribeAudio(mockAudioBuffer, 'audio/webm')).rejects.toThrow(
        'ElevenLabs STT failed: 400 Bad Request'
      );
    });

    it('should throw error if no transcription is returned', async () => {
      const mockAudioBuffer = Buffer.from('mock-audio-data');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await expect(transcribeAudio(mockAudioBuffer, 'audio/webm')).rejects.toThrow(
        'No transcription returned from ElevenLabs'
      );
    });
  });
});
