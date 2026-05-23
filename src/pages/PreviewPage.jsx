import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./PreviewPage.css";

import InstagramPost from "../components/InstagramPost";
import XPost from "../components/XPost";
import LinkedInPost from "../components/LinkedInPost";
import Button from "../components/Button";

function PreviewPage() {
    const [tab, setTab] = useState("");

    const [project, setProject] = useState(null);

    const navigate = useNavigate();

    // 데이터 fetch 예시
    useEffect(() => {
        async function fetchPosts() {
            const response = await fetch(
                "http://localhost:5678/webhook/temp-posts",
            );
            const data = await response.json();

            setProject(data);

            if (data.data.length > 0) {
                setTab(data.data[0].platform);
            }
        }

        fetchPosts();
    }, []);

    if (!project) {
        return <div>Loading...</div>;
    }

    const currentPost = project.data.find((post) => post.platform === tab);

    if (!currentPost) {
        return null;
    }

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
            const publishPosts = project.data.map((post) => ({
                platform: post.platform,
                brand_name: post.brand_name,
                post_date: post.post_date,
                body: post.body,
                hashtags: post.hashtags,
                image_url: post.image_url,
            }));

            console.log("게시 요청 posts:", publishPosts);

            const response = await fetch(
                "http://localhost:5678/webhook/posts/publish",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        posts: publishPosts,
                    }),
                },
            );

            const result = await response.json();
            console.log("게시 결과:", result);

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "게시 실패");
            }

            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            alert(`오류가 발생했습니다.\n${error.message}`);
        }
    };

    const platformLabels = {
        instagram: "Instagram",
        x: "X",
        linkedin: "LinkedIn",
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
                    {project.data.map((post) => (
                        <button
                            key={post.platform}
                            className={
                                tab === post.platform
                                    ? "tab-button active"
                                    : "tab-button"
                            }
                            onClick={() => setTab(post.platform)}
                        >
                            {platformLabels[post.platform]}
                        </button>
                    ))}
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
