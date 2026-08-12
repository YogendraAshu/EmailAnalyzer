import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmailAnalyzer from "./pages/EmailAnalyzer";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/analyzer" element={<EmailAnalyzer />} />
        {/*Protected route */}

        <Route element={<ProtectedRoute/>}>
        <Route
        path="/analyzer"
        element={<EmailAnalyzer/>}
        />
        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;