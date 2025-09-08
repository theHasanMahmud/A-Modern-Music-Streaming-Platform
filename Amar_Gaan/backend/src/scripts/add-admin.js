import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const addAdmin = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		const email = process.argv[2];
		if (!email) {
			console.log("Usage: node add-admin.js <email>");
			process.exit(1);
		}

		const user = await User.findOne({ clerkId: { $exists: true } });
		if (!user) {
			console.log("No users found in database. Please ensure users have signed up first.");
			process.exit(1);
		}

		console.log("Available users:");
		const users = await User.find({}).select('fullName clerkId');
		users.forEach((u, index) => {
			console.log(`${index + 1}. ${u.fullName} (ID: ${u._id})`);
		});

		console.log("\nTo add an admin, use the API endpoint:");
		console.log(`POST /admin/admins/{userId}`);
		console.log("Or manually update a user in the database:");
		console.log("db.users.updateOne({_id: ObjectId('USER_ID')}, {$set: {isAdmin: true}})");

	} catch (error) {
		console.error("Error:", error);
	} finally {
		await mongoose.disconnect();
	}
};

addAdmin();
