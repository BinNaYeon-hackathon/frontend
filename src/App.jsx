import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";
import { useState } from "react"; // 로딩 상태 관리

import logo from "./assets/logo-post-for-you.svg";
import Loading from "./components/Loading"; // 로딩 컴포넌트 가져오기

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import BrandPage from "./pages/BrandPage";
import CreatePage from "./pages/CreatePage";
import PreviewPage from "./pages/PreviewPage";

function Layout() {
  const location = useLocation();

  const isHome = location.pathname === "/";

  //전역적으로 로딩을 제어할 상태와 메시지 폰트 세팅
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // 하위 페이지들(BrandPage 등)이 로딩을 켜고 끌 수 있게 전달할 전용 만능 스위치 함수
  const triggerLoading = (show, message = "") => {
    setLoadingMessage(message);
    setGlobalLoading(show);
  };

  return (
    <div className="page" style={{ position: "relative", minHeight: "100vh" }}>
      <div
        className="app-header-container"
        style={{ position: "relative", zIndex: 1050 }}
      >
        {!isHome && <img src={logo} alt="logo" className="logo" />}

        <nav
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <Link to="/">홈</Link>
          <Link to="/dashboard">홈대시보드</Link>
          <Link to="/brand">브랜드정보</Link>
          <Link to="/create">게시글생성</Link>
          <Link to="/preview">미리보기</Link>
        </nav>
      </div>

      {/* 로딩 스위치가 켜지면 하단부 영역에만 덮어쓰기됨 */}
      {globalLoading && <Loading message={loadingMessage} />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* 각 페이지 컴포넌트에 로딩 트리거 함수를 프롭스(Props)로 배달 */}
        <Route
          path="/brand"
          element={<BrandPage triggerLoading={triggerLoading} />}
        />
        <Route
          path="/create"
          element={<CreatePage triggerLoading={triggerLoading} />}
        />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
