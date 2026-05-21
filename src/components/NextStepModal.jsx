import "./NextStepModal.css";

export default function NextStepModal({ onConfirm, onCancel }) {
  return (
    <div className="next-modal-overlay">
      <div className="next-modal-content">
        <h2 className="next-modal-text">
          이어서 게시글을<br />생성하시겠습니까?
        </h2>
        <div className="next-modal-btn-group">
          <button className="next-modal-btn confirm" onClick={onConfirm}>네</button>
          <button className="next-modal-btn cancel" onClick={onCancel}>아니요</button>
        </div>
      </div>
    </div>
  );
}