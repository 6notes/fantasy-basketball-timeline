import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { TeamListPage } from "./pages/TeamListPage";
import { TeamPage } from "./pages/TeamPage";
import { PlayerPage } from "./pages/PlayerPage";
import { LoginPage } from "./pages/LoginPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TeamListPage />} />
        <Route path="/team/:teamKey" element={<TeamPage />} />
        <Route path="/player/:playerKey" element={<PlayerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}
