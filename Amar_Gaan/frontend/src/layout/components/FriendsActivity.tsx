import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { HeadphonesIcon, Music, Users, Play, Pause, ChevronDown, ChevronUp, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useFriendStore } from "@/stores/useFriendStore";
import toast from "react-hot-toast";
import LoginModal from "@/components/LoginModal";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import FriendRequestsPanel from "@/components/FriendRequestsPanel";
import FriendsList from "@/components/FriendsList";
import { navigateToProfile } from '@/lib/profileUrl';

const FriendsActivity = () => {
	const { users, fetchUsers, onlineUsers, userActivities } = useChatStore();
	const { user } = useUser();
	const navigate = useNavigate();
	const { searchSongs } = useMusicStore();
	const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
	const { friends, getFriendsList } = useFriendStore();
	const [activeTab, setActiveTab] = useState<'activity' | 'requests' | 'friends'>('activity');
	const [isExpanded, setIsExpanded] = useState(true);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [selectedSongInfo, setSelectedSongInfo] = useState<{ title: string; imageUrl?: string } | null>(null);

	useEffect(() => {
		if (user) {
			console.log("🔄 Fetching users for:", user.id);
			fetchUsers();
			getFriendsList();
		}
	}, [fetchUsers, getFriendsList, user]);

	// Debug logging for users and activities
	useEffect(() => {
		console.log("👥 FriendsActivity - Users:", users);
		console.log("🟢 FriendsActivity - Online users:", Array.from(onlineUsers));
		console.log("📱 FriendsActivity - User activities:", Array.from(userActivities.entries()));
		console.log("👥 FriendsActivity - Friends:", friends);
	}, [users, onlineUsers, userActivities, friends]);

	const handlePlayFriendSong = async (activity: string) => {
		if (!activity || activity === "Idle") return;
		
		// Check if user is logged in
		if (!user) {
			// Extract song info for the modal
			const songInfo = activity.replace("Playing ", "");
			const [title, artist] = songInfo.split(" by ");
			setSelectedSongInfo({ title, imageUrl: undefined }); // We don't have imageUrl from activity
			setShowLoginModal(true);
			return;
		}
		
		try {
			// Extract song title and artist from activity
			const songInfo = activity.replace("Playing ", "");
			const [title, artist] = songInfo.split(" by ");
			
			if (!title || !artist) return;
			
			console.log("🎵 Searching for friend's song:", { title, artist });
			
			// Show loading toast
			const loadingToast = toast.loading(`Searching for "${title}"...`);
			
			// Search for the song in our database
			const searchResults = await searchSongs(`${title} ${artist}`);
			
			// Dismiss loading toast
			toast.dismiss(loadingToast);
			
			if (searchResults && searchResults.length > 0) {
				const song = searchResults[0];
				console.log("✅ Found song:", song);
				
				// Check if multiple people are listening to this song
				const sameSongUsers = getUsersListeningToSameSong(title);
				const isListeningParty = sameSongUsers.length > 0;
				
				// Play the song
				setCurrentSong(song);
				
				// Show success toast with listening party info
				if (isListeningParty) {
					toast.success(`🎉 Joined the listening party! Now playing: ${song.title}`, {
						icon: '🎵',
						duration: 4000,
					});
				} else {
					toast.success(`Now playing: ${song.title} by ${song.artist}`, {
						icon: '🎵',
						duration: 3000,
					});
				}
			} else {
				console.log("❌ Song not found in database");
				// Show error toast
				toast.error(`"${title}" not found in our library`, {
					icon: '❌',
					duration: 4000,
				});
			}
		} catch (error) {
			console.error("Error playing friend's song:", error);
			toast.error("Failed to play song. Please try again.");
		}
	};

	const isCurrentUserPlaying = (userId: string) => {
		// Only return true if current user is actually playing the same song
		if (!currentSong || !isPlaying) {
			console.log(`🎵 isCurrentUserPlaying(${userId}): false - currentSong: ${!!currentSong}, isPlaying: ${isPlaying}`);
			return false; // Added !isPlaying check
		}
		const activity = userActivities.get(userId);
		if (!activity || activity === "Idle") {
			console.log(`🎵 isCurrentUserPlaying(${userId}): false - activity: ${activity}`);
			return false;
		}
		
		// Extract song title from friend's activity
		const songInfo = activity.replace("Playing ", "");
		const [title] = songInfo.split(" by ");
		
		// Check if current user is playing the same song title
		const isSameSong = currentSong.title.toLowerCase() === title.toLowerCase();
		console.log(`🎵 isCurrentUserPlaying(${userId}): ${isSameSong} - comparing "${currentSong.title}" with "${title}"`);
		return isSameSong;
	};

	const getUsersListeningToSameSong = (songTitle: string) => {
		return friends.filter(friendUser => {
			const activity = userActivities.get(friendUser.clerkId);
			// Only count users who are actually playing the same song (not idle)
			return activity && 
				   activity.startsWith("Playing ") && 
				   activity.includes(songTitle) && 
				   friendUser.clerkId !== user?.id; // Exclude current user
		});
	};

	const formatSongInfo = (activity: string) => {
		if (!activity || activity === "Idle") return null;
		
		const songInfo = activity.replace("Playing ", "");
		const [title, artist] = songInfo.split(" by ");
		
		return { title, artist };
	};

	const handleProfileClick = (friendUser: any) => {
		console.log("🔗 Navigating to profile:", friendUser);
		console.log("🔗 Friend clerkId:", friendUser.clerkId);
		console.log("🔗 Navigation URL:", `/profile/${friendUser.clerkId}`);
		navigateToProfile(navigate, friendUser);
	};

	return (
		<div className='h-full bg-zinc-900 rounded-lg flex flex-col'>
			<div className='p-4 flex justify-between items-center border-b border-zinc-800'>
				<div className='flex items-center gap-2'>
					<Users className='size-5 shrink-0' />
					<h2 className='font-semibold text-sm sm:text-base'>Friends</h2>
				</div>
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className='p-1 hover:bg-zinc-800 rounded transition-colors'
					title={isExpanded ? 'Collapse section' : 'Expand section'}
				>
					{isExpanded ? (
						<ChevronUp className='size-4 text-zinc-400' />
					) : (
						<ChevronDown className='size-4 text-zinc-400' />
					)}
				</button>
			</div>

			{!user && <LoginPrompt />}

			{isExpanded && user && (
				<>
					{/* Tabs */}
					<div className="flex gap-1 p-2 bg-zinc-800/30">
						<button
							onClick={() => setActiveTab('activity')}
							className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
								activeTab === 'activity'
									? 'bg-blue-600 text-white'
									: 'text-zinc-400 hover:text-white'
							}`}
						>
							Activity
						</button>
						<button
							onClick={() => setActiveTab('requests')}
							className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
								activeTab === 'requests'
									? 'bg-blue-600 text-white'
									: 'text-zinc-400 hover:text-white'
							}`}
						>
							Requests
						</button>
						<button
							onClick={() => setActiveTab('friends')}
							className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
								activeTab === 'friends'
									? 'bg-blue-600 text-white'
									: 'text-zinc-400 hover:text-white'
							}`}
						>
							Friends
						</button>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-hidden">
						{activeTab === 'activity' && (
							<ScrollArea className='flex-1'>
								<div className='p-2 sm:p-4 space-y-2 sm:space-y-4'>
									{friends.map((friendUser) => {
										const activity = userActivities.get(friendUser.clerkId);
										// Fix: Only show as playing if activity actually contains "Playing"
										// Handle cases where activity might be undefined, empty, or not "Playing"
										const isPlaying = activity && typeof activity === 'string' && activity.startsWith("Playing ");
										const isCurrentUser = friendUser.clerkId === user?.id; // Fixed: use id from Clerk user

										// Skip current user in the friends list
										if (isCurrentUser) return null;

										return (
											<div
												key={friendUser._id}
												onClick={() => handleProfileClick(friendUser)}
												className={`cursor-pointer hover:bg-zinc-800/50 p-2 sm:p-3 rounded-md transition-colors group ${
													isCurrentUserPlaying(friendUser.clerkId) ? 'bg-emerald-900/20 border border-emerald-500/30' : ''
												}`}
											>
												<div className='flex items-start gap-2 sm:gap-3'>
													<div className='relative'>
														<Avatar className='size-8 sm:size-10 border border-zinc-800'>
															<AvatarImage src={friendUser.imageUrl} alt={friendUser.fullName} />
															<AvatarFallback>{friendUser.fullName[0]}</AvatarFallback>
														</Avatar>
														<div
															className={`absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-zinc-900 
																${onlineUsers.has(friendUser.clerkId) ? "bg-green-500" : "bg-zinc-500"}
																`}
															aria-hidden='true'
														/>
													</div>

													<div className='flex-1 min-w-0'>
																											<div className='flex items-center gap-2'>
														<span className='font-medium text-xs sm:text-sm text-white truncate'>
															{friendUser.isArtist && friendUser.artistName ? friendUser.artistName : friendUser.fullName}
														</span>
														{friendUser.isArtist && (
															<Mic className="size-3 text-blue-500" />
														)}
														{friendUser.isVerified && (
															<VerifiedBadge size="sm" />
														)}
														{isPlaying && <Music className='size-3 sm:size-3.5 text-emerald-400 shrink-0' />}
													</div>

														{isPlaying ? (
															<div className='mt-2 flex items-center gap-2'>
																<div className='flex-1 min-w-0'>
																	<div className='text-xs sm:text-sm text-white font-medium truncate'>
																		{activity.replace("Playing ", "").split(" by ")[0]}
																	</div>
																	<div className='text-xs text-zinc-400 truncate'>
																		{activity.split(" by ")[1]}
																	</div>
																	{/* Show if multiple users are listening to the same song */}
																	{(() => {
																		const songInfo = formatSongInfo(activity);
																		if (songInfo) {
																			const sameSongUsers = getUsersListeningToSameSong(songInfo.title);
																			if (sameSongUsers.length > 0) {
																				return (
																					<div className='text-xs text-emerald-400 mt-1'>
																						🎵 {sameSongUsers.length} people listening
																					</div>
																				);
																			}
																		}
																		return null;
																	})()}
																	{/* Show "You're listening too" only when actually playing the same song */}
																	{isCurrentUserPlaying(friendUser.clerkId) && (
																		<div className='text-xs text-emerald-400 mt-1 bg-emerald-900/50 px-2 py-1 rounded-full inline-block'>
																			🎵 You're listening too!
																		</div>
																	)}
																	{/* Show "Play the same song" when friend is playing but you're not */}
																	{!isCurrentUserPlaying(friendUser.clerkId) && isPlaying && (
																		<div className='text-xs text-zinc-400 mt-1 bg-zinc-800/50 px-2 py-1 rounded-full inline-block'>
																			🎧 Play the same song
																		</div>
																	)}
																</div>
																
																{/* Play Button - Always show when someone is playing */}
																<button
																	onClick={(e) => {
																		e.stopPropagation();
																		// If you're already playing the same song, toggle play/pause
																		// If not, play the friend's song
																		if (isCurrentUserPlaying(friendUser.clerkId)) {
																			console.log("🎵 Toggling play/pause of current song");
																			togglePlay(); // Toggle play/pause of current song
																		} else {
																			console.log("🎵 Playing friend's song");
																			handlePlayFriendSong(activity); // Play friend's song
																		}
																	}}
																	className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
																		isCurrentUserPlaying(friendUser.clerkId)
																			? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
																			: 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white'
																	}`}
																	title={(() => {
																		const songInfo = formatSongInfo(activity);
																		if (songInfo) {
																			const sameSongUsers = getUsersListeningToSameSong(songInfo.title);
																			if (sameSongUsers.length > 0) {
																				return `Join listening party with ${sameSongUsers.length} people!`;
																			}
																		}
																		// Show different text based on whether you're already playing the same song
																		return isCurrentUserPlaying(friendUser.clerkId) 
																			? (isPlaying ? "Pause your music" : "Resume your music") 
																			: "Play this song";
																	})()}
																>
																	{isCurrentUserPlaying(friendUser.clerkId) ? (
																		// Show pause if current user is playing, play if paused
																		// Use isPlaying from player store (current user's state)
																		isPlaying ? <Pause className='size-3 sm:size-4' /> : <Play className='size-3 sm:size-4' />
																	) : (
																		<Play className='size-3 sm:size-4' />
																	)}
																</button>
															</div>
														) : (
															<div className='mt-1 text-xs text-zinc-400'>
																{activity === "Idle" || !activity ? "Idle" : activity}
															</div>
														)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</ScrollArea>
						)}

						{activeTab === 'requests' && (
							<div className="p-2">
								<FriendRequestsPanel />
							</div>
						)}

						{activeTab === 'friends' && (
							<div className="p-2">
								<FriendsList />
							</div>
						)}
					</div>
				</>
			)}

			{/* Login Modal */}
			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
				songTitle={selectedSongInfo?.title || "Music"}
				albumCover={selectedSongInfo?.imageUrl}
			/>
		</div>
	);
};
export default FriendsActivity;

const LoginPrompt = () => (
	<div className='h-full flex flex-col items-center justify-center p-6 text-center space-y-4'>
		<div className='relative'>
			<div
				className='absolute -inset-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full blur-lg
       opacity-75 animate-pulse'
				aria-hidden='true'
			/>
			<div className='relative bg-zinc-900 rounded-full p-4'>
				<HeadphonesIcon className='size-8 text-emerald-400' />
			</div>
		</div>

		<div className='space-y-2 max-w-[250px]'>
			<h3 className='text-lg font-semibold text-white'>See What Friends Are Playing</h3>
			<p className='text-sm text-zinc-400'>Login to discover what music your friends are enjoying right now</p>
		</div>
	</div>
);
