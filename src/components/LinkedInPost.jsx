import { ThumbsUp, MessageCircle, Send, MoreHorizontal } from "lucide-react";

import "./LinkedInPost.css";

export default function LinkedInPost({
  brandName = "Brandname",
  profileImage,
  images = [],
  content,
  setContent,
  createdAt,
}) {
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="linkedin-post">
      {/* header */}
      <div className="linkedin-header">
        <div className="linkedin-header-left">
          {profileImage ? (
            <img
              src={profileImage}
              alt="profile"
              className="linkedin-profile-image"
            />
          ) : (
            <div className="linkedin-profile-placeholder" />
          )}

          <div className="linkedin-user-info">
            <span className="linkedin-brand-name">{brandName}</span>

            <span className="linkedin-user-meta">
              {formatDate(createdAt)} · 🌐
            </span>
          </div>
        </div>

        <button className="linkedin-icon-button">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* content */}
      <div className="linkedin-content-section">
        <textarea
          className="linkedin-content-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용 입력..."
        />
      </div>

      {/* image */}
      {images.length > 0 && (
        <div
          className={`linkedin-image-section ${
            images.length > 1 ? "two" : "one"
          }`}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`post-${index}`}
              className="linkedin-post-image"
            />
          ))}
        </div>
      )}

      <div className="linkedin-stats">
        <span>reactions</span>
        <span>·</span>
        <span>comments</span>
      </div>

      {/* actions */}
      <div className="linkedin-actions">
        <button className="linkedin-action-button">
          <ThumbsUp size={18} />
          <span>추천</span>
        </button>

        <button className="linkedin-action-button">
          <MessageCircle size={18} />
          <span>댓글</span>
        </button>

        <button className="linkedin-action-button">
          <Send size={18} />
          <span>공유</span>
        </button>
      </div>
    </div>
  );
}
