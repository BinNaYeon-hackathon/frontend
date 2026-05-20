import { useEffect, useState } from "react";

import "./PreviewPage.css";

import InstagramPost from "../components/InstagramPost";
import XPost from "../components/XPost";
import LinkedInPost from "../components/LinkedInPost";
import Button from "../components/Button";

function PreviewPage() {
  const [tab, setTab] = useState("instagram");

  const [project, setProject] = useState(null);

  // 데이터 fetch 예시
  useEffect(() => {
    async function fetchPosts() {
      const data = {
        project_id: 1,

        brand_name: "brandname",

        created_at: "2026-05-20T12:00:00",

        posts: {
          instagram: {
            content: "인스타그램용 게시글입니다.",
            hashtags: ["신제품", "이벤트"],
            images: [
              "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
            ],
          },

          x: {
            content: "X용 짧은 게시글입니다.",
            hashtags: ["브랜드소식"],
            images: [
              "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
            ],
          },

          linkedin: {
            content: "링크드인용 전문적인 게시글입니다.",
            hashtags: ["브랜딩", "마케팅"],
            images: [
              "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
            ],
          },
        },
      };

      setProject(data);
    }

    fetchPosts();
  }, []);

  if (!project) {
    return <div>Loading...</div>;
  }

  // 현재 탭 데이터
  const currentPost = project.posts[tab];

  // content 수정
  const handleContentChange = (value) => {
    setProject((prev) => ({
      ...prev,

      posts: {
        ...prev.posts,

        [tab]: {
          ...prev.posts[tab],

          content: value,
        },
      },
    }));
  };

  // hashtags 수정
  const handleHashtagsChange = (hashtags) => {
    setProject((prev) => ({
      ...prev,

      posts: {
        ...prev.posts,

        [tab]: {
          ...prev.posts[tab],

          hashtags,
        },
      },
    }));
  };

  // 저장 / 게시 API
  const handlePublish = async () => {
    try {
      const response = await fetch(
        `/api/projects/${project.project_id}/posts`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(project),
        },
      );

      if (!response.ok) {
        throw new Error("게시 실패");
      }

      alert("게시물이 저장되었습니다.");
    } catch (error) {
      console.error(error);

      alert("오류가 발생했습니다.");
    }
  };

  // 플랫폼별 컴포넌트 매핑
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
            brandName={project.brand_name}
            createdAt={project.created_at}
            content={currentPost.content}
            setContent={handleContentChange}
            hashtags={currentPost.hashtags}
            setHashtags={handleHashtagsChange}
            images={currentPost.images}
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
