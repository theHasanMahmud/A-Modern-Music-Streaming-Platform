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
		console.log("Admin email from env:", process.env.ADMIN_EMAIL);
		
		const currentUser = await clerkClient.users.getUser(req.auth.userId);
		console.log("Current user email:", currentUser.primaryEmailAddress?.emailAddress);
		console.log("User details:", {
			id: currentUser.id,
			firstName: currentUser.firstName,
			lastName: currentUser.lastName,
			email: currentUser.primaryEmailAddress?.emailAddress
		});
		
		const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress;
		console.log("Is admin:", isAdmin);

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
