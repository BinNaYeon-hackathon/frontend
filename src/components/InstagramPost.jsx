import { useEffect, useRef } from "react";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "./InstagramPost.css";

export default function InstagramPost({
  brandName = "Brandname",
  profileImage,
  images = [],
  content,
  setContent,
  hashtags = [],
  createdAt,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";

      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        20,
      )}px`;
    }
  }, [content]);

  const [currentImage, setCurrentImage] = useState(0);

  const hasImages = images.length > 1;

  const nextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="instagram-post">
      <div className="instagram-header">
        <div className="header-left">
          <div className="profile-ring">
            <div className="profile-inner">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-placeholder" />
              )}
            </div>
          </div>

          <span className="brand-name">{brandName}</span>
        </div>

        <button className="icon-button">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="image-section">
        {images.length > 0 ? (
          <img
            src={images[currentImage]}
            alt={`instagram-${currentImage}`}
            className="instagram-image"
          />
        ) : (
          <div className="image-placeholder" />
        )}

        {hasImages && (
          <>
            <button onClick={prevImage} className="nav-button left">
              <ChevronLeft size={18} />
            </button>

            <button onClick={nextImage} className="nav-button right">
              <ChevronRight size={18} />
            </button>

            <div className="pagination-dots">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`dot ${currentImage === index ? "active" : ""}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="action-section">
        <div className="action-left">
          <Heart size={28} className="action-icon" />
          <MessageCircle size={26} className="action-icon" />
          <Send size={26} className="action-icon" />
        </div>

        <Bookmark size={24} className="action-icon" />
      </div>

      <div className="content-section">
        <div className="instagram-content">
          <span className="brand-name-text">{brandName}</span>

          <textarea
            id="instagram-content"
            ref={textareaRef}
            className="instagram-content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용 입력..."
            rows={1}
          />

          {hashtags.length > 0 && (
            <div className="instagram-hashtags">
              {hashtags.map((tag, index) => (
                <span key={index} className="instagram-hashtag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="instagram-date">{formatDate(createdAt)}</p>
      </div>
    </div>
  );
}
