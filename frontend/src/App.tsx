import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PatientRoom } from "@components/PatientRoom";
import WardDashboard from "./components/WardDashboard";
import { Navigation } from "./components/Navigation";
import { AuthProvider } from "./context/AuthProvider";
import { WardSocketProvider } from "./context/WardSocketProvider";
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show error state if not authenticated and not loading
  // This can happen if auth initialization fails after all retries
  if (!auth.isAuthenticated && !auth.isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h2>Unable to connect</h2>
        <p>
          We couldn't establish a connection. Please check that the server is
          running.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <WardSocketProvider>
      <Router>
        <Navigation />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<WardDashboard />} />
            <Route path="/patient-room" element={<PatientRoom />} />
          </Routes>
        </main>
      </Router>
    </WardSocketProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
