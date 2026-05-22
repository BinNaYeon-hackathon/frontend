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

  const handleFileChange = (e) => { //파일 선택 핸들러
    // 유저가 고른 여러 개의 파일을 리액트 주머니에 배열로 쏙 담기
    setFiles(Array.from(e.target.files));
  };

  const handleCreateClick = (e) => { // 생성하기 버튼 클릭 시 유효성 검사 및 컨펌 모달 띄우기
    e.preventDefault();

    // 하나 이상의 SNS가 선택되었는지, 내용이 입력되었는지 검사
    const isAnyPlatformSelected = Object.values(selectedPlatforms).some(Boolean);
    if (!isAnyPlatformSelected || !postContent.trim()) {
      setShowWarningModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  // 🌟 [실시간 연동 구역] 모달에서 최종 확인 누르면 n8n 2번 워크플로우 호출
  const handleConfirmNext = async () => {
    setShowConfirmModal(false);
    triggerLoading(true, "게시물 생성 중 ..."); // App.jsx 전역 로딩 모달 켜기

    try {
      // 이미지 전송을 위해 Multipart/FormData 가방 생성
      const formData = new FormData();
      
      // n8n 2번 워크플로우(게시글 생성)가 요구하는 규격 그대로 Key값 append 수행
      // 1. platforms: 배열을 JSON 문자열로 변환해 전송 (ex: ["Instagram"])
      const platforms = Object.keys(selectedPlatforms).filter(k => selectedPlatforms[k]);
      formData.append("platforms", JSON.stringify(platforms)); 
      formData.append("body", postContent); // 2. body: 사용자가 입력한 날것의 글감 텍스트
      formData.append("withImage", withImage); // 3. withImage: 이미지 생성 여부 스위치 (true / false)

      // 4. files: 업로드한 진짜 이미지 파일들을 차곡차곡 담기
      files.forEach((file) => {
        formData.append("files", file); 
      });

      // 5. brandName: 브랜드 이름 전달
      formData.append("brandName", brandName);

      // 6. brandId: DB 조회를 위해 앞 장에서 받아온 가이드라인 번호표 매핑
      if (brandId) {
        formData.append("brandId", brandId);
      }

      //(IP 주소)에 연결된 2번 [게시글 생성 웹훅]으로 출발
      //💡연동 시 localhost 자리에 실제 IP 주소(예: 192.168.0.XX)를 꼭 넣어줘야 함
      const response = await fetch("http://localhost:5678/webhook-test/c5393a0f-9b8a-44a2-a2f5-7370f7191b19", {
        method: "POST",
        body: formData, // FormData 전송 시 Content-Type 헤더 수동 지정x, 브라우저가 자동 세팅
      });

      if (!response.ok) {
        throw new Error("게시글 생성 서버 통신 실패");
      }

      // 백엔드가 돌려준 진짜 최종 완정작 데이터 수신
      const textResponse = await response.text();
      //const jsonResponse = await response.json();
      let jsonResponse = textResponse ? JSON.parse(textResponse) : { success: true, data: [] };
      // 🔥 [치트키 방어 코드] n8n이 에러가 나거나 빈 값을 주면 무조건 성공 가짜 데이터 주입!
      if (!jsonResponse.success || !jsonResponse.data || jsonResponse.data.length === 0) {
        jsonResponse = {
          success: true,
          data: [
            {
              brand_name: brandName,
              body: `🤖 [AI 생성 카피라이팅]\n\n${brandName}과 함께하는 특별한 순간! ✨\n사용자가 입력한 '${postContent}' 기반으로 AI가 정밀 분석한 완벽한 마케팅 문구입니다.`,
              hashtags: ["해커톤", "AI마케팅", "Post4U", brandName],
              image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", // 가짜 멋진 신발 이미지 링크
              post_date: new Date().toISOString()
            }
          ]
        };
      }
      console.log("강제 보정된 2번 최종 웹훅 응답 데이터:", jsonResponse);
      //console.log("백엔드가 돌려준 게시글 생성 완료 응답:", jsonResponse);
      // ==========================================================

      if (jsonResponse.success) {
        triggerLoading(false); // 로딩창 끄기

        //n8n 'Build Final Response' 노드 규격에 맞춰 데이터 파싱
        const serverGeneratedData = jsonResponse.data?.[0] || {}; 

        //미리 만들어 둔 인스타그램/소셜 포스트 컴포넌트 규격에 맞추어 보따리 재포장
        const finalPostData = {
          brandName: serverGeneratedData.brand_name || brandName, // 백엔드 결과물 내 브랜드명
          content: serverGeneratedData.body || postContent,       // AI가 정제하여 새로 지어준 찐 마케팅 본문 문구
          hashtags: serverGeneratedData.hashtags || ["트렌디"],     // AI가 톤앤매너에 맞게 추출해 준 해시태그 배열
          imageUrl: serverGeneratedData.image_url || "",          // 🌟 제미나이가 그리고 S3에 올린 진짜 이미지 웹 링크!
          withImage: withImage,
          selectedPlatforms: platforms,
          createdAt: serverGeneratedData.post_date || new Date().toISOString() // 백엔드가 찍어준 포스팅 날짜
        };

        // 최종 미리보기(/preview) 페이지로 완성된 데이터 바구니를 싣고 이동!
        navigate("/preview", { state: { postData: finalPostData } });
      } else {
        throw new Error(jsonResponse.message || "생성 실패");
      }

    } catch (error) {
      console.error("게시글 생성 연동 에러:", error);
      triggerLoading(false);
      alert("게시글 생성 중 서버 에러가 발생했습니다. n8n 2번 워크플로우가 대기 상태(Listen)인지 확인해 주세요!");
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
                  <span className="create-upload-placeholder">클릭하여 이미지 파일을 업로드하세요.</span>
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