import { useEffect, useRef } from "react";
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  Share,
} from "lucide-react";

import "./XPost.css";

export default function XPost({
  brandName = "Brandname",
  images = [],
  content,
  createdAt,
  setContent,
  hashtags = [],
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";

      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
    }
  }, [content]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="x-post">
      <div className="x-layout">
        <div className="x-avatar-wrap">
          <div className="x-avatar" />
        </div>

        <div className="x-main">
          <div className="x-user-line">
            <span className="x-name">{brandName}</span>
            <span className="x-handle">@{brandName}</span>
            <span className="x-dot">·</span>
            <span className="x-date">{formatDate(createdAt)}</span>
          </div>

          <textarea
            ref={textareaRef}
            className="x-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용 입력..."
            rows={1}
          />
          {hashtags.length > 0 && (
            <div className="x-hashtags">
              {hashtags.map((tag, index) => (
                <span key={index} className="x-hashtag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <div className={`x-media ${images.length > 1 ? "" : "one"}`}>
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`post-${index}`}
                  className="x-image"
                />
              ))}
            </div>
          )}

          <div className="x-actions">
            <div className="x-action">
              <MessageCircle size={18} />
            </div>

            <div className="x-action">
              <Repeat2 size={18} />
            </div>

            <div className="x-action">
              <Heart size={18} />
            </div>

            <div className="x-action">
              <BarChart2 size={18} />
            </div>

            <div className="x-action right">
              <Bookmark size={18} />
              <Share size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
