import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);

	const { currentSong, isPlaying, playNext, repeatMode } = usePlayerStore();

	// Test audio element on mount
	useEffect(() => {
		if (audioRef.current) {
			console.log('🎵 Audio element mounted successfully');
		}
	}, []);

	// handle play/pause logic
	useEffect(() => {
		console.log('🎵 AudioPlayer - isPlaying changed:', isPlaying, 'Current song:', currentSong?.title);
		
		if (!audioRef.current) {
			console.log('🎵 Audio element not ready');
			return;
		}
		
		const audio = audioRef.current;
		
		if (isPlaying) {
			console.log('🎵 Attempting to play audio...');
			console.log('🎵 Audio ready state:', audio.readyState);
			console.log('🎵 Audio network state:', audio.networkState);
			console.log('🎵 Audio src:', audio.src);
			console.log('🎵 Audio current src:', audio.currentSrc);
			
			// Force play regardless of ready state
			const playPromise = audio.play();
			
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						console.log('🎵 Audio play successful!');
					})
					.catch(error => {
						console.error('🎵 Audio play failed:', error);
						console.error('🎵 Error name:', error.name);
						console.error('🎵 Error message:', error.message);
					});
			}
		} else {
			console.log('🎵 Pausing audio...');
			audio.pause();
		}
	}, [isPlaying, currentSong]);

	// handle song ends
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			console.log('🎵 Song ended - Repeat mode:', repeatMode);
			
			// Handle repeat one mode - restart the same song
			if (repeatMode === 'one' && currentSong) {
				console.log('🔄 Repeating current song');
				if (audio) {
					audio.currentTime = 0;
					// Ensure the play state is maintained
					usePlayerStore.setState({ isPlaying: true });
					audio.play().catch(error => {
						console.error('Error restarting audio:', error);
					});
				}
			} else {
				// For other modes, use playNext logic
				console.log('⏭️ Playing next song');
				playNext();
			}
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [playNext, repeatMode, currentSong]);

	// handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentSong) {
			console.log('🎵 AudioPlayer - No audio ref or current song');
			return;
		}

		const audio = audioRef.current;

		// check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;
		if (isSongChange) {
			console.log('🎵 Loading new song:', currentSong.title, 'URL:', currentSong?.audioUrl);
			
			audio.src = currentSong?.audioUrl;
			// reset the playback position
			audio.currentTime = 0;

			prevSongRef.current = currentSong?.audioUrl;

			// Wait for audio to be ready before playing
			const handleCanPlay = () => {
				console.log('🎵 Audio ready to play - duration:', audio.duration);
				if (isPlaying) {
					const playPromise = audio.play();
					if (playPromise !== undefined) {
						playPromise
							.then(() => {
								console.log('🎵 New song playing successfully!');
							})
							.catch(error => {
								console.error('🎵 New song play failed:', error);
							});
					}
				}
				audio.removeEventListener('canplay', handleCanPlay);
			};

			audio.addEventListener('canplay', handleCanPlay);
		} else {
			console.log('🎵 Same song, no change needed');
		}
	}, [currentSong, isPlaying]);

	return (
		<audio 
			ref={audioRef} 
			preload="metadata"
			onLoadStart={() => console.log('🎵 Audio loading started')}
			onCanPlay={() => console.log('🎵 Audio can play')}
			onError={(e) => console.error('🎵 Audio error:', e)}
			onPlay={() => console.log('🎵 Audio started playing')}
			onPause={() => console.log('🎵 Audio paused')}
			onLoadedMetadata={() => console.log('🎵 Audio metadata loaded')}
			onEnded={() => console.log('🎵 Audio ended')}
		/>
	);
};
export default AudioPlayer;
