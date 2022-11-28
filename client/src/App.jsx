import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Register from "./components/auth/Register";
import Logout from "./components/auth/Logout";
import Home from "./components/Home";
import Login from "./components/auth/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
