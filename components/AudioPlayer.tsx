import React, { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioBase64: string | null;
  onPlay?: () => void;
  onStop?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioBase64, 
  onPlay,
  onStop 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (audioRef.current && audioBase64) {
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;

      return () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioBase64]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleAudioEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onStop?.();
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleAudioEnd);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, [audioBase64]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onStop?.();
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    if (!audioBase64) return;
    
    const audioBlob = new Blob(
      [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))],
      { type: 'audio/mp3' }
    );
    const audioUrl = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'generated-audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(audioUrl);
  };

  if (!audioBase64) {
    return null;
  }

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm md:text-base font-medium text-gray-900">Generated Audio</h3>
        <div className="flex gap-2">
          <button
            onClick={togglePlay}
            className=" text-sm md:text-base px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <button
            onClick={downloadAudio}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download
          </button>
        </div>
      </div>
      
      <div className="mt-2">
        <div className="flex items-center text-sm text-gray-500 mb-1">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 mx-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default AudioPlayer;