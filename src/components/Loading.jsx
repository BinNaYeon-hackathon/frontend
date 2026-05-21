import "./Loading.css";

export default function Loading({ message = "브랜드 정보 분석 중 ..." }) {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        {/* 중앙 정렬된 로딩 텍스트 */}
        <h2 className="loading-text">{message}</h2>
        
        {/* 이미지 속 움직이는 프로그레스 바 영역 */}
        <div className="progress-bar-bg">
          <div className="progress-bar-fill"></div>
        </div>
      </div>
    </div>
  );
}