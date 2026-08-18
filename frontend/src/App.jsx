import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmailAnalyzer from "./pages/EmailAnalyzer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmailAnalyzer />} />
        <Route path="/analyzer" element={<EmailAnalyzer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;