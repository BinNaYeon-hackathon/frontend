import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./CreatePage.css";

import fileIcon from "../assets/file-icon.png";
import arrowRight from "../assets/arrow-circle-right.png";

export default function CreatePage({ triggerLoading }) {
    const navigate = useNavigate();
    const location = useLocation();

    // BrandPage에서 전달받은 브랜드 정보
    const brandProfile = location.state?.brandProfile || {};

    const brandId = brandProfile.brandId;
    const brandName = brandProfile.brandName || "Brandname";

    // 상태 관리
    const [selectedPlatforms, setSelectedPlatforms] = useState({
        Instagram: false,
        X: false,
        LinkedIn: false,
    });

    const [postContent, setPostContent] = useState("");
    const [files, setFiles] = useState([]);
    const [withImage, setWithImage] = useState(false);

    // 모달 상태
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // 플랫폼 선택
    const handlePlatformChange = (platform) => {
        setSelectedPlatforms((prev) => ({
            ...prev,
            [platform]: !prev[platform],
        }));
    };

    // 파일 선택
    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    // 생성 버튼 클릭
    const handleCreateClick = (e) => {
        e.preventDefault();

        const isAnyPlatformSelected =
            Object.values(selectedPlatforms).some(Boolean);

        if (!isAnyPlatformSelected || !postContent.trim()) {
            setShowWarningModal(true);
            return;
        }

        if (withImage && files.length === 0) {
            alert("이미지와 함께 생성하려면 이미지 파일을 업로드해주세요.");
            return;
        }

        setShowConfirmModal(true);
    };

    // ==========================================================
    // 최종 생성 실행
    // ==========================================================
    const handleConfirmNext = async () => {
        setShowConfirmModal(false);
        triggerLoading(true, "게시물 생성 중 ...");

        try {
            // n8n에서 기대하는 값: instagram, x, linkedin
            const platforms = [
                ...new Set(
                    Object.keys(selectedPlatforms)
                        .filter((platform) => selectedPlatforms[platform])
                        .map((platform) => platform.toLowerCase()),
                ),
            ];

            let uploadedImageUrl = "";

            // ==========================================================
            // 1. 이미지 업로드 → S3 URL 획득
            // ==========================================================
            if (withImage) {
                if (files.length === 0) {
                    throw new Error(
                        "이미지와 함께 생성하려면 이미지 파일이 필요합니다.",
                    );
                }

                const uploadFormData = new FormData();

                // n8n 이미지 업로드 워크플로우가 기대하는 필드명: image
                uploadFormData.append("image", files[0]);

                const uploadResponse = await fetch(
                    "http://localhost:5678/webhook/images/upload",
                    {
                        method: "POST",
                        body: uploadFormData,
                    },
                );

                if (!uploadResponse.ok) {
                    throw new Error(
                        `이미지 업로드 실패: ${uploadResponse.status}`,
                    );
                }

                const uploadResult = await uploadResponse.json();

                console.log("S3 업로드 응답:", uploadResult);

                uploadedImageUrl = uploadResult.data?.image_url || "";

                if (!uploadedImageUrl) {
                    throw new Error(
                        "이미지 업로드 응답에서 image_url을 찾지 못했습니다.",
                    );
                }
            }

            // ==========================================================
            // 2. 게시글 생성 요청
            // ==========================================================
            const requestBody = {
                platforms,
                body: postContent.trim(),

                // n8n Code 노드가 기대하는 필드명
                generate_with_image: withImage,

                brandName,
                brandId,

                // generate_with_image가 true이면 필수
                image_url: uploadedImageUrl,
            };

            console.log("게시글 생성 요청:", requestBody);

            const response = await fetch(
                "http://localhost:5678/webhook/temp-posts/generate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                },
            );

            if (!response.ok) {
                throw new Error(
                    `게시글 생성 서버 통신 실패: ${response.status}`,
                );
            }

            const jsonResponse = await response.json();

            console.log("게시글 생성 응답:", jsonResponse);

            // ==========================================================
            // 3. Preview 페이지 이동
            // ==========================================================
            if (jsonResponse.success || jsonResponse.isSuccess) {
                triggerLoading(false);
                navigate("/preview");
                return;
            }

            throw new Error(jsonResponse.message || "게시글 생성 실패");
        } catch (error) {
            console.error("게시글 생성 연동 에러:", error);

            triggerLoading(false);

            alert(`게시글 생성 중 서버 에러가 발생했습니다.\n${error.message}`);
        }
    };

    return (
        <div className="create-page-container">
            <div className="create-card">
                <h2 className="card-title">게시글 정보</h2>

                {/* 사용할 SNS */}
                <div className="input-group">
                    <label>사용할 SNS</label>

                    <div className="checkbox-group">
                        {Object.keys(selectedPlatforms).map((platform) => (
                            <label key={platform} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={selectedPlatforms[platform]}
                                    onChange={() =>
                                        handlePlatformChange(platform)
                                    }
                                />

                                <span>{platform}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 게시글 내용 */}
                <div className="input-group">
                    <label>게시글 내용</label>

                    <textarea
                        placeholder="텍스트를 입력하세요."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                    />
                </div>

                {/* 파일 업로드 */}
                <div className="input-group">
                    <label>첨부 파일</label>

                    <div className="file-upload-zone">
                        <input
                            type="file"
                            accept="image/*"
                            id="post-file-upload"
                            onChange={handleFileChange}
                            hidden
                        />

                        <label
                            htmlFor="post-file-upload"
                            className="upload-label"
                        >
                            <div className="upload-icon-box">
                                <img
                                    src={fileIcon}
                                    alt="fileIcon"
                                    className="fileIcon"
                                />
                            </div>

                            <div className="upload-label-text">
                                {files.length > 0 ? (
                                    <div className="create-file-summary-wrapper">
                                        <div className="create-file-names-ellipsis-zone">
                                            {files
                                                .slice(0, 3)
                                                .map((file, index) => (
                                                    <span
                                                        key={`${file.name}-${index}`}
                                                        className="create-file-name-item"
                                                    >
                                                        {file.name}
                                                        {index <
                                                            files.slice(0, 3)
                                                                .length -
                                                                1 && ", "}
                                                    </span>
                                                ))}
                                        </div>

                                        {files.length > 3 && (
                                            <span className="create-file-count-extra">
                                                외 {files.length - 3}개
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="create-upload-placeholder">
                                        클릭하여 이미지 파일을 업로드하세요.
                                    </span>
                                )}
                            </div>
                        </label>
                    </div>
                </div>

                {/* 이미지 생성 토글 */}
                <div className="bottom-option-zone">
                    <label className="checkbox-label option-trigger">
                        <input
                            type="checkbox"
                            checked={withImage}
                            onChange={() => setWithImage((prev) => !prev)}
                        />

                        <span className="option-text">
                            이미지와 함께 생성하기
                        </span>
                    </label>
                </div>
            </div>

            {/* 생성 버튼 */}
            <button
                type="button"
                className="create-button"
                onClick={handleCreateClick}
            >
                생성하기
                <img src={arrowRight} alt="arrowRight" className="arrow-icon" />
            </button>

            {/* 경고 모달 */}
            {showWarningModal && (
                <div
                    className="modal-backdrop"
                    onClick={() => setShowWarningModal(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>⚠️ 입력 확인</h3>

                        <p>
                            사용할 SNS를 하나 이상 선택하고 내용을 입력해주세요
                        </p>

                        <button
                            type="button"
                            className="modal-btn"
                            onClick={() => setShowWarningModal(false)}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* 생성 확인 모달 */}
            {showConfirmModal && (
                <div
                    className="modal-backdrop"
                    onClick={() => setShowConfirmModal(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>콘텐츠 생성</h3>

                        <p>
                            입력하신 정보로 AI 콘텐츠 생성을 시작하시겠습니까?
                        </p>

                        <div className="modal-btn-group">
                            <button
                                type="button"
                                className="modal-btn confirm"
                                onClick={handleConfirmNext}
                            >
                                확인
                            </button>

                            <button
                                type="button"
                                className="modal-btn cancel"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
