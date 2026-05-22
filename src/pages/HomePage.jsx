import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import logo from "../assets/logo-post-for-you.svg";

import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="home-page">
      <div className="home-logo-image">
        <img src={logo} alt="logo" className="home-logo" />
      </div>
      <div className="home-submit">
        <Button
          text="시작하기"
          size="large"
          onClick={() => navigate("/brand")}
        />
      </div>
    </div>
  );
}

export default HomePage;
