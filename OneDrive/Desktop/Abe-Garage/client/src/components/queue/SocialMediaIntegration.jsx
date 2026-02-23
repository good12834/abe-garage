import React, { useState, useEffect } from "react";
import {
  FaShare,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaSnapchat,
  FaWhatsapp,
  FaTelegram,
  FaPinterest,
  FaReddit,
  FaTiktok,
  FaYoutube,
  FaLink,
  FaQrcode,
  FaEnvelope,
  FaSms,
  FaCopy,
  FaCheck,
  FaHeart,
  FaComment,
  FaRetweet,
  FaBookmark,
  FaEye,
  FaUsers,
  FaGlobe,
  FaClock,
  FaMapMarkerAlt,
  FaCar,
  FaStar,
  FaTrophy,
  FaGift,
} from "react-icons/fa";
import "./SocialMediaIntegration.css";

const SocialMediaIntegration = ({
  serviceInfo,
  customerInfo,
  onShareComplete,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState("share");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [shareStats, setShareStats] = useState({
    totalShares: 0,
    platformBreakdown: {},
    recentShares: [],
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeData, setQRCodeData] = useState("");

  // Pre-defined share templates
  const shareTemplates = {
    serviceComplete: {
      title: "Service Completed!",
      message:
        "Just had amazing vehicle is running service at Abe Garage 🚗✨ My! perfectly now.",
      hashtags: "#AbeGarage #CarService #QualityService #CustomerSatisfied",
      image: "/service-complete.jpg",
    },
    waitingInQueue: {
      title: "Waiting in Queue",
      message:
        "Waiting for my car service at Abe Garage. Great experience so far! 👍",
      hashtags: "#AbeGarage #CarService #Queue #Waiting",
      image: "/queue-waiting.jpg",
    },
    recommendation: {
      title: "Highly Recommended!",
      message:
        "Just experienced top-notch car service at Abe Garage. Professional, fast, and reliable!",
      hashtags: "#AbeGarage #Recommended #CarService #Professional",
      image: "/recommendation.jpg",
    },
    achievement: {
      title: "Achievement Unlocked!",
      message:
        "Just earned points for my service experience at Abe Garage! 🏆 Love their loyalty program.",
      hashtags: "#AbeGarage #LoyaltyPoints #Achievement #CarService",
      image: "/achievement.jpg",
    },
  };

  const socialPlatforms = [
    {
      id: "twitter",
      name: "Twitter",
      icon: <FaTwitter />,
      color: "#1da1f2",
      description: "Share on Twitter",
      characterLimit: 280,
      supportsImages: true,
      supportsHashtags: true,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <FaFacebook />,
      color: "#4267b2",
      description: "Share on Facebook",
      characterLimit: 63206,
      supportsImages: true,
      supportsHashtags: true,
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <FaInstagram />,
      color: "#e1306c",
      description: "Share on Instagram",
      characterLimit: 2200,
      supportsImages: true,
      supportsHashtags: true,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <FaLinkedin />,
      color: "#0077b5",
      description: "Share on LinkedIn",
      characterLimit: 3000,
      supportsImages: true,
      supportsHashtags: true,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      color: "#25d366",
      description: "Share via WhatsApp",
      characterLimit: 4096,
      supportsImages: true,
      supportsHashtags: false,
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: <FaTelegram />,
      color: "#0088cc",
      description: "Share via Telegram",
      characterLimit: 4096,
      supportsImages: true,
      supportsHashtags: false,
    },
    {
      id: "snapchat",
      name: "Snapchat",
      icon: <FaSnapchat />,
      color: "#fffc00",
      description: "Share on Snapchat",
      characterLimit: 250,
      supportsImages: true,
      supportsHashtags: false,
    },
    {
      id: "pinterest",
      name: "Pinterest",
      icon: <FaPinterest />,
      color: "#bd081c",
      description: "Share on Pinterest",
      characterLimit: 500,
      supportsImages: true,
      supportsHashtags: true,
    },
    {
      id: "reddit",
      name: "Reddit",
      icon: <FaReddit />,
      color: "#ff4500",
      description: "Share on Reddit",
      characterLimit: 40000,
      supportsImages: true,
      supportsHashtags: true,
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: <FaTiktok />,
      color: "#000000",
      description: "Share on TikTok",
      characterLimit: 150,
      supportsImages: false,
      supportsHashtags: true,
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: <FaYoutube />,
      color: "#ff0000",
      description: "Share on YouTube",
      characterLimit: 5000,
      supportsImages: true,
      supportsHashtags: true,
    },
  ];

  const otherSharingOptions = [
    {
      id: "sms",
      name: "SMS",
      icon: <FaSms />,
      color: "#34c759",
      description: "Send via SMS",
    },
    {
      id: "email",
      name: "Email",
      icon: <FaEnvelope />,
      color: "#007aff",
      description: "Send via Email",
    },
    {
      id: "link",
      name: "Copy Link",
      icon: <FaLink />,
      color: "#8e8e93",
      description: "Copy to clipboard",
    },
    {
      id: "qr",
      name: "QR Code",
      icon: <FaQrcode />,
      color: "#000000",
      description: "Generate QR Code",
    },
  ];

  useEffect(() => {
    // Initialize QR code data
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/share/${serviceInfo?.id || "general"}`;
    setQRCodeData(shareUrl);

    // Load share statistics
    loadShareStats();
  }, [serviceInfo]);

  const loadShareStats = async () => {
    // Mock share statistics
    setShareStats({
      totalShares: 47,
      platformBreakdown: {
        twitter: 15,
        facebook: 12,
        whatsapp: 8,
        instagram: 6,
        linkedin: 4,
        other: 2,
      },
      recentShares: [
        {
          platform: "twitter",
          message: "Great service at Abe Garage!",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          platform: "facebook",
          message: "Highly recommend Abe Garage",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
      ],
    });
  };

  const generateShareContent = (platform, templateType = "serviceComplete") => {
    const template = shareTemplates[templateType];
    const serviceDetails = serviceInfo
      ? `\n\nService: ${serviceInfo.serviceName}\nVehicle: ${serviceInfo.vehicleInfo}`
      : "";

    let content = `${template.message}${serviceDetails}\n\n${template.hashtags}`;

    // Truncate if necessary for character limits
    const platformConfig = socialPlatforms.find((p) => p.id === platform);
    if (platformConfig && content.length > platformConfig.characterLimit) {
      content = content.substring(0, platformConfig.characterLimit - 3) + "...";
    }

    return content;
  };

  const handleShare = (platform, templateType = "serviceComplete") => {
    const content = generateShareContent(platform, templateType);
    const shareUrl = `https://${platform}.com/share?url=${encodeURIComponent(
      window.location.href
    )}&text=${encodeURIComponent(content)}`;

    // Platform-specific sharing
    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            content
          )}&url=${encodeURIComponent(window.location.href)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            window.location.href
          )}&quote=${encodeURIComponent(content)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            window.location.href
          )}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            content + " " + window.location.href
          )}`,
          "_blank"
        );
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            window.location.href
          )}&text=${encodeURIComponent(content)}`,
          "_blank"
        );
        break;
      case "instagram":
        // Instagram doesn't support direct URL sharing, show message
        alert(
          "Please copy the content and share manually on Instagram:\n\n" +
            content
        );
        break;
      default:
        // Fallback for other platforms
        navigator.clipboard
          .writeText(content + " " + window.location.href)
          .then(() => {
            alert(
              "Content copied to clipboard! You can now paste it on " + platform
            );
          });
    }

    // Update share statistics
    setShareStats((prev) => ({
      ...prev,
      totalShares: prev.totalShares + 1,
      platformBreakdown: {
        ...prev.platformBreakdown,
        [platform]: (prev.platformBreakdown[platform] || 0) + 1,
      },
      recentShares: [
        {
          platform,
          message: content.substring(0, 50) + "...",
          timestamp: new Date(),
        },
        ...prev.recentShares.slice(0, 4),
      ],
    }));

    onShareComplete?.({ platform, content, timestamp: new Date() });
  };

  const copyToClipboard = () => {
    const content = generateShareContent("link");
    navigator.clipboard
      .writeText(content + " " + window.location.href)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
  };

  const generateQRCode = () => {
    setShowQRModal(true);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className="social-media-integration">
      {/* Header */}
      <div className="social-header">
        <div className="header-main">
          <div className="social-icon">
            <FaShare />
          </div>
          <div>
            <h3>Social Media Integration</h3>
            <p className="subtitle">
              Share your service experience across social platforms
            </p>
          </div>
        </div>

        <div className="share-stats">
          <div className="stat-item">
            <FaShare className="stat-icon" />
            <span className="stat-value">{shareStats.totalShares}</span>
            <span className="stat-label">Total Shares</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "share" ? "active" : ""}`}
          onClick={() => setActiveTab("share")}
        >
          <FaShare />
          Share
        </button>
        <button
          className={`tab-btn ${activeTab === "templates" ? "active" : ""}`}
          onClick={() => setActiveTab("templates")}
        >
          <FaGift />
          Templates
        </button>
        <button
          className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <FaEye />
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "share" && (
          <div className="share-options">
            <div className="platforms-grid">
              {socialPlatforms.map((platform) => (
                <button
                  key={platform.id}
                  className="platform-btn"
                  style={{ borderColor: platform.color }}
                  onClick={() => handleShare(platform.id)}
                  title={platform.description}
                >
                  <div
                    className="platform-icon"
                    style={{ color: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <span className="platform-name">{platform.name}</span>
                  <span className="platform-count">
                    {shareStats.platformBreakdown[platform.id] || 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="other-options">
              <h4>Other Options</h4>
              <div className="options-grid">
                {otherSharingOptions.map((option) => (
                  <button
                    key={option.id}
                    className="option-btn"
                    style={{ borderColor: option.color }}
                    onClick={() => {
                      switch (option.id) {
                        case "link":
                          copyToClipboard();
                          break;
                        case "qr":
                          generateQRCode();
                          break;
                        case "sms":
                          window.open(
                            `sms:?body=${encodeURIComponent(
                              generateShareContent("sms")
                            )}`
                          );
                          break;
                        case "email":
                          window.open(
                            `mailto:?subject=${encodeURIComponent(
                              "Check out Abe Garage"
                            )}&body=${encodeURIComponent(
                              generateShareContent("email")
                            )}`
                          );
                          break;
                      }
                    }}
                  >
                    <div
                      className="option-icon"
                      style={{ color: option.color }}
                    >
                      {option.icon}
                    </div>
                    <span className="option-name">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="template-options">
            <div className="templates-grid">
              {Object.entries(shareTemplates).map(([key, template]) => (
                <div key={key} className="template-card">
                  <div className="template-header">
                    <h4>{template.title}</h4>
                    <span className="template-type">{key}</span>
                  </div>
                  <p className="template-message">{template.message}</p>
                  <div className="template-hashtags">{template.hashtags}</div>
                  <div className="template-actions">
                    {socialPlatforms.slice(0, 4).map((platform) => (
                      <button
                        key={platform.id}
                        className="template-share-btn"
                        style={{ color: platform.color }}
                        onClick={() => handleShare(platform.id, key)}
                        title={`Share on ${platform.name}`}
                      >
                        {platform.icon}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-content">
            <div className="analytics-overview">
              <div className="overview-stats">
                <div className="overview-stat">
                  <FaUsers className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{shareStats.totalShares}</span>
                    <span className="stat-label">Total Shares</span>
                  </div>
                </div>
                <div className="overview-stat">
                  <FaGlobe className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">
                      {Object.keys(shareStats.platformBreakdown).length}
                    </span>
                    <span className="stat-label">Platforms Used</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="platform-breakdown">
              <h4>Platform Breakdown</h4>
              <div className="breakdown-list">
                {Object.entries(shareStats.platformBreakdown).map(
                  ([platform, count]) => {
                    const platformInfo = socialPlatforms.find(
                      (p) => p.id === platform
                    );
                    const percentage = (count / shareStats.totalShares) * 100;

                    return (
                      <div key={platform} className="breakdown-item">
                        <div className="platform-info">
                          <div
                            className="platform-icon-small"
                            style={{ color: platformInfo?.color || "#6b7280" }}
                          >
                            {platformInfo?.icon || <FaShare />}
                          </div>
                          <span className="platform-name-small">
                            {platformInfo?.name || platform}
                          </span>
                        </div>
                        <div className="breakdown-stats">
                          <div className="breakdown-bar">
                            <div
                              className="breakdown-fill"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor:
                                  platformInfo?.color || "#6b7280",
                              }}
                            ></div>
                          </div>
                          <span className="breakdown-count">{count}</span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="recent-shares">
              <h4>Recent Shares</h4>
              <div className="shares-list">
                {shareStats.recentShares.map((share, index) => {
                  const platformInfo = socialPlatforms.find(
                    (p) => p.id === share.platform
                  );
                  return (
                    <div key={index} className="share-item">
                      <div
                        className="platform-icon-small"
                        style={{ color: platformInfo?.color || "#6b7280" }}
                      >
                        {platformInfo?.icon || <FaShare />}
                      </div>
                      <div className="share-content">
                        <p className="share-message">{share.message}</p>
                        <span className="share-time">
                          {formatTimeAgo(share.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="qr-modal" onClick={() => setShowQRModal(false)}>
          <div className="qr-content" onClick={(e) => e.stopPropagation()}>
            <div className="qr-header">
              <h3>Share via QR Code</h3>
              <button
                className="qr-close"
                onClick={() => setShowQRModal(false)}
              >
                ×
              </button>
            </div>
            <div className="qr-code-display">
              <div className="qr-placeholder">
                <FaQrcode className="qr-icon" />
                <p>QR Code for: {qrCodeData}</p>
                <small>Scan this code to access the share link</small>
              </div>
            </div>
            <div className="qr-actions">
              <button className="qr-download-btn">Download QR Code</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaIntegration;
