import React, { useState, useEffect } from 'react';

interface Voice {
  name: string;
  languageCodes: string[];
  ssmlGender: string;
  naturalSampleRateHertz: number;
  isFree: boolean;
}

interface VoiceSelectorProps {
  languageCode: string;
  value: string;
  onChange: (value: string) => void;
  onVoicesLoaded?: (voices: Voice[]) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  languageCode, 
  value, 
  onChange,
  onVoicesLoaded 
}) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/voices?languageCode=${languageCode}`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setVoices(data.voices);
        onVoicesLoaded?.(data.voices);
        
        // Solo establecer valor por defecto si no hay uno seleccionado
        // y solo la primera vez que se cargan las voces
        if (!value && data.voices.length > 0 && voices.length === 0) {
          onChange(data.voices[0].name);
        }
      } catch (err) {
        console.error('Error fetching voices:', err);
        setError('Error al cargar las voces disponibles');
      } finally {
        setLoading(false);
      }
    };

    if (languageCode) {
      fetchVoices();
    }
  }, [languageCode]);

  // useEffect separado para manejar cambios en las voces disponibles
  useEffect(() => {
    // Si no hay voz seleccionada y hay voces disponibles, seleccionar la primera
    if (!value && voices.length > 0) {
      onChange(voices[0].name);
    }
  }, [voices, value, onChange]);

  if (loading) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Voice Model
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
          Loading voices...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Voice Model
        </label>
        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-1">
        Voice Model
      </label>
      <select
        id="voice"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        disabled={voices.length === 0}
      >
        {voices.length === 0 ? (
          <option>No voices available</option>
        ) : (
          voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
};

export default VoiceSelector;