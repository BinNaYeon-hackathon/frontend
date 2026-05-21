import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./PreviewPage.css";

import InstagramPost from "../components/InstagramPost";
import XPost from "../components/XPost";
import LinkedInPost from "../components/LinkedInPost";
import Button from "../components/Button";

function PreviewPage() {
  const [tab, setTab] = useState("instagram");

  const [project, setProject] = useState(null);

  const navigate = useNavigate();

  // 데이터 fetch 예시
  useEffect(() => {
    async function fetchPosts() {
      // const response = await fetch("/api/posts");
      // const data = await response.json();
      const data = {
        success: true,
        message: "",

        data: [
          {
            platform: "instagram",
            brand_name: "나이키",
            post_date: "2026-05-20",
            body: "신제품 출시 안내입니다.",
            hashtags: ["신제품", "이벤트", "브랜드소식"],
            image_url:
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          },

          {
            platform: "x",
            brand_name: "나이키",
            post_date: "2026-05-20",
            body: "나이키 신제품 출시! 새로운 움직임을 지금 만나보세요.",
            hashtags: ["신제품", "나이키"],
            image_url:
              "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
          },

          {
            platform: "linkedin",
            brand_name: "나이키",
            post_date: "2026-05-20",
            body: "나이키가 새로운 제품을 선보입니다. 이번 신제품은 더 나은 움직임과 일상의 퍼포먼스를 지원하기 위해 기획되었습니다.",
            hashtags: ["Nike", "ProductLaunch", "BrandNews"],
            image_url:
              "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
          },
        ],
      };

      setProject(data);
    }

    fetchPosts();
  }, []);

  if (!project) {
    return <div>Loading...</div>;
  }

  const currentPost = project.data.find((post) => post.platform === tab);

  const handleContentChange = (value) => {
    setProject((prev) => ({
      ...prev,

      data: prev.data.map((post) =>
        post.platform === tab
          ? {
              ...post,

              body: value,
            }
          : post,
      ),
    }));
  };

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/temp-posts?platform=${tab}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: currentPost.body,
        }),
      });

      if (!response.ok) {
        throw new Error("게시 실패");
      }

      navigate("/");
    } catch (error) {
      console.error(error);

      alert("오류가 발생했습니다.");
    }
  };

  const components = {
    instagram: InstagramPost,
    x: XPost,
    linkedin: LinkedInPost,
  };

  const CurrentComponent = components[tab];

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
          <CurrentComponent
            brandName={currentPost.brand_name}
            createdAt={currentPost.post_date}
            content={currentPost.body}
            setContent={handleContentChange}
            hashtags={currentPost.hashtags}
            images={[currentPost.image_url]}
          />
        </div>
      </div>

      <div className="preview-submit">
        <Button text="게시하기" size="medium" onClick={handlePublish} />
      </div>
    </div>
  );
}

export default PreviewPage;
