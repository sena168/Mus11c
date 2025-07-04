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

  // All bars have the same max height
  const barCount = 5;
  const maxBarHeight = 32; // px
  const minBarHeight = maxBarHeight * 0.2; // 6.4px

  const volumeBarRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={encodeURI('/music/ポモドーロ・ラブ - 真道もも (Pomodoro LOVE! - Mado Momo) - HMS.mp3')}
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
                    Awesome Song Title
                  </h1>
                  <p 
                    className="text-sm-regular"
                    style={{
                      color: '#a4a7ae'
                    }}
                  >
                    Amazing Artist
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
            >
              <SkipForward size={20} />
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
            >
              <Repeat size={20} />
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
            >
              <motion.div
                className="absolute top-0 left-0 h-full"
                style={{
                  width: `${volume}%`,
                  backgroundColor: '#717680',
                  borderRadius: '9999px 0px 0px 9999px'
                }}
                whileHover={{ backgroundColor: '#8b5cf6' }}
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
