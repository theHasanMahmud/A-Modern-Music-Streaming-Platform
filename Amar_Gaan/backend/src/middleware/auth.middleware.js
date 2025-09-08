import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
	console.log("=== PROTECT ROUTE DEBUG ===");
	console.log("Request URL:", req.url);
	console.log("Request method:", req.method);
	console.log("Auth user ID:", req.auth?.userId);
	console.log("Auth object:", req.auth);
	
	if (!req.auth.userId) {
		console.log("❌ No user ID in auth");
		return res.status(401).json({ message: "Unauthorized - you must be logged in" });
	}
	
	console.log("✅ User authenticated, proceeding...");
	next();
};

export const requireAdmin = async (req, res, next) => {
	try {
		console.log("=== ADMIN MIDDLEWARE DEBUG ===");
		console.log("User ID:", req.auth.userId);
		console.log("Admin emails from env:", process.env.ADMIN_EMAILS);
		
		const currentUser = await clerkClient.users.getUser(req.auth.userId);
		console.log("Current user email:", currentUser.primaryEmailAddress?.emailAddress);
		console.log("User details:", {
			id: currentUser.id,
			firstName: currentUser.firstName,
			lastName: currentUser.lastName,
			email: currentUser.primaryEmailAddress?.emailAddress
		});
		
		// Check environment variable admins (backward compatibility)
		const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
		const isEnvAdmin = adminEmails.includes(currentUser.primaryEmailAddress?.emailAddress);
		
		// Check database admin status
		const { User } = await import("../models/user.model.js");
		const dbUser = await User.findOne({ clerkId: req.auth.userId });
		const isDbAdmin = dbUser?.isAdmin || false;
		
		const isAdmin = isEnvAdmin || isDbAdmin;
		console.log("Is admin (env):", isEnvAdmin);
		console.log("Is admin (db):", isDbAdmin);
		console.log("Is admin (final):", isAdmin);

		if (!isAdmin) {
			console.log("❌ User is not admin");
			return res.status(403).json({ message: "Unauthorized - you must be an admin" });
		}

		console.log("✅ User is admin, proceeding...");
		next();
	} catch (error) {
		console.error("❌ Error in requireAdmin middleware:", error);
		next(error);
	}
};
