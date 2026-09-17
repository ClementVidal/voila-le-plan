import { BrowserRouter, Route, Routes } from "react-router-dom";
import MechanismView from "./MechanismView";
import EditView from "./EditView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MechanismView />} />
        <Route path="/edit" element={<EditView />} />
      </Routes>
    </BrowserRouter>
  );
}
