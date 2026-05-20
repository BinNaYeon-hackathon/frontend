import { useState } from "react";
import "./PreviewPage.css";
import InstagramPost from "../components/InstagramPost.jsx";
import sampleImage from "../assets/post-image-sample.png";
import XPost from "../components/XPost.jsx";
import LinkedInPost from "../components/LinkedInPost.jsx";

function PreviewPage() {
  const [tab, setTab] = useState("instagram");
  const [content, setContent] = useState(
    `Flyer design for Workspace 51.
텍스트 수정 가능`,
  );

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
              <InstagramPost
                brandName="yournamehere"
                createdAt={new Date()}
                content={content}
                setContent={setContent}
                images={[sampleImage, sampleImage]}
              />
            </div>
          )}

          {tab === "x" && (
            <div>
              <XPost
                brandName="yournamehere"
                createdAt={new Date()}
                content={content}
                setContent={setContent}
                images={[sampleImage, sampleImage]}
              />
            </div>
          )}

          {tab === "linkedin" && (
            <div>
              <LinkedInPost
                brandName="yournamehere"
                createdAt={new Date()}
                content={content}
                setContent={setContent}
                images={[sampleImage, sampleImage]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewPage;
