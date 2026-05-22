import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import PostRecordRender from "../components/PostRecordRender";
import "./DashboardPage.css";

function DashboardPage() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [tab, setTab] = useState("instagram");

    // 게시물 조회
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(
                    "http://localhost:5678/webhook-test/posts",
                );
                const data = await res.json();

                if (data?.success) {
                    setPosts(data.data);
                }
            } catch {
                setPosts([]);
            }
        };

        fetchPosts();
    }, []);

    const filteredPosts = posts.filter((p) => p.platform === tab).slice(0, 3);

    return (
        <div className="dashboard-page">
            {/* HEADER */}
            <div className="dashboard-header">
                <div className="dashboard-post-title">
                    <h2>최근 생성한 게시물</h2>
                </div>

                {/* TAB */}
                <div className="dashboard-tab-section">
                    <button
                        className={tab === "instagram" ? "tab active" : "tab"}
                        onClick={() => setTab("instagram")}
                    >
                        Instagram
                    </button>

                    <button
                        className={tab === "x" ? "tab active" : "tab"}
                        onClick={() => setTab("x")}
                    >
                        X
                    </button>

                    <button
                        className={tab === "linkedin" ? "tab active" : "tab"}
                        onClick={() => setTab("linkedin")}
                    >
                        LinkedIn
                    </button>
                </div>
            </div>

            {/* POSTS */}
            <div className="records-section">
                {filteredPosts.length > 0 ? (
                    <div className="post-records">
                        {filteredPosts.map((post, idx) => (
                            <div key={idx} className="record-item">
                                <PostRecordRender tab={tab} post={post} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty">게시물이 없습니다</div>
                )}
            </div>

            {/* CTA */}
            <div className="cta-wrapper">
                <Button
                    text="게시물 생성하기"
                    size="large"
                    onClick={() => navigate("/create")}
                />
            </div>
        </div>
    );
}

export default DashboardPage;
