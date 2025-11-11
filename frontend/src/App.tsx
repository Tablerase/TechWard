import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PatientRoom } from "@components/PatientRoom";
import WardDashboard from "./components/WardDashboard";
import { Navigation } from "./components/Navigation";

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<WardDashboard />} />
        <Route path="/patient-room" element={<PatientRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
