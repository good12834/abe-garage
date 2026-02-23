import React, { useState, useEffect } from "react";
import {
  FaTrophy,
  FaStar,
  FaMedal,
  FaCrown,
  FaGem,
  FaGift,
  FaLevelUpAlt,
  FaFire,
  FaBolt,
  FaRocket,
  FaShieldAlt,
  FaHeart,
  FaMagic,
  FaShare,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaSnapchat,
  FaWhatsapp,
  FaTelegram,
  FaMedal as FaBadge,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBullseye,
} from "react-icons/fa";
import "./GamificationSystem.css";

const GamificationSystem = ({
  currentUser,
  serviceBays,
  queue,
  onAchievementUnlocked,
  onPointsEarned,
}) => {
  const [userStats, setUserStats] = useState({
    totalPoints: 1250,
    level: 7,
    experience: 850,
    nextLevelExp: 1000,
    streak: 12,
    badges: [],
    achievements: [],
  });

  const [dailyChallenge, setDailyChallenge] = useState({
    id: 1,
    title: "Service Speed Demon",
    description: "Complete 3 services in under 45 minutes each",
    progress: 2,
    target: 3,
    reward: 100,
    timeLeft: "6h 23m",
    difficulty: "medium",
  });

  const [weeklyGoals, setWeeklyGoals] = useState([
    {
      id: 1,
      title: "Customer Satisfaction",
      description: "Maintain 95%+ satisfaction rate",
      progress: 92,
      target: 95,
      reward: 200,
      completed: false,
    },
    {
      id: 2,
      title: "Efficiency Expert",
      description: "Complete 50 services this week",
      progress: 34,
      target: 50,
      reward: 300,
      completed: false,
    },
    {
      id: 3,
      title: "Bay Optimizer",
      description: "Keep utilization above 85%",
      progress: 88,
      target: 85,
      reward: 150,
      completed: true,
    },
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { name: "Alex Rodriguez", points: 1850, level: 9, avatar: "AR" },
    { name: "Sarah Chen", points: 1720, level: 8, avatar: "SC" },
    {
      name: currentUser?.name || "You",
      points: 1250,
      level: 7,
      avatar: "YU",
      isCurrentUser: true,
    },
    { name: "Mike Johnson", points: 1180, level: 7, avatar: "MJ" },
    { name: "Emma Wilson", points: 1100, level: 6, avatar: "EW" },
  ]);

  const [availableBadges] = useState([
    {
      id: 1,
      name: "First Service",
      description: "Complete your first service",
      icon: <FaCheckCircle />,
      rarity: "common",
      earned: true,
      earnedDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Speed Demon",
      description: "Complete a service in under 30 minutes",
      icon: <FaBolt />,
      rarity: "uncommon",
      earned: true,
      earnedDate: "2024-01-18",
    },
    {
      id: 3,
      name: "Customer Favorite",
      description: "Get 5 five-star ratings",
      icon: <FaHeart />,
      rarity: "rare",
      earned: true,
      earnedDate: "2024-01-22",
    },
    {
      id: 4,
      name: "Efficiency Master",
      description: "Maintain 90%+ efficiency for 7 days",
      icon: <FaBullseye />,
      rarity: "epic",
      earned: false,
      progress: 5,
      target: 7,
    },
    {
      id: 5,
      name: "Legend",
      description: "Reach level 10",
      icon: <FaCrown />,
      rarity: "legendary",
      earned: false,
      progress: 7,
      target: 10,
    },
  ]);

  const [showShareModal, setShowShareModal] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState([
    {
      id: 1,
      title: "Speed Demon",
      description: "Completed service in 28 minutes",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      points: 50,
    },
    {
      id: 2,
      title: "Customer Satisfaction",
      description: "Received 5-star rating",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      points: 25,
    },
  ]);

  const [showNotifications, setShowNotifications] = useState(true);
  const [animatePoints, setAnimatePoints] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    // Simulate point earning
    if (Math.random() > 0.7) {
      // 30% chance of earning points
      const points = Math.floor(Math.random() * 50) + 10;
      setUserStats((prev) => ({
        ...prev,
        totalPoints: prev.totalPoints + points,
        experience: prev.experience + points,
      }));

      setAnimatePoints(true);
      setTimeout(() => setAnimatePoints(false), 1000);

      onPointsEarned?.(points);
    }

    // Simulate achievement unlocking
    if (Math.random() > 0.8) {
      // 20% chance of achievement
      const achievement = {
        id: Date.now(),
        title: "New Achievement",
        description: "You've unlocked a new badge!",
        timestamp: new Date(),
        points: Math.floor(Math.random() * 100) + 25,
      };

      setRecentAchievements((prev) => [achievement, ...prev.slice(0, 4)]);
      onAchievementUnlocked?.(achievement);
    }
  };

  const getExperiencePercentage = () => {
    return (userStats.experience / userStats.nextLevelExp) * 100;
  };

  const getBadgeColor = (rarity) => {
    const colors = {
      common: "#9ca3af",
      uncommon: "#10b981",
      rare: "#3b82f6",
      epic: "#8b5cf6",
      legendary: "#f59e0b",
    };
    return colors[rarity] || colors.common;
  };

  const shareAchievement = (achievement, platform) => {
    const shareText = `🏆 I just unlocked "${achievement.title}" in the Abe Garage Live Queue System! ${achievement.points} points earned! #AbeGarage #AchievementUnlocked`;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}&quote=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        window.location.href
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        shareText + " " + window.location.href
      )}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(
        window.location.href
      )}&text=${encodeURIComponent(shareText)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const claimDailyReward = () => {
    const reward = 50;
    setUserStats((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + reward,
      experience: prev.experience + reward,
    }));

    const achievement = {
      id: Date.now(),
      title: "Daily Check-in",
      description: "Claimed daily reward",
      timestamp: new Date(),
      points: reward,
    };

    setRecentAchievements((prev) => [achievement, ...prev.slice(0, 4)]);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className="gamification-system">
      {/* Header */}
      <div className="gamification-header">
        <div className="user-level">
          <div className="level-badge">
            <FaCrown className="level-icon" />
            <span className="level-number">{userStats.level}</span>
          </div>
          <div className="level-info">
            <h3>Level {userStats.level}</h3>
            <div className="experience-bar">
              <div
                className="experience-fill"
                style={{ width: `${getExperiencePercentage()}%` }}
              ></div>
            </div>
            <span className="experience-text">
              {userStats.experience} / {userStats.nextLevelExp} XP
            </span>
          </div>
        </div>

        <div className="user-points">
          <div className="points-display">
            <FaGem className="points-icon" />
            <span className={`points-value ${animatePoints ? "animate" : ""}`}>
              {userStats.totalPoints.toLocaleString()}
            </span>
            <span className="points-label">Points</span>
          </div>

          <div className="streak-display">
            <FaFire className="streak-icon" />
            <span className="streak-value">{userStats.streak}</span>
            <span className="streak-label">Day Streak</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="gamification-content">
        {/* Daily Challenge */}
        <div className="challenge-card">
          <div className="card-header">
            <FaBullseye />
            <h3>Daily Challenge</h3>
          </div>
          <div className="challenge-content">
            <h4>{dailyChallenge.title}</h4>
            <p>{dailyChallenge.description}</p>
            <div className="challenge-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      (dailyChallenge.progress / dailyChallenge.target) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <span className="progress-text">
                {dailyChallenge.progress} / {dailyChallenge.target}
              </span>
            </div>
            <div className="challenge-footer">
              <div className="challenge-reward">
                <FaGift />
                <span>{dailyChallenge.reward} points</span>
              </div>
              <div className="challenge-time">
                <FaClock />
                <span>{dailyChallenge.timeLeft} left</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="achievements-card">
          <div className="card-header">
            <FaTrophy />
            <h3>Recent Achievements</h3>
          </div>
          <div className="achievements-list">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="achievement-item">
                <div className="achievement-icon">
                  <FaTrophy />
                </div>
                <div className="achievement-info">
                  <h5>{achievement.title}</h5>
                  <p>{achievement.description}</p>
                  <div className="achievement-meta">
                    <span className="achievement-time">
                      {formatTimeAgo(achievement.timestamp)}
                    </span>
                    <span className="achievement-points">
                      +{achievement.points} points
                    </span>
                  </div>
                </div>
                <button
                  className="share-achievement"
                  onClick={() => setShowShareModal(true)}
                >
                  <FaShare />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="goals-card">
          <div className="card-header">
            <FaRocket />
            <h3>Weekly Goals</h3>
          </div>
          <div className="goals-list">
            {weeklyGoals.map((goal) => (
              <div
                key={goal.id}
                className={`goal-item ${goal.completed ? "completed" : ""}`}
              >
                <div className="goal-main">
                  <div className="goal-header">
                    <h5>{goal.title}</h5>
                    {goal.completed && (
                      <FaCheckCircle className="completed-icon" />
                    )}
                  </div>
                  <p>{goal.description}</p>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(goal.progress / goal.target) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {goal.progress} / {goal.target}
                    </span>
                  </div>
                </div>
                <div className="goal-reward">
                  <FaGift />
                  <span>{goal.reward} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="leaderboard-card">
          <div className="card-header">
            <FaMedal />
            <h3>Leaderboard</h3>
          </div>
          <div className="leaderboard-list">
            {leaderboard.map((user, index) => (
              <div
                key={index}
                className={`leaderboard-item ${
                  user.isCurrentUser ? "current-user" : ""
                }`}
              >
                <div className="rank">
                  <span
                    className={`rank-number ${index < 3 ? "top-rank" : ""}`}
                  >
                    #{index + 1}
                  </span>
                </div>
                <div className="user-avatar">{user.avatar}</div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-level">Level {user.level}</span>
                </div>
                <div className="user-points">
                  {user.points.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge Collection */}
        <div className="badges-card">
          <div className="card-header">
            <FaBadge />
            <h3>Badge Collection</h3>
          </div>
          <div className="badges-grid">
            {availableBadges.map((badge) => (
              <div
                key={badge.id}
                className={`badge-item ${badge.earned ? "earned" : "locked"}`}
                style={{ borderColor: getBadgeColor(badge.rarity) }}
              >
                <div
                  className="badge-icon"
                  style={{
                    color: badge.earned
                      ? getBadgeColor(badge.rarity)
                      : "#6b7280",
                  }}
                >
                  {badge.icon}
                </div>
                <div className="badge-info">
                  <h5>{badge.name}</h5>
                  <p>{badge.description}</p>
                  {badge.earned ? (
                    <span className="earned-date">
                      Earned {new Date(badge.earnedDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <div className="badge-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(badge.progress / badge.target) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {badge.progress} / {badge.target}
                      </span>
                    </div>
                  )}
                </div>
                <div className="badge-rarity">{badge.rarity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal" onClick={() => setShowShareModal(false)}>
          <div className="share-content" onClick={(e) => e.stopPropagation()}>
            <div className="share-header">
              <h3>Share Your Achievement</h3>
              <button
                className="close-share"
                onClick={() => setShowShareModal(false)}
              >
                <FaTimesCircle />
              </button>
            </div>
            <div className="share-options">
              <button
                className="share-btn twitter"
                onClick={() =>
                  shareAchievement(recentAchievements[0], "twitter")
                }
              >
                <FaTwitter />
                Twitter
              </button>
              <button
                className="share-btn facebook"
                onClick={() =>
                  shareAchievement(recentAchievements[0], "facebook")
                }
              >
                <FaFacebook />
                Facebook
              </button>
              <button
                className="share-btn linkedin"
                onClick={() =>
                  shareAchievement(recentAchievements[0], "linkedin")
                }
              >
                <FaLinkedin />
                LinkedIn
              </button>
              <button
                className="share-btn whatsapp"
                onClick={() =>
                  shareAchievement(recentAchievements[0], "whatsapp")
                }
              >
                <FaWhatsapp />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Reward Button */}
      <div className="daily-reward">
        <button className="reward-btn" onClick={claimDailyReward}>
          <FaGift />
          Claim Daily Reward
          <span className="reward-amount">+50 pts</span>
        </button>
      </div>
    </div>
  );
};

export default GamificationSystem;
