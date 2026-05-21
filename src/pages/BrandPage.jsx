import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BrandPage.css"; 
import fileIcon from "../assets/file-icon.png";
import NextStepModal from "../components/NextStepModal"; //모달 가져오기

//function BrandPage() {
  //return <h1>브랜드 정보 입력 화면</h1>;
//}
//export default BrandPage;


export default function BrandPage({ triggerLoading }) {
  const navigate = useNavigate();

  // 1. 인풋 상태 관리
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]); // 💡 여러 개를 담기 위해 빈 배열로 초기화!

  // 2. 모달 상태 관리
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  //3. 다음 단계 질문 모달을 띄울지 결정하는 상태
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  //나중에 이동할 때 쓸 데이터를 임시 보관할 주머니
  const [tempAIResult, setTempAIResult] = useState(null);

  const handleFileChange = (e) => {
    // 유저가 선택한 파일 여러 개를 리액트 주머니(배열)에 통째로 저장
    setFiles(Array.from(e.target.files));
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
    setShowConfirmModal(false); // 승인 모달 닫기

    //내 로컬 스위치 대신, App.jsx가 준 전역 스위치를 켭니다!
    triggerLoading(true, "브랜드 정보 분석 중 ...");

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
    //연동 연출을 보여주기 위해 3초(3000ms) 뒤 실행
    setTimeout(() => {
        //3초 뒤에 전역 로딩을 끄고 화면을 이동시킵니다
        triggerLoading(false); 
        //바로 navigate x 데이터를 저장한 뒤 질문 모달을 띄우기
        setTempAIResult(mockAIResult);
        setShowNextStepModal(true);
      }, 3000);
    };
    //"네"를 눌렀을 때 실행될 함수
    const handleGoToCreate = () => {
      setShowNextStepModal(false);
      navigate("/create", { state: { brandProfile: tempAIResult } });
    };

    // "아니요"를 눌렀을 때 실행될 함수
    const handleGoHome = () => {
      setShowNextStepModal(false);
      navigate("/"); // 홈으로 이동
    };
  

  return (
    <div className="brand-page-container">
      {/*질문 모달 렌더링 조건 */}
      {showNextStepModal && (
        <NextStepModal onConfirm={handleGoToCreate} onCancel={handleGoHome} />
      )}

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
            <input type="file" accept=".pdf" id="pdf-upload" onChange={handleFileChange} multiple hidden /> 
            <label htmlFor="pdf-upload" className="upload-label">
              <div className="upload-icon-box"> 
                <img src={fileIcon} alt ="fileIcon" className="fileIcon" />
              </div>
              <div className="upload-label-text">
                {files.length > 0 ? (
                  <div className="file-summary-wrapper">
                    {/* 🌟 1. 진짜 파일 이름들만 이 안에서 안전하게 말줄임(...) 처리를 합니다 */}
                    <div className="file-names-ellipsis-zone">
                      {files.slice(0, 3).map((file, index) => (
                        <span key={index} className="file-name-item">
                          {file.name}
                          {/* 3개 중 마지막이거나 전체 파일이 3개 이하일 때의 마지막 쉼표 방지 */}
                          {index < files.slice(0, 3).length - 1 && ", "}
                        </span>
                      ))}
                    </div>

                    {/* 🌟 2. '외 N개'는 말줄임 구역 밖에 둠으로써 무조건 눈에 보이게 고정합니다 */}
                    {files.length > 3 && (
                      <span className="file-count-extra">
                        외 {files.length - 3}개
                      </span>
                    )}
                  </div>
                ) : (
                  <span>클릭하여 파일을 업로드하세요.</span>
                )}
              </div>
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
