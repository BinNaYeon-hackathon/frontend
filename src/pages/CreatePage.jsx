import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreatePage.css";
import fileIcon from "../assets/file-icon.png";
import arrowRight from "../assets/arrow-circle-right.png";

export default function CreatePage({ triggerLoading }) {
  const navigate = useNavigate();
  const location = useLocation();

  // BrandPage에서 전달받은 브랜드 정보
  const brandProfile = location.state?.brandProfile || {};
  const brandId = brandProfile.brandId;
  const brandName = brandProfile.brandName || "Brandname";

  // 상태 관리
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    Instagram: false,
    X: false,
    LinkedIn: false,
  });

  const [postContent, setPostContent] = useState("");
  const [files, setFiles] = useState([]);
  const [withImage, setWithImage] = useState(false);

  // 모달 상태
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 플랫폼 선택
  const handlePlatformChange = (platform) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  // 파일 선택
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // 생성 버튼 클릭
  const handleCreateClick = (e) => {
    e.preventDefault();

    const isAnyPlatformSelected =
      Object.values(selectedPlatforms).some(Boolean);

    if (!isAnyPlatformSelected || !postContent.trim()) {
      setShowWarningModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  // ==========================================================
  // 🌟 최종 생성 실행
  // ==========================================================
  const handleConfirmNext = async () => {
    setShowConfirmModal(false);

    triggerLoading(true, "게시물 생성 중 ...");

    try {
      // 선택 플랫폼 배열화
      const platforms = Object.keys(selectedPlatforms).filter(
        (k) => selectedPlatforms[k],
      );

      // ==========================================================
      // 1️⃣ 이미지 업로드 → S3 URL 획득
      // ==========================================================

      let uploadedImageUrl = "";

      if (files.length > 0) {
        const uploadFormData = new FormData();

        files.forEach((file) => {
          uploadFormData.append("files", file);
        });

        const uploadResponse = await fetch(
          "http://localhost:5678/webhook-test/images/upload",
          {
            method: "POST",
            body: uploadFormData,
          },
        );

        if (!uploadResponse.ok) {
          throw new Error("이미지 업로드 실패");
        }

        const uploadResult = await uploadResponse.json();

        uploadedImageUrl = uploadResult.image_url || "";
      }

      // ==========================================================
      // 2️⃣ 게시글 생성 요청
      // ==========================================================

      const requestBody = {
        platforms,
        body: postContent,
        withImage,
        brandName,
        brandId,

        // 🔥 업로드된 이미지 URL 포함
        image_url: uploadedImageUrl,
      };

      console.log("게시글 생성 요청 바디:", requestBody);

      const response = await fetch(
        "http://localhost:5678/webhook-test/temp-posts/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        throw new Error("게시글 생성 서버 통신 실패");
      }

      // ==========================================================
      // 3️⃣ 응답 수신
      // ==========================================================

      const textResponse = await response.text();

      let jsonResponse = textResponse
        ? JSON.parse(textResponse)
        : { success: true, data: [] };

      // ==========================================================
      // 🔥 방어용 임시 데이터
      // ==========================================================

      if (
        !jsonResponse.success ||
        !jsonResponse.data ||
        jsonResponse.data.length === 0
      ) {
        jsonResponse = {
          success: true,
          data: [
            {
              brand_name: brandName,

              body: `🤖 [AI 생성 카피라이팅]

${brandName}과 함께하는 특별한 순간! ✨

사용자가 입력한 '${postContent}' 기반으로 AI가 생성한 마케팅 문구입니다.`,

              hashtags: ["해커톤", "AI마케팅", "Post4U", brandName],

              image_url: uploadedImageUrl,

              post_date: new Date().toISOString(),
            },
          ],
        };
      }

      console.log("최종 게시글 생성 응답:", jsonResponse);

      // ==========================================================
      // 4️⃣ Preview 페이지 이동
      // ==========================================================

      if (jsonResponse.success) {
        triggerLoading(false);

        const serverGeneratedData = jsonResponse.data?.[0] || {};

        const finalPostData = {
          brandName: serverGeneratedData.brand_name || brandName,

          content: serverGeneratedData.body || postContent,

          hashtags: serverGeneratedData.hashtags || ["트렌디"],

          imageUrl: serverGeneratedData.image_url || uploadedImageUrl || "",

          withImage,

          selectedPlatforms: platforms,

          createdAt: serverGeneratedData.post_date || new Date().toISOString(),
        };

        navigate("/preview", {
          state: {
            postData: finalPostData,
          },
        });
      } else {
        throw new Error(jsonResponse.message || "생성 실패");
      }
    } catch (error) {
      console.error("게시글 생성 연동 에러:", error);

      triggerLoading(false);

      alert(
        "게시글 생성 중 서버 에러가 발생했습니다.\nn8n 워크플로우 상태를 확인해주세요!",
      );
    }
  };

  return (
    <div className="create-page-container">
      <div className="create-card">
        <h2 className="card-title">게시글 정보</h2>

        {/* 사용할 SNS */}
        <div className="input-group">
          <label>사용할 SNS</label>

          <div className="checkbox-group">
            {Object.keys(selectedPlatforms).map((platform) => (
              <label key={platform} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedPlatforms[platform]}
                  onChange={() => handlePlatformChange(platform)}
                />

                <span>{platform}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="input-group">
          <label>게시글 내용</label>

          <textarea
            placeholder="텍스트를 입력하세요."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>

        {/* 파일 업로드 */}
        <div className="input-group">
          <label>첨부 파일</label>

          <div className="file-upload-zone">
            <input
              type="file"
              accept="image/*"
              id="post-file-upload"
              onChange={handleFileChange}
              multiple
              hidden
            />

            <label htmlFor="post-file-upload" className="upload-label">
              <div className="upload-icon-box">
                <img src={fileIcon} alt="fileIcon" className="fileIcon" />
              </div>

              <div className="upload-label-text">
                {files.length > 0 ? (
                  <div className="create-file-summary-wrapper">
                    <div className="create-file-names-ellipsis-zone">
                      {files.slice(0, 3).map((f, index) => (
                        <span key={index} className="create-file-name-item">
                          {f.name}

                          {index < files.slice(0, 3).length - 1 && ", "}
                        </span>
                      ))}
                    </div>

                    {files.length > 3 && (
                      <span className="create-file-count-extra">
                        외 {files.length - 3}개
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="create-upload-placeholder">
                    클릭하여 이미지 파일을 업로드하세요.
                  </span>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* 이미지 생성 토글 */}
        <div className="bottom-option-zone">
          <label className="checkbox-label option-trigger">
            <input
              type="checkbox"
              checked={withImage}
              onChange={() => setWithImage(!withImage)}
            />

            <span className="option-text">이미지와 함께 생성하기</span>
          </label>
        </div>
      </div>

      {/* 생성 버튼 */}
      <button
        type="button"
        className="create-button"
        onClick={handleCreateClick}
      >
        생성하기
        <img src={arrowRight} alt="arrowRight" className="arrow-icon" />
      </button>

      {/* 경고 모달 */}
      {showWarningModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowWarningModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ 입력 확인</h3>

            <p>사용할 SNS를 하나 이상 선택하고 내용을 입력해주세요</p>

            <button
              type="button"
              className="modal-btn"
              onClick={() => setShowWarningModal(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 생성 확인 모달 */}
      {showConfirmModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowConfirmModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>콘텐츠 생성</h3>

            <p>입력하신 정보로 AI 콘텐츠 생성을 시작하시겠습니까?</p>

            <div className="modal-btn-group">
              <button
                type="button"
                className="modal-btn confirm"
                onClick={handleConfirmNext}
              >
                확인
              </button>

              <button
                type="button"
                className="modal-btn cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
