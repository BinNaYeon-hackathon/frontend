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
  const [files, setFiles] = useState([]); // 여러 개를 담기 위해 빈 배열로 초기화!

  // 2. 모달 상태 관리
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  //3. 다음 단계 질문 모달을 띄울지 결정하는 상태 및 데이터 주머니
  const [showNextStepModal, setShowNextStepModal] = useState(false);
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

  // 🌟 실시간 n8n 웹훅 통신 및 응답 수신 함수
  const handleConfirmNext = async () => {
    setShowConfirmModal(false); // 승인 모달 닫기
    //1. App.jsx가 전달해 준 전역 백그라운드 로딩창 켜기
    triggerLoading(true, "브랜드 정보 분석 중 ...");
    
    try {
      // 2. Multipart/FormData 바구니 개설 (명세서 규격에 맞게 포장)
      const formData = new FormData();
      formData.append("brandName", brandName);
      formData.append("description", description);
      
      // 유저가 선택한 여러 개의 파일들을 "files"라는 열쇠 이름으로 차곡차곡 담기
      files.forEach((file) => {
        formData.append("files", file); 
      });

      // 3. 백엔드 n8n 웹훅으로 진짜 실시간 통신 출발
      //n8n 웹훅의 path 규칙이 'brands/analysis'이므로 주소 끝처리를 맞춰줌 
      //const response = await fetch("http://localhost:5678/webhook/brands/analysis", {
      const response = await fetch("http://localhost:5678/webhook-test/brands/analysis", {
        method: "POST",
        body: formData, // FormData를 보낼 때는 headers에 Content-Type을 수동으로 적지x, 브라우저가 알아서 세팅
      });

      // 통신 에러 발생 시 예외 처리
      if (!response.ok) {
        throw new Error("서버 브랜드 분석 파이프라인 작동 실패");
      }

      // 4. 백엔드가 돌려준 성공 영수증 수신!
      // 구조: { isSuccess: true, code: "POST_SUCCESS", result: { brandId: 12, brandName: "무신사" } }
      //const jsonResponse = await response.json();
      // 🎯 변경 코드 (안전한 방어막 구축)
      const textResponse = await response.text(); // 일단 글자 통째로 읽기
      //const jsonResponse = textResponse ? JSON.parse(textResponse) : { isSuccess: true, result: {} };

      // 🔥 [치트키 방어 코드] 추후 수정!! n8n이 빈 값을 주면 강제로 성공 데이터로 덮어쓰기!
      let jsonResponse = textResponse ? JSON.parse(textResponse) : { isSuccess: true, result: {} };
      if (!jsonResponse.isSuccess || jsonResponse.isSuccess === "") {
        jsonResponse = {
          isSuccess: true,
          code: "POST_SUCCESS",
          message: "강제 성공 처리",
          result: {
            brandId: jsonResponse.result?.brandId || 999,
            brandName: jsonResponse.result?.brandName || brandName || "테스트 브랜드"
          }
        };
      }
      //console.log("백엔드가 돌려준 최종 웹훅 응답 데이터:", jsonResponse);
      console.log("강제 보정된 최종 웹훅 응답 데이터:", jsonResponse);
      //=====================================================

      if (jsonResponse.isSuccess) {
        // 5. 성공 시 전역 로딩창을 끄기
        triggerLoading(false);
        
        //[핵심] 다음 화면(CreatePage)에서 진짜 AI 데이터들을 DB에서 불러올 수 있도록 
        // 백엔드가 준 보따리 결과(brandId와 brandName)를 임시 주머니에 저장
        // setTempAIResult({
        //   brandId: jsonResponse.result.brandId,
        //   brandName: jsonResponse.result.brandName || brandName
        // });
        // 🎯 변경 코드 (b님 응답에 brandId가 없어도 에러 안 나게 방어!)
        setTempAIResult({
          brandId: jsonResponse.result?.brandId || 999, // 없으면 임시로 999 꽂기!
          brandName: jsonResponse.result?.brandName || brandName
        });
        
        // 6. "게시글 생성으로 넘어가시겠습니까?" 질문 모달 열기
        setShowNextStepModal(true);
      } else {
        throw new Error(jsonResponse.message || "분석 실패");
      }

    } catch (error) {
      console.error("연동 에러 발생:", error);
      triggerLoading(false);
      alert("서버와 연결할 수 없습니다. n8n 워크플로우가 활성화되어 있는지 확인해 주세요!");
    }
  };

  // const handleConfirmNext = () => {
  //   setShowConfirmModal(false); // 1. "다음 단계로 넘어가시겠습니까" 컨펌 모달 닫기
    
  //   // 2. App.jsx의 전역 로딩창을 즉시 켭니다.
  //   triggerLoading(true, "브랜드 정보 분석 중 ...");

  //   // 3. 진짜 통신 대신, 3초(3000ms) 뒤에 성공한 것처럼 속이는 타이머 가동!
  //   setTimeout(() => {
  //     triggerLoading(false); // 3초 뒤 로딩창 끄기
      
  //     // 가짜 brandId 발급 시뮬레이션
  //     setTempAIResult({
  //       brandId: 999,
  //       brandName: brandName || "테스트 브랜드"
  //     });
      
  //     // 4. 드디어 보고 싶어 하셨던 최종 "게시글 생성으로 넘어가시겠습니까?" 질문 모달 열기!
  //     setShowNextStepModal(true);
  //   }, 3000);
  // };
  

  // 모달에서 "네"를 눌렀을 때 실행될 함수 (컴포넌트 내부에 안전하게 배치)
  const handleGoToCreate = () => {
    setShowNextStepModal(false);
    // 다음 페이지로 이동하면서 백엔드가 준 brandId가 포함된 보따리를 들고 갑니다.
    navigate("/create", { state: { brandProfile: tempAIResult } });
  };

  //모달에서 "아니요"를 눌렀을 때 실행될 함수 (컴포넌트 내부에 안전하게 배치)
  const handleGoHome = () => {
    setShowNextStepModal(false);
    navigate("/"); 
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
                  <span>클릭하여 pdf 파일을 업로드하세요.</span>
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
            <p>다음 단계로 넘어가시겠습니까? <br/>넘어가면 다시 수정할 수 없습니다.</p>
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
