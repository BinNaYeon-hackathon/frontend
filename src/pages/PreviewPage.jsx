import { useState } from "react";
import "./PreviewPage.css";

function PreviewPage() {
  const [tab, setTab] = useState("instagram");

  return (
    <div className="preview-page">
      <div className="preview-header">
        <h2>게시물 생성 완료</h2>
        <p>클릭하여 텍스트를 수정하세요</p>
      </div>
      <div className="preview-card">
        <div className="tab-bar">
          <button
            className={tab === "instagram" ? "tab-button active" : "tab-button"}
            onClick={() => setTab("instagram")}
          >
            Instagram
          </button>

          <button
            className={tab === "x" ? "tab-button active" : "tab-button"}
            onClick={() => setTab("x")}
          >
            X
          </button>

          <button
            className={tab === "linkedin" ? "tab-button active" : "tab-button"}
            onClick={() => setTab("linkedin")}
          >
            LinkedIn
          </button>
        </div>
        <div className="preview-content">
          {tab === "instagram" && (
            <div>
              <h2>Instagram Preview</h2>
            </div>
          )}

          {tab === "x" && (
            <div>
              <h2>X Preview</h2>
            </div>
          )}

          {tab === "linkedin" && (
            <div>
              <h2>LinkedIn Preview</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewPage;
