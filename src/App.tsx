import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import AboutTeam from "./pages/About";
import Contact from "./pages/Contact";
import ChatPage from "./pages/Chat";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import SocialCallback from "./pages/SocialCallback";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<AboutTeam />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<SocialCallback />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
