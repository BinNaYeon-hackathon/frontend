import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BrandPage.css"; 

//function BrandPage() {
  //return <h1>브랜드 정보 입력 화면</h1>;
//}
//export default BrandPage;


export default function BrandPage() {
  const navigate = useNavigate();

  // 1. 인풋 상태 관리
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  // 2. 모달 상태 관리
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSaveClick = (e) => {
    e.preventDefault();

    // 빈 칸 검사 ➔ 내용 입력 요청 모달 열기
    if (!brandName.trim() || !description.trim()) {
      setShowWarningModal(true);
      return;
    }

    // 조건 만족 시 ➔ 다음으로 넘어가시겠습니까 모달 열기
    setShowConfirmModal(true);
  };

  const handleConfirmNext = () => {
    setShowConfirmModal(false);

    // 나중에 n8n 연동 전까지 서비스를 굴릴 가상의 AI 분석 결과 데이터 (MySQL 명세서 기준)
    const mockAIResult = {
      brandName: brandName,
      brandDescription: description,
      targetAudience: "20대 중심의 패션 커머스 유저층",
      coreMessage: "도전과 스타일을 깨우는 브랜드",
      toneAdjectives: ["힙한", "친근한", "트렌디한"],
      frequentExpressions: ["오늘 뭐 입지", "트렌드", "패션 놀이터"],
      forbiddenExpressions: ["최저가", "싸구려", "완벽 보장"],
      emojiRule: "역동적인 이모지 적절히 사용",
      sentenceLengthRule: "짧고 강한 문장",
      sourceSummary: "브랜드 문서 분석 완료"
    };

    // ➔ 가방(state)에 AI 결과 데이터를 담아서 '게시글 생성(create)' 페이지로 이동!
    navigate("/create", { state: { brandProfile: mockAIResult } });
  };

  return (
    <div className="brand-page-container">
      <div className="brand-card">
        <h2 className="card-title">브랜드 정보</h2>

        <div className="input-group">
          <label>브랜드 이름</label>
          <input
            type="text"
            placeholder="브랜드명을 입력하세요"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>브랜드 설명</label>
          <textarea
            placeholder="텍스트를 입력하세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>첨부 파일</label>
          <div className="file-upload-zone">
            <input type="file" accept=".pdf" id="pdf-upload" onChange={handleFileChange} hidden />
            <label htmlFor="pdf-upload" className="upload-label">
              <div className="upload-icon">📁</div>
              <span>{file ? file.name : "클릭하여 파일을 업로드하세요."}</span>
            </label>
          </div>
        </div>
      </div>

      <button className="save-button" onClick={handleSaveClick}>
        저장하기
      </button>

      {/* 모달 1: 필수 입력 경고 */}
      {showWarningModal && (
        <div className="modal-backdrop" onClick={() => setShowWarningModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ 입력 확인</h3>
            <p>내용을 전부 입력해주세요</p>
            <button className="modal-btn" onClick={() => setShowWarningModal(false)}>확인</button>
          </div>
        </div>
      )}

      {/* 모달 2: 다음 단계 진행 여부 확인 */}
      {showConfirmModal && (
        <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>분석 시작</h3>
            <p>게시글 생성 단계로 넘어가시겠습니까?</p>
            <div className="modal-btn-group">
              <button className="modal-btn confirm" onClick={handleConfirmNext}>확인</button>
              <button className="modal-btn cancel" onClick={() => setShowConfirmModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
