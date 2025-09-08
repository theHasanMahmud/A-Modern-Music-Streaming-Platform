import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		artist: {
			type: String,
			required: true,
		},
		featuredArtist: {
			type: String,
			required: false,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		audioUrl: {
			type: String,
			required: true,
		},
		duration: {
			type: Number, // Duration in minutes
			required: true,
		},
		genre: {
			type: String,
			enum: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Folk', 'Metal', 'Punk', 'Blues', 'Reggae', 'Indie', 'Alternative', 'EDM', 'Trap', 'Lo-Fi', 'Ambient', 'Other'],
			required: true,
		},
		mood: {
			type: String,
			enum: ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic', 'Melancholic', 'Uplifting', 'Dark', 'Peaceful', 'Angry', 'Excited', 'Calm', 'Passionate', 'Reflective', 'Playful', 'Intense', 'Dreamy', 'Confident', 'Nostalgic', 'Motivational'],
			required: false,
		},
		releaseDate: {
			type: Date,
			required: false,
			default: Date.now,
		},
		albumId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Album",
			required: false,
		},
		totalPlays: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

export const Song = mongoose.model("Song", songSchema);
