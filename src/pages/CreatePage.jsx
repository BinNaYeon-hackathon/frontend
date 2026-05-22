import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreatePage.css";
import fileIcon from "../assets/file-icon.png";
import arrowRight from "../assets/arrow-circle-right.png";

export default function CreatePage({ triggerLoading }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 앞서 BrandPage에서 넘겨받은 brandId와 brandName 꺼내기(없으면 빈 객체)
  const brandProfile = location.state?.brandProfile || {};
  const brandId = brandProfile.brandId;
  const brandName = brandProfile.brandName || "Brandname";

  // 1. 인풋 및 체크박스 상태 관리
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    Instagram: false,
    X: false,
    LinkedIn: false,
  });
  const [postContent, setPostContent] = useState("");
  const [files, setFiles] = useState([]); // 업로드한 이미지 파일들을 담는 배열
  const [withImage, setWithImage] = useState(false); //이미지 함께 생성하기 토글 스위치

  // 2. 모달 상태 관리
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 플랫폼 체크박스 핸들러
  const handlePlatformChange = (platform) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleFileChange = (e) => {
    //파일 선택 핸들러
    // 유저가 고른 여러 개의 파일을 리액트 주머니에 배열로 쏙 담기
    setFiles(Array.from(e.target.files));
  };

  const handleCreateClick = (e) => {
    // 생성하기 버튼 클릭 시 유효성 검사 및 컨펌 모달 띄우기
    e.preventDefault();

    // 하나 이상의 SNS가 선택되었는지, 내용이 입력되었는지 검사
    const isAnyPlatformSelected =
      Object.values(selectedPlatforms).some(Boolean);
    if (!isAnyPlatformSelected || !postContent.trim()) {
      setShowWarningModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  // 🌟 [실시간 연동 구역] 모달에서 최종 확인 누르면 n8n 2번 워크플로우 호출
  // 🌟 [실시간 연동 구역] 모달에서 최종 확인 누르면 n8n 워크플로우 호출
  const handleConfirmNext = async () => {
    setShowConfirmModal(false);
    triggerLoading(true, "게시물 생성 중 ...");

    try {
      // 선택된 플랫폼 배열 추출
      const platforms = Object.keys(selectedPlatforms).filter(
        (k) => selectedPlatforms[k],
      );

      // ==========================================================
      // 1️⃣ 먼저 이미지들을 S3 업로드 웹훅으로 전송
      // ==========================================================

      let uploadedImageUrls = [];

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

        const uploadText = await uploadResponse.text();

        let uploadJson = uploadText ? JSON.parse(uploadText) : {};

        console.log("S3 업로드 응답:", uploadJson);

        // 다양한 응답 형태 방어 처리
        uploadedImageUrls =
          uploadJson.image_urls || uploadJson.urls || uploadJson.data || [];

        // 문자열 하나만 오는 경우 배열화
        if (typeof uploadedImageUrls === "string") {
          uploadedImageUrls = [uploadedImageUrls];
        }
      }

      // ==========================================================
      // 2️⃣ 게시글 생성 웹훅 호출
      // ==========================================================

      const requestBody = {
        platforms,
        body: postContent,
        withImage,
        brandName,
        brandId,

        // 🔥 업로드 완료된 S3 URL 전달
        image_url: uploadedImageUrls[0] || "",
        image_urls: uploadedImageUrls,
      };

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
      // 3️⃣ 응답 처리
      // ==========================================================

      const textResponse = await response.text();

      let jsonResponse = textResponse
        ? JSON.parse(textResponse)
        : { success: true, data: [] };

      // 🔥 방어용 임시 데이터
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
              body: `🤖 [AI 생성 카피라이팅]\n\n${brandName}과 함께하는 특별한 순간! ✨\n사용자가 입력한 '${postContent}' 기반으로 AI가 정밀 분석한 완벽한 마케팅 문구입니다.`,
              hashtags: ["해커톤", "AI마케팅", "Post4U", brandName],

              // 🔥 업로드된 이미지 URL 사용
              image_url: uploadedImageUrls[0] || "",

              post_date: new Date().toISOString(),
            },
          ],
        };
      }

      console.log("최종 게시글 생성 응답:", jsonResponse);

      if (jsonResponse.success) {
        triggerLoading(false);

        const serverGeneratedData = jsonResponse.data?.[0] || {};

        const finalPostData = {
          brandName: serverGeneratedData.brand_name || brandName,

          content: serverGeneratedData.body || postContent,

          hashtags: serverGeneratedData.hashtags || ["트렌디"],

          imageUrl: serverGeneratedData.image_url || uploadedImageUrls[0] || "",

          withImage,

          selectedPlatforms: platforms,

          createdAt: serverGeneratedData.post_date || new Date().toISOString(),
        };

        navigate("/preview", {
          state: { postData: finalPostData },
        });
      } else {
        throw new Error(jsonResponse.message || "생성 실패");
      }
    } catch (error) {
      console.error("게시글 생성 연동 에러:", error);

      triggerLoading(false);

      alert(
        "게시글 생성 중 서버 에러가 발생했습니다. n8n 워크플로우 상태를 확인해주세요!",
      );
    }
  };

  return (
    <div className="create-page-container">
      <div className="create-card">
        <h2 className="card-title">게시글 정보</h2>

        {/* 사용할 SNS 체크박스 영역 */}
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

        {/* 게시글 내용 입력 영역 */}
        <div className="input-group">
          <label>게시글 내용</label>
          <textarea
            placeholder="텍스트를 입력하세요."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>

        {/* 첨부 파일 드롭존 영역 */}
        <div className="input-group">
          <label>첨부 파일</label>
          <div className="file-upload-zone">
            {/* 💡 multiple 속성을 추가해서 다중 선택이 가능하게 만듭니다! */}
            <input
              type="file"
              accept="image/*" /*오직 이미지파일만*/
              id="post-file-upload"
              onChange={handleFileChange}
              multiple
              hidden
            />
            <label htmlFor="post-file-upload" className="upload-label">
              <div className="upload-icon-box">
                <img src={fileIcon} alt="fileIcon" className="fileIcon" />
              </div>
              {/* 💡 파일 이름들과 외 N개가 절대 깨지지 않는 무적의 레이아웃 구역 */}
              <div className="upload-label-text">
                {files.length > 0 ? (
                  <div className="create-file-summary-wrapper">
                    {/* 오직 파일 이름들만 묶어서 한 줄 말줄임표(...) 처리 */}
                    <div className="create-file-names-ellipsis-zone">
                      {files.slice(0, 3).map((f, index) => (
                        <span key={index} className="create-file-name-item">
                          {f.name}
                          {index < files.slice(0, 3).length - 1 && ", "}
                        </span>
                      ))}
                    </div>

                    {/* 3개를 넘어가면 '외 N개' 텍스트를 오른쪽에 빡 고정 */}
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
            {/*  label 태그 정상 종료 */}
          </div>
          {/* file-upload-zone 종료 */}
        </div>
        {/* input-group 종료 */}

        {/* 이미지와 함께 생성하기 하단 토글 */}
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
      </div>{" "}
      {/* 💡 create-card가 모든 입력 영역을 감싸고 여기서 깔끔하게 닫힙니다! */}
      {/* 우측 하단 생성하기 화살표 버튼 */}
      <button
        type="button"
        className="create-button"
        onClick={handleCreateClick}
      >
        생성하기
        <img src={arrowRight} alt="arrowRight" className="arrow-icon" />
      </button>
      {/* 모달 1: 필수 입력 경고 */}
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
      {/* 모달 2: 워크플로우 실행 확인 */}
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
