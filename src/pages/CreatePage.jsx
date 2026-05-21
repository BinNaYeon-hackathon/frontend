import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreatePage.css"; 
import fileIcon from "../assets/file-icon.png";
import arrowRight from "../assets/arrow-circle-right.png";


export default function CreatePage({ triggerLoading }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // BrandPage에서 넘겨받은 브랜드 정보 가방 열기 (없으면 빈 객체)
  const brandProfile = location.state?.brandProfile || {};

  // 1. 인풋 및 체크박스 상태 관리
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    Instagram: false,
    X: false,
    LinkedIn: false,
  });
  const [postContent, setPostContent] = useState("");
  const [file, setFile] = useState(null);
  const [withImage, setWithImage] = useState(false); // 기본 체크 상태

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
    setFile(e.target.files[0]);
  };

  const handleCreateClick = (e) => {
    e.preventDefault();

    // 하나 이상의 SNS가 선택되었는지, 내용이 입력되었는지 검사
    const isAnyPlatformSelected = Object.values(selectedPlatforms).some(Boolean);
    if (!isAnyPlatformSelected || !postContent.trim()) {
      setShowWarningModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmNext = () => {
    setShowConfirmModal(false);

    triggerLoading(true, "게시물 생성 중 ...");

    // 1번 팀원의 인스타그램 포스트 컴포넌트 규격에 맞춰 쏴줄 최종 데이터 주머니
    const finalPostData = {
      brandName: brandProfile.brandName || "Brandname",
      content: postContent,
      hashtags: brandProfile.toneAdjectives || ["트렌디"],
      withImage: withImage,
      uploadedFileName: file ? file.name : null,
      selectedPlatforms: Object.keys(selectedPlatforms).filter(k => selectedPlatforms[k]),
      createdAt: new Date().toISOString()
    };

    // 3초(3000ms) 동안 로딩창을 보여준 뒤 다음 페이지로 이동
    setTimeout(() => {
      triggerLoading(false); // 로딩창 끄기
      navigate("/preview", { state: { postData: finalPostData } });// 최종 미리보기 페이지로 데이터 싣고 이동
    }, 3000);
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
            <input type="file" id="post-file-upload" onChange={handleFileChange} hidden />
            <label htmlFor="post-file-upload" className="upload-label">
              {/* 이미지 속 박스형 클라우드 업로드 아이콘 느낌 재현 */}
              <div className="upload-icon-box">
                 <img src={fileIcon} alt ="fileIcon" className="fileIcon" />
              </div>
              <span>{file ? file.name : "클릭하여 파일을 업로드하세요."}</span>
            </label>
          </div>
        </div>

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
      </div>

      {/* 우측 하단 생성하기 화살표 버튼 */}
      <button type="button" className="create-button" onClick={handleCreateClick}>
        생성하기 
        <img src={arrowRight} alt ="arrowRight" className="arrow-icon" />
      </button>

      {/* 모달 1: 필수 입력 경고 */}
      {showWarningModal && (
        <div className="modal-backdrop" onClick={() => setShowWarningModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ 입력 확인</h3>
            <p>사용할 SNS를 하나 이상 선택하고 내용을 입력해주세요</p>
            <button type="button" className="modal-btn" onClick={() => setShowWarningModal(false)}>확인</button>
          </div>
        </div>
      )}

      {/* 모달 2: 워크플로우 실행 확인 */}
      {showConfirmModal && (
        <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>콘텐츠 생성</h3>
            <p>입력하신 정보로 AI 콘텐츠 생성을 시작하시겠습니까?</p>
            <div className="modal-btn-group">
              <button type="button" className="modal-btn confirm" onClick={handleConfirmNext}>확인</button>
              <button type="button" className="modal-btn cancel" onClick={() => setShowConfirmModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}