import React from "react";
import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import AboutTeam from "./pages/About";
import Contact from "./pages/Contact";
import ChatPage from "./pages/Chat";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import SocialCallback from "./pages/SocialCallback";
import VerifyEmailPage from "./pages/VerifyEmail";

const ChatComponent = ChatPage as unknown as React.ComponentType<any>;

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<AboutTeam />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/chat" element={<ChatComponent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<SocialCallback />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
