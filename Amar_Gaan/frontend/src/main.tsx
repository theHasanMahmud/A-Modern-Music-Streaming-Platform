import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import AuthProvider from "./providers/AuthProvider.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("🚀 App starting...");
console.log("🔑 Clerk Key:", PUBLISHABLE_KEY ? "Present" : "Missing");
console.log("🌍 Environment:", import.meta.env.MODE);
console.log("🔗 API Base URL:", import.meta.env.VITE_API_BASE_URL);

if (!PUBLISHABLE_KEY) {
	console.error("❌ Missing Publishable Key");
	throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider 
			publishableKey={PUBLISHABLE_KEY} 
			afterSignOutUrl="/landing"
		>
			<AuthProvider>
				<App />
			</AuthProvider>
		</ClerkProvider>
	</StrictMode>
);
