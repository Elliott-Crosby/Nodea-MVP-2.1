import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BoardCanvas from "./pages/BoardCanvas";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/b/:boardId" element={<BoardCanvas />} />
        </Routes>
        <Toaster position="bottom-center" />
      </div>
    </Router>
  );
}
