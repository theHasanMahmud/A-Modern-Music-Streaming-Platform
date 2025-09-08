import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";
import { useSettingsStore } from "./useSettingsStore";
import { useListeningHistoryStore } from "./useListeningHistoryStore";
import { fisherYatesShuffle } from "@/lib/shuffle";

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;
	isShuffled: boolean;
	repeatMode: 'off' | 'one' | 'all';
	originalQueue: Song[];

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;
	toggleShuffle: () => void;
	toggleRepeat: () => void;
	syncWithSettings: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	isShuffled: false,
	repeatMode: 'off',
	originalQueue: [],

	initializeQueue: (songs: Song[]) => {
		const { isShuffled } = get();
		let queue = songs;
		
		// If shuffle is enabled, shuffle the new queue
		if (isShuffled && songs.length > 0) {
			queue = fisherYatesShuffle(songs);
		}
		
		set({
			queue: queue,
			originalQueue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;

		const { isShuffled } = get();
		let queue = songs;
		let actualStartIndex = startIndex;
		
		// If shuffle is enabled, shuffle the new queue
		if (isShuffled && songs.length > 0) {
			queue = fisherYatesShuffle(songs);
			// Find the new index of the song we wanted to start with
			const targetSong = songs[startIndex];
			actualStartIndex = queue.findIndex(s => s._id === targetSong._id);
			if (actualStartIndex === -1) actualStartIndex = 0;
		}

		const song = queue[actualStartIndex];

		// Track listening history
		const listeningStore = useListeningHistoryStore.getState();
		listeningStore.addListeningActivity({
			songId: song._id,
			songTitle: song.title,
			artistName: song.artist,
			artistId: song.artistId,
			albumId: song.albumId,
			albumTitle: song.albumTitle,
			imageUrl: song.imageUrl,
			duration: song.duration || 0,
			completed: false,
			playCount: 1
		});

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
		}
		set({
			queue: queue,
			originalQueue: songs,
			currentSong: song,
			currentIndex: actualStartIndex,
			isPlaying: true,
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;

		// Track listening history
		const listeningStore = useListeningHistoryStore.getState();
		listeningStore.addListeningActivity({
			songId: song._id,
			songTitle: song.title,
			artistName: song.artist,
			artistId: song.artistId,
			albumId: song.albumId,
			albumTitle: song.albumTitle,
			imageUrl: song.imageUrl,
			duration: song.duration || 0,
			completed: false,
			playCount: 1
		});

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
		}

		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
		});
	},

	togglePlay: () => {
		const currentState = get();
		const willStartPlaying = !currentState.isPlaying;
		const currentSong = currentState.currentSong;

		console.log('🎵 togglePlay called:', {
			currentIsPlaying: currentState.isPlaying,
			willStartPlaying,
			currentSong: currentSong?.title
		});

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity:
					willStartPlaying && currentSong ? `Playing ${currentSong.title} by ${currentSong.artist}` : "Idle",
			});
		}

		set({
			isPlaying: willStartPlaying,
		});

		console.log('🎵 togglePlay - state updated to isPlaying:', willStartPlaying);
	},

	toggleShuffle: () => {
		const { isShuffled, originalQueue, currentSong } = get();
		const newShuffled = !isShuffled;
		
		console.log('🔀 Toggle shuffle - Current state:', isShuffled, '-> New state:', newShuffled);
		
		if (newShuffled) {
			// Proper Fisher-Yates shuffle algorithm
			const shuffledQueue = fisherYatesShuffle(originalQueue);
			const currentSongIndex = shuffledQueue.findIndex(s => s._id === currentSong?._id);
			
			console.log('🔀 Shuffled queue created, current song index:', currentSongIndex);
			
			set({
				queue: shuffledQueue,
				isShuffled: true,
				currentIndex: currentSongIndex !== -1 ? currentSongIndex : 0,
			});
		} else {
			// Restore original order
			const currentSongIndex = originalQueue.findIndex(s => s._id === currentSong?._id);
			
			console.log('🔀 Restoring original order, current song index:', currentSongIndex);
			
			set({
				queue: originalQueue,
				isShuffled: false,
				currentIndex: currentSongIndex !== -1 ? currentSongIndex : 0,
			});
		}
		
		// Sync with settings store
		const settingsStore = useSettingsStore.getState();
		settingsStore.updateAudioSettings({
			playback: {
				...settingsStore.settings.audio.playback,
				shuffle: newShuffled,
			},
		});
	},

	toggleRepeat: () => {
		const currentState = get();
		const { repeatMode } = currentState;
		let newMode: 'off' | 'one' | 'all';
		
		console.log('🔁 Toggle Repeat - Current mode:', repeatMode);
		
		switch (repeatMode) {
			case 'off':
				newMode = 'all';
				break;
			case 'all':
				newMode = 'one';
				break;
			case 'one':
				newMode = 'off';
				break;
			default:
				newMode = 'off';
		}
		
		console.log('🔁 Toggle Repeat - New mode:', newMode);
		
		// Update state immediately with the new repeat mode
		set({
			...currentState,
			repeatMode: newMode
		});
	},

	playNext: () => {
		const { currentIndex, queue, repeatMode } = get();
		const nextIndex = currentIndex + 1;

		// if there is a next song to play, let's play it
		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
				});
			}

			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
			});
		} else {
			// Handle repeat modes
			if (repeatMode === 'all') {
				// Repeat all - start from beginning
				const firstSong = queue[0];
				if (firstSong) {
					const socket = useChatStore.getState().socket;
					if (socket.auth) {
						socket.emit("update_activity", {
							userId: socket.auth.userId,
							activity: `Playing ${firstSong.title} by ${firstSong.artist}`,
						});
					}
					set({
						currentSong: firstSong,
						currentIndex: 0,
						isPlaying: true,
					});
				} else {
					set({ isPlaying: false });
				}
			} else if (repeatMode === 'one') {
				// Repeat one - restart current song
				const currentSong = get().currentSong;
				if (currentSong) {
					set({ isPlaying: true });
				} else {
					set({ isPlaying: false });
				}
			} else {
				// No repeat - stop playing
				set({ isPlaying: false });

				const socket = useChatStore.getState().socket;
				if (socket.auth) {
					socket.emit("update_activity", {
						userId: socket.auth.userId,
						activity: `Idle`,
					});
				}
			}
		}
	},
	playPrevious: () => {
		const { currentIndex, queue, repeatMode } = get();
		const prevIndex = currentIndex - 1;

		// theres a prev song
		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${prevSong.title} by ${prevSong.artist}`,
				});
			}

			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else {
			// Handle repeat modes when going backwards
			if (repeatMode === 'all') {
				// Repeat all - go to last song
				const lastSong = queue[queue.length - 1];
				if (lastSong) {
					const socket = useChatStore.getState().socket;
					if (socket.auth) {
						socket.emit("update_activity", {
							userId: socket.auth.userId,
							activity: `Playing ${lastSong.title} by ${lastSong.artist}`,
						});
					}
					set({
						currentSong: lastSong,
						currentIndex: queue.length - 1,
						isPlaying: true,
					});
				} else {
					set({ isPlaying: false });
				}
			} else if (repeatMode === 'one') {
				// Repeat one - restart current song
				const currentSong = get().currentSong;
				if (currentSong) {
					set({ isPlaying: true });
				} else {
					set({ isPlaying: false });
				}
			} else {
				// No repeat - stop playing
				set({ isPlaying: false });

				const socket = useChatStore.getState().socket;
				if (socket.auth) {
					socket.emit("update_activity", {
						userId: socket.auth.userId,
						activity: `Idle`,
					});
				}
			}
		}
	},

	syncWithSettings: () => {
		const settingsStore = useSettingsStore.getState();
		const { isShuffled, repeatMode } = get();
		const settingsShuffled = settingsStore.settings.audio.playback.shuffle;
		const settingsRepeat = settingsStore.settings.audio.playback.repeat;
		
		// Sync shuffle state if different
		if (isShuffled !== settingsShuffled) {
			set({ isShuffled: settingsShuffled });
		}
		
		// Sync repeat mode if different
		if (repeatMode !== settingsRepeat) {
			set({ repeatMode: settingsRepeat });
		}
	},
}));
