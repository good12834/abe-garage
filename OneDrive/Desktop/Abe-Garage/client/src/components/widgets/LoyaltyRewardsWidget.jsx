import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  StarIcon,
  GiftIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  FireIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const LoyaltyRewardsWidget = ({ className = "" }) => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    fetchLoyaltyData();
  }, [user]);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);

      // Mock data - in real implementation, this would call the API
      const mockLoyaltyData = {
        program: {
          id: 1,
          name: "Abe Garage Rewards",
          tier: "gold",
          totalPoints: 2750,
          availablePoints: 2450,
          lifetimePoints: 4200,
          totalSpent: 2750,
          visitCount: 12,
          memberSince: "2023-03-15",
          nextTierThreshold: 5000,
          tierBenefits: [
            "Priority booking",
            "10% service discount",
            "Free vehicle inspection",
            "Complimentary car wash",
          ],
        },
        tierProgress: {
          current: 2750,
          next: 5000,
          percentage: 55,
          pointsNeeded: 2250,
        },
        monthlyActivity: [
          { month: "Jul", points: 150, visits: 1, spent: 180 },
          { month: "Aug", points: 200, visits: 1, spent: 220 },
          { month: "Sep", points: 180, visits: 1, spent: 200 },
          { month: "Oct", points: 300, visits: 2, spent: 350 },
          { month: "Nov", points: 250, visits: 1, spent: 280 },
          { month: "Dec", points: 400, visits: 2, spent: 450 },
        ],
      };

      const mockRewards = [
        {
          id: 1,
          name: "10% Off Next Service",
          description: "Get 10% discount on your next service appointment",
          category: "service_discount",
          pointsCost: 500,
          monetaryValue: 25,
          tierRequirement: "bronze",
          isAvailable: true,
          terms: "Valid for 6 months from redemption date",
        },
        {
          id: 2,
          name: "Free Oil Change",
          description: "Complimentary oil change service (up to 5 quarts)",
          category: "free_service",
          pointsCost: 1000,
          monetaryValue: 45,
          tierRequirement: "silver",
          isAvailable: true,
          terms: "Valid for 3 months from redemption date",
        },
        {
          id: 3,
          name: "Priority Booking",
          description:
            "Skip the queue - book appointments with priority scheduling",
          category: "priority_booking",
          pointsCost: 750,
          monetaryValue: 0,
          tierRequirement: "bronze",
          isAvailable: true,
          terms: "Valid for 1 year from redemption date",
        },
        {
          id: 4,
          name: "Car Wash Package",
          description: "Free exterior and interior car wash",
          category: "service_discount",
          pointsCost: 300,
          monetaryValue: 20,
          tierRequirement: "bronze",
          isAvailable: true,
          terms: "Valid for 2 months from redemption date",
        },
        {
          id: 5,
          name: "$25 Gift Card",
          description: "Digital gift card for local businesses",
          category: "gift_card",
          pointsCost: 1500,
          monetaryValue: 25,
          tierRequirement: "gold",
          isAvailable: true,
          terms: "No expiration date",
        },
      ];

      const mockTransactions = [
        {
          id: 1,
          type: "earned",
          points: 400,
          description: "Points earned from brake service",
          date: "2025-12-05",
          reference: "Appointment #1234",
        },
        {
          id: 2,
          type: "redeemed",
          points: -500,
          description: "Redeemed for 10% Off Next Service",
          date: "2025-11-28",
          reference: "Reward #5678",
        },
        {
          id: 3,
          type: "earned",
          points: 250,
          description: "Points earned from oil change",
          date: "2025-11-15",
          reference: "Appointment #1220",
        },
        {
          id: 4,
          type: "bonus",
          points: 100,
          description: "Tier upgrade bonus: GOLD",
          date: "2025-10-20",
          reference: "Tier Upgrade",
        },
      ];

      setTimeout(() => {
        setLoyaltyData(mockLoyaltyData);
        setAvailableRewards(mockRewards);
        setRecentTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: "#cd7f32",
      silver: "#c0c0c0",
      gold: "#ffd700",
      platinum: "#e5e4e2",
      diamond: "#b9f2ff",
    };
    return colors[tier] || "#6b7280";
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case "bronze":
        return <TrophyIcon className="w-5 h-5" />;
      case "silver":
        return <StarIcon className="w-5 h-5" />;
      case "gold":
        return <FireIcon className="w-5 h-5" />;
      case "platinum":
        return <SparklesIcon className="w-5 h-5" />;
      case "diamond":
        return <GiftIcon className="w-5 h-5" />;
      default:
        return <StarIcon className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "service_discount":
        return <CurrencyDollarIcon className="w-4 h-4" />;
      case "free_service":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "gift_card":
        return <GiftIcon className="w-4 h-4" />;
      case "priority_booking":
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <StarIcon className="w-4 h-4" />;
    }
  };

  const formatCategoryName = (category) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const canRedeem = (reward) => {
    return (
      loyaltyData && loyaltyData.program.availablePoints >= reward.pointsCost
    );
  };

  const handleRedeem = (reward) => {
    if (canRedeem(reward)) {
      // In real implementation, this would call the API
      alert(`Redeeming ${reward.name} for ${reward.pointsCost} points!`);
    }
  };

  if (loading) {
    return (
      <motion.div
        className={`card h-100 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <StarIcon className="me-2 text-primary" />
            Loyalty Rewards
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading your rewards...</p>
        </div>
      </motion.div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className={`card h-100 ${className}`}>
        <div className="card-body text-center">
          <StarIcon className="w-12 h-12 text-muted mx-auto mb-3" />
          <h6>Join Our Rewards Program</h6>
          <p className="text-muted">
            Start earning points with every service visit!
          </p>
          <button className="btn btn-primary">Join Now</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`card h-100 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <StarIcon className="me-2 text-primary" />
          Loyalty Rewards
          <span
            className="badge ms-2 text-white"
            style={{ backgroundColor: getTierColor(loyaltyData.program.tier) }}
          >
            {loyaltyData.program.tier.toUpperCase()}
          </span>
        </h6>
        <div className="d-flex align-items-center gap-2">
          <div className="text-end">
            <div className="fw-bold text-primary">
              {loyaltyData.program.availablePoints.toLocaleString()}
            </div>
            <small className="text-muted">Points Available</small>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Tab Navigation */}
        <div className="d-flex mb-3 border-bottom">
          {[
            { id: "overview", label: "Overview" },
            { id: "rewards", label: "Rewards" },
            { id: "activity", label: "Activity" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`btn btn-sm me-3 ${
                selectedTab === tab.id ? "btn-primary" : "btn-outline-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === "overview" && (
          <div className="loyalty-overview">
            {/* Tier Progress */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Tier Progress</h6>
                <small className="text-muted">
                  {loyaltyData.tierProgress.pointsNeeded.toLocaleString()}{" "}
                  points to{" "}
                  {loyaltyData.program.tier === "gold"
                    ? "Platinum"
                    : "next tier"}
                </small>
              </div>
              <div className="progress mb-2" style={{ height: "10px" }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${loyaltyData.tierProgress.percentage}%`,
                    backgroundColor: getTierColor(loyaltyData.program.tier),
                  }}
                ></div>
              </div>
              <div className="d-flex justify-content-between text-sm">
                <span>{loyaltyData.tierProgress.current.toLocaleString()}</span>
                <span>{loyaltyData.tierProgress.next.toLocaleString()}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="h5 mb-0 text-primary">
                    {loyaltyData.program.lifetimePoints.toLocaleString()}
                  </div>
                  <small className="text-muted">Lifetime Points</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="h5 mb-0 text-success">
                    {loyaltyData.program.visitCount}
                  </div>
                  <small className="text-muted">Total Visits</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="h5 mb-0 text-info">
                    ${loyaltyData.program.totalSpent.toLocaleString()}
                  </div>
                  <small className="text-muted">Total Spent</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="h5 mb-0 text-warning">
                    {new Date(loyaltyData.program.memberSince).getFullYear()}
                  </div>
                  <small className="text-muted">Member Since</small>
                </div>
              </div>
            </div>

            {/* Monthly Activity Chart */}
            <div className="mb-3">
              <h6 className="mb-3">Monthly Activity</h6>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={loyaltyData.monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tier Benefits */}
            <div>
              <h6 className="mb-3">
                {loyaltyData.program.tier.charAt(0).toUpperCase() +
                  loyaltyData.program.tier.slice(1)}{" "}
                Tier Benefits
              </h6>
              <div className="row g-2">
                {loyaltyData.program.tierBenefits.map((benefit, index) => (
                  <div key={index} className="col-12">
                    <div className="d-flex align-items-center">
                      <CheckCircleIcon className="w-4 h-4 text-success me-2" />
                      <small>{benefit}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {selectedTab === "rewards" && (
          <div className="rewards-catalog">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Available Rewards</h6>
              <small className="text-muted">
                {loyaltyData.program.availablePoints.toLocaleString()} points
                available
              </small>
            </div>
            <div className="rewards-list">
              {availableRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  className={`reward-item border rounded-3 p-3 mb-3 ${
                    canRedeem(reward) ? "border-success" : "border-muted"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center">
                      {getCategoryIcon(reward.category)}
                      <h6 className="ms-2 mb-0">{reward.name}</h6>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-primary">
                        {reward.pointsCost.toLocaleString()}
                      </div>
                      <small className="text-muted">points</small>
                    </div>
                  </div>

                  <p className="text-muted mb-2 small">{reward.description}</p>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">
                        Value: ${reward.monetaryValue}
                      </small>
                      <small className="text-muted">
                        Tier:{" "}
                        {reward.tierRequirement.charAt(0).toUpperCase() +
                          reward.tierRequirement.slice(1)}
                      </small>
                    </div>
                    <button
                      className={`btn btn-sm ${
                        canRedeem(reward)
                          ? "btn-success"
                          : "btn-outline-secondary"
                      }`}
                      disabled={!canRedeem(reward)}
                      onClick={() => handleRedeem(reward)}
                    >
                      {canRedeem(reward) ? "Redeem" : "Insufficient Points"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {selectedTab === "activity" && (
          <div className="loyalty-activity">
            <h6 className="mb-3">Recent Activity</h6>
            <div className="activity-list">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="activity-item d-flex justify-content-between align-items-center py-2 border-bottom"
                >
                  <div className="d-flex align-items-center">
                    <div
                      className={`rounded-circle p-2 me-3 ${
                        transaction.type === "earned"
                          ? "bg-success text-white"
                          : transaction.type === "redeemed"
                          ? "bg-danger text-white"
                          : "bg-warning text-white"
                      }`}
                    >
                      {transaction.type === "earned" && (
                        <StarIcon className="w-4 h-4" />
                      )}
                      {transaction.type === "redeemed" && (
                        <GiftIcon className="w-4 h-4" />
                      )}
                      {transaction.type === "bonus" && (
                        <TrophyIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="fw-medium">{transaction.description}</div>
                      <small className="text-muted">
                        {transaction.reference} •{" "}
                        {new Date(transaction.date).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <div
                    className={`fw-bold ${
                      transaction.points > 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {transaction.points > 0 ? "+" : ""}
                    {transaction.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LoyaltyRewardsWidget;
