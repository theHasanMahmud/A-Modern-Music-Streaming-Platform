import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages
import HomePage from "./pages/home/HomePage";
import ChatPage from "./pages/chat/ChatPage";
import AdminPage from "./pages/admin/AdminPage";
import AlbumPage from "./pages/album/AlbumPage";
import SearchPage from "./pages/search/SearchPage";
import LibraryPage from "./pages/library/LibraryPage";
import LikedSongsPage from "./pages/liked-songs/LikedSongsPage";
import PlaylistPage from "./pages/playlist/PlaylistPage";
import NotFoundPage from "./pages/404/NotFoundPage";

// Auth Pages
import SignUpPage from "./pages/auth/SignUpPage";
import LoginPage from "./pages/auth/LoginPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";

// Artist Pages
import ArtistSignupPage from "./pages/artist/ArtistSignupPage";
import ArtistVerificationPage from "./pages/artist/ArtistVerificationPage";
import ArtistProfilePage from "./pages/artist/ArtistProfilePage";
import ArtistDashboardPage from "./pages/artist/ArtistDashboardPage";

// Profile Pages
import UserProfilePage from "./pages/profile/UserProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";

// Settings Page
import SettingsPage from "./pages/settings/SettingsPage";

// Landing Page
import LandingPage from "./pages/landing/LandingPage";

// Layout
import MainLayout from "./layout/MainLayout";
import AuthWrapper from "./components/AuthWrapper";
import { SidebarProvider } from "./contexts/SidebarContext";

function App() {
	return (
		<Router>
			<SidebarProvider>
				<AuthWrapper>
					<Routes>
					{/* Public Routes */}
					<Route path="/landing" element={<LandingPage />} />
					<Route path="/sign-up" element={<SignUpPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/verify-email" element={<VerifyEmailPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />
					<Route path="/oauth-callback" element={<OAuthCallbackPage />} />

					{/* Artist Routes */}
					<Route path="/artist/signup" element={<ArtistSignupPage />} />
					<Route path="/artist/verification" element={<ArtistVerificationPage />} />
					<Route path="/artist/:id" element={<ArtistProfilePage />} />
					<Route path="/artist-dashboard" element={<ArtistDashboardPage />} />

					{/* Protected Routes */}
					<Route path="/" element={<MainLayout />}>
						<Route index element={<HomePage />} />
						<Route path="chat" element={<ChatPage />} />
						<Route path="chat/:userId" element={<ChatPage />} />
						<Route path="admin" element={<AdminPage />} />
											<Route path="album/:id" element={<AlbumPage />} />
					<Route path="search" element={<SearchPage />} />
					<Route path="library" element={<LibraryPage />} />
					<Route path="liked-songs" element={<LikedSongsPage />} />
					<Route path="playlist/:id" element={<PlaylistPage />} />
					<Route path="profile/:id" element={<UserProfilePage />} />
						<Route path="profile/edit" element={<EditProfilePage />} />
						<Route path="settings" element={<SettingsPage />} />
					</Route>

					{/* Catch All */}
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</AuthWrapper>
			</SidebarProvider>
			<Toaster />
		</Router>
	);
}

export default App;
