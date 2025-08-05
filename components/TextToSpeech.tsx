'use client';

import React, { useState, useCallback } from 'react';
import LanguageSelector from './LanguageSelector';
import VoiceSelector from './VoiceSelector';
import AudioPlayer from './AudioPlayer';

interface Voice {
  name: string;
  languageCodes: string[];
  ssmlGender: string;
  naturalSampleRateHertz: number;
  isFree: boolean;
}

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [languageCode, setLanguageCode] = useState('en-US');

  const [selectedVoice, setSelectedVoice] = useState('');
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);

  // Usar useCallback para memorizar la función
  const handleVoiceChange = useCallback((voiceName: string) => {
    setSelectedVoice(voiceName);
  }, []);

  const handleLanguageChange = (newLanguageCode: string) => {
    setLanguageCode(newLanguageCode);
    // Resetear la voz seleccionada cuando cambia el idioma
    setSelectedVoice('');
  };

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) {
      setError('Por favor ingrese texto y seleccione una voz');
      return;
    }

    setLoading(true);
    setError(null);
    setAudioBase64(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceName: selectedVoice,
          languageCode,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al generar el audio');
      }

      setAudioBase64(data.audioContent);
    } catch (err) {
      console.error('Error generating speech:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al generar el audio');
    } finally {
      setLoading(false);
    }
  };

  const handleVoicesLoaded = (loadedVoices: Voice[]) => {
    setVoices(loadedVoices);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Text-to-Speech with Google Cloud</h1>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
              Text to convert
            </label>
            <textarea
              id="text"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Type the text you want to convert to audio..."
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{text.length} characters</span>
              <span>Max recommended: 5000 characters</span>
            </div>
          </div>

          <LanguageSelector 
            value={languageCode} 
            onChange={handleLanguageChange} 
          />

          <VoiceSelector
            languageCode={languageCode}
            value={selectedVoice}
            onChange={handleVoiceChange}
            onVoicesLoaded={handleVoicesLoaded}
          />

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {voices.length > 0 && (
                <span>{voices.length} voices available</span>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !text.trim() || !selectedVoice}
              className={`px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading || !text.trim() || !selectedVoice
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Audio'
              )}
            </button>
          </div>

          {audioBase64 && (
            <AudioPlayer 
              audioBase64={audioBase64} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;