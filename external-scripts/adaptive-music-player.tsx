import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Wifi, Signal } from 'lucide-react';

const AdaptiveMusicPlayer = () => {
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [connectionType, setConnectionType] = useState('unknown');
  const audioRef = useRef(null);

  // Sample playlist - replace with your actual songs
  const playlist = [
    { id: 1, title: "Song One", artist: "Artist One", filename: "song1" },
    { id: 2, title: "Song Two", artist: "Artist Two", filename: "song2" },
    { id: 3, title: "Song Three", artist: "Artist Three", filename: "song3" },
  ];

  // Cloud providers configuration
  const providers = {
    fast: [
      { name: 'cf1', url: 'https://music1.yourdomain.com', limit: 10 },
      { name: 'cf2', url: 'https://music2.yourdomain.com', limit: 10 },
    ],
    generous: [
      { name: 'oracle', url: 'https://oracle-bucket.region.oci.customer-oci.com', limit: 10000 },
    ]
  };

  // Quality configurations
  const qualityConfig = {
    low: { bitrate: '64kbps', size: '~2MB', label: 'Low (Save Data)' },
    medium: { bitrate: '128kbps', size: '~4MB', label: 'Medium (Recommended)' },
    high: { bitrate: '320kbps', size: '~10MB', label: 'High (Best Quality)' }
  };

  // Detect connection type
  useEffect(() => {
    const detectConnection = () => {
      if ('connection' in navigator) {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
          setConnectionType(conn.effectiveType || 'unknown');
          
          // Auto-select quality based on connection
          const autoQuality = {
            'slow-2g': 'low',
            '2g': 'low',
            '3g': 'medium',
            '4g': 'high',
            'wifi': 'high'
          }[conn.effectiveType] || 'medium';
          
          setQuality(autoQuality);
        }
      }
    };

    detectConnection();
    
    // Listen for connection changes
    if ('connection' in navigator) {
      navigator.connection?.addEventListener('change', detectConnection);
      return () => navigator.connection?.removeEventListener('change', detectConnection);
    }
  }, []);

  // Smart provider selection
  const selectProvider = (songId, isPopular = false) => {
    // For demo, assume songs with id > 2 are popular
    const popular = isPopular || songId > 2;
    
    if (popular) {
      // Popular songs go to generous providers to save fast provider bandwidth
      return providers.generous[0];
    } else {
      // New songs get fast delivery
      return providers.fast[songId % providers.fast.length];
    }
  };

  // Generate song URL with quality and provider selection
  const getSongUrl = (song) => {
    const provider = selectProvider(song.id);
    return `${provider.url}/${song.filename}_${quality}.mp3`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setLoading(true);
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle song change
  const changeSong = (newIndex) => {
    if (newIndex >= 0 && newIndex < playlist.length) {
      setCurrentSong(newIndex);
      setCurrentTime(0);
      setLoading(true);
      
      // Reset audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      setIsPlaying(false);
    }
  };

  // Handle quality change
  const changeQuality = (newQuality) => {
    const wasPlaying = isPlaying;
    const currentTimeBackup = currentTime;
    
    setQuality(newQuality);
    setLoading(true);
    
    // If audio was playing, restart at same position
    if (audioRef.current && wasPlaying) {
      audioRef.current.pause();
      setTimeout(() => {
        audioRef.current.currentTime = currentTimeBackup;
        audioRef.current.play();
      }, 100);
    }
  };

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleCanPlay = () => {
    setLoading(false);
  };

  const handleEnded = () => {
    // Auto-play next song
    if (currentSong < playlist.length - 1) {
      changeSong(currentSong + 1);
    } else {
      setIsPlaying(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get connection icon
  const getConnectionIcon = () => {
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return <Signal className="w-4 h-4 text-red-500" />;
      case '3g':
        return <Signal className="w-4 h-4 text-yellow-500" />;
      case '4g':
        return <Signal className="w-4 h-4 text-green-500" />;
      default:
        return <Wifi className="w-4 h-4 text-blue-500" />;
    }
  };

  const currentSongData = playlist[currentSong];

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header with connection info */}
      <div className="p-4 bg-black bg-opacity-20 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {getConnectionIcon()}
          <span className="text-xs opacity-75">
            {connectionType.toUpperCase()} - {qualityConfig[quality].label}
          </span>
        </div>
        <div className="text-xs opacity-75">
          Provider: {selectProvider(currentSongData.id).name}
        </div>
      </div>

      {/* Song Info */}
      <div className="p-6 text-center">
        <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
          <Volume2 className="w-16 h-16 text-white opacity-80" />
        </div>
        
        <h2 className="text-xl font-bold mb-2">{currentSongData.title}</h2>
        <p className="text-purple-200 mb-4">{currentSongData.artist}</p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-purple-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 opacity-75">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-center space-x-6 mb-4">
          <button
            onClick={() => changeSong(currentSong - 1)}
            disabled={currentSong === 0}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 transition-all"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button
            onClick={togglePlay}
            disabled={loading}
            className="p-4 rounded-full bg-purple-600 hover:bg-purple-700 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          
          <button
            onClick={() => changeSong(currentSong + 1)}
            disabled={currentSong === playlist.length - 1}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 transition-all"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Quality Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2">Audio Quality:</label>
          <select
            value={quality}
            onChange={(e) => changeQuality(e.target.value)}
            className="w-full bg-black bg-opacity-30 border border-purple-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-300"
          >
            {Object.entries(qualityConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label} - {config.bitrate} ({config.size})
              </option>
            ))}
          </select>
        </div>

        {/* Playlist */}
        <div>
          <label className="block text-xs font-medium mb-2">Playlist:</label>
          <div className="space-y-1">
            {playlist.map((song, index) => (
              <button
                key={song.id}
                onClick={() => changeSong(index)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  index === currentSong
                    ? 'bg-purple-600 text-white'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                }`}
              >
                <div className="font-medium">{song.title}</div>
                <div className="text-xs opacity-75">{song.artist}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={getSongUrl(currentSongData)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        preload="metadata"
      />
    </div>
  );
};

export default AdaptiveMusicPlayer;