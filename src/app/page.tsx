'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2,
  Music,
  Loader2
} from 'lucide-react';

type PlayerState = 'playing' | 'paused' | 'loading';

const MusicPlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>('paused');
  const [progress, setProgress] = useState(30); // 30% progress
  const [volume, setVolume] = useState(75); // 75% volume

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

  // Individual bar heights as per Figma design
  const barHeights = [32, 18, 12, 24, 16]; // px values for each bar

  // Equalizer bar animation variants with individual heights
  const createBarVariants = (maxHeight: number): Variants => ({
    playing: {
      height: [maxHeight * 0.2, maxHeight, maxHeight * 0.2], // 20% to 100% and back
      backgroundColor: '#8b5cf6',
      opacity: 1,
      transition: {
        height: {
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }
      }
    },
    paused: {
      height: maxHeight * 0.2, // 20% of max height when paused - STOP all animation
      backgroundColor: '#8b5cf6',
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: 'easeOut' // Smooth transition to paused state
      }
    },
    loading: {
      height: maxHeight * 0.5, // 50% of max height when loading
      backgroundColor: '#8b5cf6',
      opacity: 0.5,
      transition: { 
        duration: 0.3,
        ease: 'easeOut' 
      }
    }
  });

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
                  <img
                    src="/AlbumArt.png"
                    alt="Album Art"
                    className="absolute"
                    style={{
                      top: '30px',
                      left: '36px',
                      width: '48px',
                      height: '48px',
                      objectFit: 'contain'
                    }}
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
                    height: '32px', // Fixed height container (tallest bar) to prevent layout shifts
                    width: '56px',  // Fixed width per Figma: 5 bars (8px each) + 4 gaps (4px each)
                    gap: '4px'      // 4px gap between bars as per Figma design
                  }}
                >
                  {barHeights.map((height, index) => (
                    <motion.div
                      key={index}
                      style={{
                        width: '8px',
                        backgroundColor: '#8b5cf6'
                      }}
                      variants={createBarVariants(height)}
                      animate={playerState}
                      transition={{
                        delay: index * 0.1 // Stagger effect - 100ms between bars
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

          {/* Progress Bar */}
          <div 
            className="relative rounded-full overflow-hidden"
            style={{
              height: '8px',
              backgroundColor: '#252b37',
              marginTop: '8px'
            }}
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
              style={{
                color: '#717680'
              }}
            >
              1:23
            </span>
            <span 
              className="text-xs-regular"
              style={{
                color: '#717680'
              }}
            >
              3:45
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
                    <Loader2 size={24} className="text-white animate-spin" />
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
              className="flex-1 relative rounded-full overflow-hidden"
              style={{
                height: '4px',
                backgroundColor: '#252b37'
              }}
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
