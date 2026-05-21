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
  const [files, setFiles] = useState([]); // 💡 여러 개를 담기 위해 빈 배열로 변경!
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
    // 유저가 고른 여러 개의 파일을 리액트 주머니에 배열로 쏙 담기
    setFiles(Array.from(e.target.files));
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
      files: files.map(f => f.name), // 💡 업로드된 파일 이름들의 배열로 세팅!
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
            {/* 💡 multiple 속성을 추가해서 다중 선택이 가능하게 만듭니다! */}
            <input 
              type="file" 
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
                  <span className="create-upload-placeholder">클릭하여 파일을 업로드하세요.</span>
                )}
              </div>
            </label>{/*  label 태그 정상 종료 */}
          </div>{/* file-upload-zone 종료 */}
        </div>{/* input-group 종료 */}

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
      </div> {/* 💡 create-card가 모든 입력 영역을 감싸고 여기서 깔끔하게 닫힙니다! */}

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