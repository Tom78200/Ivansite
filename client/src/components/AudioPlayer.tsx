declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: {
      Player: {
        new (elementId: string, config: {
          height: string | number;
          width: string | number;
          videoId: string;
          playerVars?: {
            autoplay?: number;
            controls?: number;
            loop?: number;
            playlist?: string;
          };
          events?: {
            onStateChange?: (event: { data: number }) => void;
          };
        }): {
          playVideo: () => void;
          pauseVideo: () => void;
          destroy: () => void;
        };
      };
      PlayerState: {
        PLAYING: number;
      };
    };
  }
}

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
};

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  useEffect(() => {
    // Créer un div caché pour le player YouTube
    const playerContainer = document.createElement('div');
    playerContainer.id = 'youtube-player';
    playerContainer.style.position = 'absolute';
    playerContainer.style.left = '-9999px';
    playerContainer.style.top = '-9999px';
    document.body.appendChild(playerContainer);

    // Charger l'API YouTube
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialiser le player
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: 'YRu6NK19VkQ',
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: 'YRu6NK19VkQ'
        },
        events: {
          onStateChange: (event: { data: number }) => {
            // YouTube PlayerState.PLAYING = 1
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) { // PAUSED
              setIsPlaying(false);
            }
          }
        }
      });

      setPlayer(newPlayer);
      // Certaines plateformes bloquent l'autoplay: tenter un play après un court délai
      setTimeout(() => {
        try { 
          newPlayer.playVideo();
          // Forcer l'état à true après le play
          setTimeout(() => setIsPlaying(true), 100);
        } catch {}
      }, 800);
    };

    return () => {
      if (player) {
        player.destroy();
      }
      document.body.removeChild(playerContainer);
    };
  }, []);

  const togglePlay = () => {
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.button
      onClick={togglePlay}
      className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isPlaying ? (
        <Volume2 className="w-6 h-6 text-white" />
      ) : (
        <VolumeX className="w-6 h-6 text-white" />
      )}
    </motion.button>
  );
}
