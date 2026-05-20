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
}) {
  const hasImages = images.length > 0;

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
            className="x-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용 입력..."
          />

          {hasImages && (
            <div className="x-media">
              {images.slice(0, 4).map((img, idx) => (
                <img key={idx} src={img} className="x-image" />
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
