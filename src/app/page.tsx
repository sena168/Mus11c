'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1,
  Volume2,
  Loader2
} from 'lucide-react';
import Image from 'next/image';

type PlayerState = 'playing' | 'paused' | 'loading';

const MusicPlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>('paused');
  const [progress, setProgress] = useState(30); // 30% progress
  const [volume, setVolume] = useState(75); // 75% volume
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVolumeHover, setIsVolumeHover] = useState(false);
  const [loopMode, setLoopMode] = useState<'off' | 'all' | 'one'>('off');

  // All bars have the same max height
  const barCount = 5;
  const maxBarHeight = 32; // px
  const minBarHeight = maxBarHeight * 0.2; // 6.4px

  const volumeBarRef = useRef<HTMLDivElement>(null);

  // Track list with placeholder data
  const tracks = [
    { id: 1, src: '/music/Tersirat di Balik Senyuman - Brunetta Gondola.mp3', title: 'Tersirat di Balik Senyuman', artist: 'Brunetta Gondola' },
    { id: 2, src: '/music/ポモドーロ・ラブ - 真道もも (Pomodoro LOVE! - Mado Momo) - HMS.mp3', title: 'ポモドーロ・ラブ - 真道もも (Pomodoro LOVE! - Mado Momo)', artist: '真道もも (Mado Momo)' },
    { id: 3, src: '/music/Nur Wenn Ich Will (AI-Prinz) - HMS.mp3', title: 'Nur Wenn Ich Will (AI-Prinz)', artist: 'HMS' },
    { id: 4, src: '/music/🔥 _I Am the Dream Dreaming Me_ - HMS.mp3', title: '🔥 _I Am the Dream Dreaming Me_ ', artist: 'HMS' },
    { id: 5, src: '/music/「冬の神話 (Fuyu no Shinwa) — Winter Myth」 - HMS.mp3', title: '「冬の神話 (Fuyu no Shinwa) — Winter Myth」', artist: 'HMS' },
{ id: 6, src: '/music/A Morning Hum - HMS.mp3', title: 'A Morning Hum', artist: 'HMS' },
{ id: 7, src: '/music/🌸 花の香りに (Hana no Kaori ni) 🌸 Glam Rock Live.mp3', title: '🌸 花の香りに (Hana no Kaori ni) 🌸 Glam Rock Live', artist: '差乃間・ミッチ' },
{ id: 8, src: '/music/A Morning Hum (Remix) - HMS.mp3', title: 'A Morning Hum (Remix)', artist: 'HMS' },
{ id: 9, src: '/music/🌸 花の香りに (Hana no Kaori ni) 🌸 - 花野かおり.mp3', title: '🌸 花の香りに (Hana no Kaori ni) 🌸', artist: '花野かおり' },
{ id: 10, src: '/music/Debugin Hidup - HMS.mp3', title: 'Debugin Hidup', artist: 'HMS' },
];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const currentTrack = tracks[currentTrackIndex];

  // Simulate loading delay when changing states
  const handlePlayPause = () => {
    if (playerState === 'loading') return; // Prevent multiple clicks during loading
    
    // Determine the next state based on CURRENT state (before loading)
    const nextState = playerState === 'playing' ? 'paused' : 'playing';
    
    setPlayerState('loading');
    setTimeout(() => {
      setPlayerState(nextState);
    }, 500);
  };

  // Update progress as audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      setCurrentTime(audio.currentTime || 0);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    const setAudioDuration = () => setDuration(audio.duration || 0);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioDuration);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
    };
  }, []);

  // Play/pause audio when playerState changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playerState === 'playing') {
      audio.play();
    } else if (playerState === 'paused') {
      audio.pause();
    }
  }, [playerState]);

  // Seek handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    audio.currentTime = percent * duration;
    setProgress(percent * 100);
  };

  // Volume handler
  const handleVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = volumeBarRef.current;
    if (!audio || !bar) return;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let percent = x / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    audio.volume = percent;
    setVolume(percent * 100);
  };

  // Handle next/prev/loop
  const handleNext = () => {
    if (playerState === 'playing') {
      setPlayerState('loading');
      setTimeout(() => {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        setPlayerState('playing');
      }, 500);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
  };
  const handlePrev = () => {
    if (playerState === 'playing') {
      setPlayerState('loading');
      setTimeout(() => {
        setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        setPlayerState('playing');
      }, 500);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
  };
  const handleLoopToggle = () => {
    setLoopMode((prev) => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };

  // Auto-advance or loop on track end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      if (loopMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (loopMode === 'all') {
        if (currentTrackIndex === tracks.length - 1) {
          setCurrentTrackIndex(0);
          setPlayerState('playing');
        } else {
          handleNext();
        }
      } else {
        // loopMode === 'off'
        if (currentTrackIndex < tracks.length - 1) {
          handleNext();
        } else {
          setPlayerState('paused');
        }
      }
    };
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [loopMode, tracks.length, currentTrackIndex, playerState]);

  // Container animation variants
  const containerVariants: Variants = {
    playing: {
      backgroundColor: '#1a1a1a',
      boxShadow: '0px 4px 20px rgba(168, 114, 250, 0.5), 0px 10px 40px rgba(168, 114, 250, 0.3), 0px 0px 80px rgba(168, 114, 250, 0.1)',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    paused: {
      backgroundColor: '#0f0f0f',
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.6), 0px 10px 40px rgba(0, 0, 0, 0.4)',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    loading: {
      backgroundColor: '#0f0f0f',
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.6), 0px 10px 40px rgba(0, 0, 0, 0.4)',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  // Album artwork animation variants
  const albumVariants: Variants = {
    playing: {
      scale: 1,
      opacity: 1,
      rotate: [0, 360],
      transition: {
        scale: { duration: 0.3, type: 'spring' },
        opacity: { duration: 0.3 },
        rotate: { 
          duration: 20, 
          ease: 'linear', 
          repeat: Infinity,
          repeatType: 'loop'
        }
      }
    },
    paused: {
      scale: 0.95,
      opacity: 1,
      rotate: 0, // Return to original position
      transition: {
        scale: { duration: 0.3, type: 'spring' },
        opacity: { duration: 0.3 },
        rotate: { duration: 0.5, ease: 'easeOut' } // Smooth return to 0
      }
    },
    loading: {
      scale: 0.9,
      opacity: 0.5,
      rotate: 0, // Stop rotation, return to original position
      transition: {
        scale: { duration: 0.3, type: 'spring' },
        opacity: { duration: 0.3 },
        rotate: { duration: 0.3, ease: 'easeOut' }
      }
    }
  };

  // Equalizer bar animation variants (all bars same height)
  const barVariants: Variants = {
    playing: (custom: number) => ({
      height: [minBarHeight, maxBarHeight, minBarHeight],
      backgroundColor: '#8b5cf6',
      opacity: 1,
      transition: {
        height: {
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: custom * 0.1
        }
      }
    }),
    paused: {
      height: minBarHeight,
      backgroundColor: '#8b5cf6',
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    loading: {
      height: maxBarHeight * 0.5,
      backgroundColor: '#8b5cf6',
      opacity: 0.5,
      transition: { 
        duration: 0.3,
        ease: 'easeOut' 
      }
    }
  };

  // Play button variants
  const playButtonVariants: Variants = {
    playing: {
      backgroundColor: '#8b5cf6',
      scale: 1,
      transition: { duration: 0.3 }
    },
    paused: {
      backgroundColor: '#8b5cf6',
      scale: 1,
      transition: { duration: 0.3 }
    },
    loading: {
      backgroundColor: '#6b7280',
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  // When currentTrackIndex changes and playerState is playing, always play the new track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playerState === 'playing') {
      audio.play();
    }
  }, [currentTrackIndex, playerState]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="auto"
      />
      <motion.div
        className="relative rounded-2xl w-full"
        style={{
          maxWidth: '500px',
          backgroundColor: '#0f0f0f',
          padding: '16px'
        }}
        variants={containerVariants}
        animate={playerState}
        initial="paused"
      >
        <div className="flex flex-col">
          {/* Song Info Section - Album Art + Text + Equalizer as a single block */}
          <div className="flex flex-col" style={{paddingBottom: '20px'}}>
            {/* Album Art + Song Details Row */}
            <div className="flex items-center" style={{ gap: '24px' }}>
              {/* Album Artwork */}
              <motion.div
                className="relative flex-shrink-0 overflow-hidden"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '12px',
                  background: 'linear-gradient(127.48deg, #7c3aed, #db2777)'
                }}
                variants={albumVariants}
                animate={playerState}
              >
                <Image
                  src="/AlbumArt.png"
                  alt="Album Art"
                  style={{
                    position: 'absolute',
                    top: '30px',
                    left: '36px',
                    objectFit: 'contain'
                  }}
                  width={48}
                  height={48}
                  priority
                />
              </motion.div>
              {/* Right side - Song Details */}
              <div className="flex-1 flex flex-col justify-start">
                <div className="flex flex-col" style={{ gap: '4px' }}>
                  <h1 
                    className="text-lg-semibold"
                    style={{
                      color: '#f5f5f5'
                    }}
                  >
                    {currentTrack.title}
                  </h1>
                  <p 
                    className="text-sm-regular"
                    style={{
                      color: '#a4a7ae'
                    }}
                  >
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
            </div>
            {/* Equalizer Bars Row (directly below album art + text) */}
            <div className="flex justify-start" style={{ paddingLeft: '144px', marginTop: '20px' }}>
              <div 
                className="flex items-end justify-start"
                style={{
                  height: `${maxBarHeight}px`,
                  width: '56px',
                  gap: '4px'
                }}
              >
                {Array.from({ length: barCount }).map((_, index) => (
                  <motion.div
                    key={index}
                    style={{
                      width: '8px',
                      backgroundColor: '#8b5cf6'
                    }}
                    variants={barVariants}
                    custom={index}
                    animate={playerState}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div 
            className="relative rounded-full overflow-hidden cursor-pointer"
            style={{
              height: '8px',
              backgroundColor: '#252b37',
              marginTop: '8px'
            }}
            onClick={handleSeek}
          >
            <motion.div
              className="absolute top-0 left-0 h-full"
              style={{
                borderRadius: '9999px 0px 0px 9999px',
                backgroundColor: playerState === 'playing' ? '#8b5cf6' : '#717680',
                width: `${progress}%`,
                opacity: playerState === 'loading' ? 0.5 : 1
              }}
              initial={{ width: '30%' }}
              animate={{ 
                width: `${progress}%`,
                backgroundColor: playerState === 'playing' ? '#8b5cf6' : '#717680',
                opacity: playerState === 'loading' ? 0.5 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Time Info */}
          <div className="flex justify-between items-center" style={{ marginTop: '16px' }}>
            <span 
              className="text-xs-regular"
              style={{ color: '#717680' }}
            >
              {formatTime(currentTime)}
            </span>
            <span 
              className="text-xs-regular"
              style={{ color: '#717680' }}
            >
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center" style={{ gap: '16px', marginTop: '16px' }}>
            <motion.button
              className="flex items-center justify-center"
              style={{ 
                color: '#717680',
                borderRadius: '8px',
                padding: '8px'
              }}
              whileHover={{ 
                scale: 1.05,
                color: '#ffffff',
                transition: { type: 'spring', stiffness: 400, damping: 25 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { type: 'spring', stiffness: 400, damping: 25 }
              }}
            >
              <Shuffle size={20} />
            </motion.button>

            <motion.button
              className="flex items-center justify-center"
              style={{ 
                color: '#717680',
                borderRadius: '8px',
                padding: '8px'
              }}
              whileHover={{ 
                scale: 1.05,
                color: '#ffffff',
                transition: { type: 'spring', stiffness: 400, damping: 25 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { type: 'spring', stiffness: 400, damping: 25 }
              }}
              onClick={handlePrev}
            >
              <SkipBack size={20} />
            </motion.button>

            {/* Play/Pause Button */}
            <motion.button
              className="rounded-full flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px'
              }}
              variants={playButtonVariants}
              animate={playerState}
              whileHover={{ 
                scale: 1.05,
                transition: { type: 'spring', stiffness: 400, damping: 25 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { type: 'spring', stiffness: 400, damping: 25 }
              }}
              onClick={handlePlayPause}
              disabled={playerState === 'loading'}
            >
              <AnimatePresence mode="wait">
                {playerState === 'loading' ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Loader2 size={24} className="text-white animate-spin" />
                    </motion.div>
                  </motion.div>
                ) : playerState === 'playing' ? (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Pause size={24} className="text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Play size={24} className="text-white" style={{ marginLeft: '2px' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              className="flex items-center justify-center"
              style={{ 
                color: '#717680',
                borderRadius: '8px',
                padding: '8px'
              }}
              whileHover={{ 
                scale: 1.05,
                color: '#ffffff',
                transition: { type: 'spring', stiffness: 400, damping: 25 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { type: 'spring', stiffness: 400, damping: 25 }
              }}
              onClick={handleNext}
            >
              <SkipForward size={20} />
            </motion.button>

            <motion.button
              className="flex items-center justify-center"
              style={{ 
                color: loopMode !== 'off' ? '#8b5cf6' : '#717680',
                borderRadius: '8px',
                padding: '8px',
                backgroundColor: loopMode !== 'off' ? 'rgba(139,92,246,0.1)' : 'transparent',
                border: loopMode !== 'off' ? '1px solid #8b5cf6' : 'none'
              }}
              whileHover={{ 
                scale: 1.05,
                color: '#ffffff',
                transition: { type: 'spring', stiffness: 400, damping: 25 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { type: 'spring', stiffness: 400, damping: 25 }
              }}
              onClick={handleLoopToggle}
              title={loopMode === 'off' ? 'Loop Off' : loopMode === 'all' ? 'Loop All' : 'Loop One'}
            >
              {loopMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </motion.button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2" style={{ marginTop: '16px' }}>
            <Volume2 size={16} style={{ color: '#717680' }} />
            <div
              ref={volumeBarRef}
              className="flex-1 relative rounded-full overflow-hidden cursor-pointer"
              style={{
                height: '4px',
                backgroundColor: '#252b37'
              }}
              onClick={handleVolume}
              onMouseEnter={() => setIsVolumeHover(true)}
              onMouseLeave={() => setIsVolumeHover(false)}
            >
              <motion.div
                className="absolute top-0 left-0 h-full"
                style={{
                  width: `${volume}%`,
                  backgroundColor: isVolumeHover ? '#8b5cf6' : '#717680',
                  borderRadius: '9999px 0px 0px 9999px'
                }}
                animate={{ backgroundColor: isVolumeHover ? '#8b5cf6' : '#717680' }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Home = () => {
  return <MusicPlayer />;
};

export default Home;

// Helper to format time
function formatTime(sec: number) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
