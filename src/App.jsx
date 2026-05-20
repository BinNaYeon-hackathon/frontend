import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import HomePage from "./pages/HomePage";
import BrandPage from "./pages/BrandPage";
import CreatePage from "./pages/CreatePage";
import PreviewPage from "./pages/PreviewPage";

function App() {
  return (
    <BrowserRouter>
      <nav
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <Link to="/">홈</Link>
        <Link to="/brand">브랜드정보</Link>
        <Link to="/create">게시글생성</Link>
        <Link to="/preview">미리보기</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/brand" element={<BrandPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

