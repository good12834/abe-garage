import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  StarIcon,
  ChatBubbleLeftEllipsisIcon,
  FaceSmileIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  FunnelIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const CustomerFeedbackSystem = () => {
  const { user } = useAuth();
  const [feedbackData, setFeedbackData] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [feedbackTrends, setFeedbackTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("30days");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    serviceType: "",
    comment: "",
    wouldRecommend: true,
  });

  useEffect(() => {
    fetchFeedbackData();
  }, [selectedFilter, selectedTimeframe]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);

      // Mock feedback data
      const mockFeedback = {
        overallRating: 4.6,
        totalReviews: 1247,
        ratingDistribution: [
          { rating: 5, count: 756, percentage: 60.6 },
          { rating: 4, count: 312, percentage: 25.0 },
          { rating: 3, count: 112, percentage: 9.0 },
          { rating: 2, count: 42, percentage: 3.4 },
          { rating: 1, count: 25, percentage: 2.0 },
        ],
        serviceRatings: {
          quality: 4.7,
          timeliness: 4.5,
          communication: 4.6,
          value: 4.4,
          professionalism: 4.8,
          cleanliness: 4.7,
        },
        npsScore: 72, // Net Promoter Score
        responseRate: 89,
        averageResponseTime: "2.3 hours",
        monthlyTrends: [
          { month: "Jul", rating: 4.3, reviews: 95, nps: 65 },
          { month: "Aug", rating: 4.4, reviews: 112, nps: 68 },
          { month: "Sep", rating: 4.5, reviews: 134, nps: 70 },
          { month: "Oct", rating: 4.6, reviews: 156, nps: 71 },
          { month: "Nov", rating: 4.6, reviews: 178, nps: 72 },
          { month: "Dec", rating: 4.6, reviews: 189, nps: 72 },
        ],
        categoryBreakdown: [
          { category: "Routine Maintenance", rating: 4.7, count: 456 },
          { category: "Brake Service", rating: 4.5, count: 234 },
          { category: "Engine Repair", rating: 4.4, count: 189 },
          { category: "Oil Change", rating: 4.8, count: 312 },
          { category: "Tire Service", rating: 4.6, count: 156 },
        ],
      };

      const mockRecentFeedback = [
        {
          id: 1,
          customerName: "Sarah Johnson",
          rating: 5,
          serviceType: "Oil Change",
          comment:
            "Excellent service! Quick, professional, and fair pricing. The team explained everything clearly.",
          date: "2025-12-10",
          wouldRecommend: true,
          response: "Thank you Sarah! We appreciate your kind words.",
          respondedAt: "2025-12-10",
          verified: true,
          helpful: 12,
        },
        {
          id: 2,
          customerName: "Mike Chen",
          rating: 4,
          serviceType: "Brake Service",
          comment:
            "Good work on my brakes. Took a bit longer than expected but the quality was worth it.",
          date: "2025-12-09",
          wouldRecommend: true,
          response:
            "Thanks Mike! We strive for quality work which sometimes takes extra time.",
          respondedAt: "2025-12-09",
          verified: true,
          helpful: 8,
        },
        {
          id: 3,
          customerName: "Emily Rodriguez",
          rating: 5,
          serviceType: "Engine Diagnostics",
          comment:
            "Found the issue quickly and fixed it efficiently. Very knowledgeable mechanic!",
          date: "2025-12-08",
          wouldRecommend: true,
          response: null,
          respondedAt: null,
          verified: true,
          helpful: 15,
        },
        {
          id: 4,
          customerName: "David Wilson",
          rating: 3,
          serviceType: "Tire Rotation",
          comment:
            "Service was okay but could be faster. Waiting area could use some improvements.",
          date: "2025-12-07",
          wouldRecommend: false,
          response:
            "Thank you for the feedback David. We're working on improving our wait times.",
          respondedAt: "2025-12-07",
          verified: true,
          helpful: 5,
        },
        {
          id: 5,
          customerName: "Lisa Thompson",
          rating: 5,
          serviceType: "Transmission Service",
          comment:
            "Outstanding work! My car runs smoother than ever. Highly recommend Abe Garage!",
          date: "2025-12-06",
          wouldRecommend: true,
          response: "Thank you Lisa! We take pride in our transmission work.",
          respondedAt: "2025-12-06",
          verified: true,
          helpful: 22,
        },
      ];

      setTimeout(() => {
        setFeedbackData(mockFeedback);
        setRecentFeedback(mockRecentFeedback);
        setRatingDistribution(mockFeedback.ratingDistribution);
        setFeedbackTrends(mockFeedback.monthlyTrends);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      setLoading(false);
    }
  };

  const renderStars = (rating, size = "w-5 h-5", interactive = false) => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`${interactive ? "btn btn-link p-0" : ""}`}
            disabled={!interactive}
            onClick={() =>
              interactive && setNewReview({ ...newReview, rating: star })
            }
          >
            {star <= rating ? (
              <StarIconSolid className={`${size} text-yellow-400`} />
            ) : (
              <StarIcon className={`${size} text-gray-300`} />
            )}
          </button>
        ))}
      </div>
    );
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    // In real implementation, this would send the review to the API
    console.log("Submitting review:", newReview);
    setShowReviewForm(false);
    setNewReview({
      rating: 5,
      serviceType: "",
      comment: "",
      wouldRecommend: true,
    });
    alert("Thank you for your feedback!");
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "#10b981"; // green
    if (rating >= 4.0) return "#3b82f6"; // blue
    if (rating >= 3.0) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280"];

  const serviceRatingData = Object.entries(
    feedbackData?.serviceRatings || {}
  ).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    rating: value,
    fullMark: 5,
  }));

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <ChatBubbleLeftEllipsisIcon className="me-2 text-primary" />
            Customer Feedback System
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-dashboard">
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2>
            <ChatBubbleLeftEllipsisIcon className="me-3 text-primary" />
            Customer Feedback & Rating System
          </h2>
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowReviewForm(true)}
            >
              <PaperAirplaneIcon className="w-4 h-4 me-1" />
              Write Review
            </button>
            <button className="btn btn-outline-primary btn-sm">
              <ChartBarIcon className="w-4 h-4 me-1" />
              Export Reports
            </button>
          </div>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="metrics-section mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card border-0 bg-primary text-white">
              <div className="card-body text-center">
                <div className="d-flex justify-content-center mb-2">
                  {renderStars(
                    Math.round(feedbackData.overallRating),
                    "w-8 h-8"
                  )}
                </div>
                <h3 className="mb-0">{feedbackData.overallRating}</h3>
                <p className="mb-0">Overall Rating</p>
                <small>({feedbackData.totalReviews} reviews)</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-success text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{feedbackData.npsScore}</h3>
                <p className="mb-0">Net Promoter Score</p>
                <small>Excellent</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-info text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{feedbackData.responseRate}%</h3>
                <p className="mb-0">Response Rate</p>
                <small>{feedbackData.averageResponseTime} avg response</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-warning text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">
                  {recentFeedback.filter((f) => f.wouldRecommend).length}
                </h3>
                <p className="mb-0">Would Recommend</p>
                <small>Out of last 5 reviews</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Rating Distribution</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={ratingDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ rating, percentage }) =>
                        `${rating}★ (${percentage}%)`
                      }
                    >
                      {ratingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Service Quality Metrics</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={serviceRatingData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 5]}
                      tick={{ fontSize: 10 }}
                    />
                    <Radar
                      name="Rating"
                      dataKey="rating"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Monthly Trends</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={feedbackTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[4.0, 5.0]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Category Breakdown */}
      <div className="category-section mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Service Category Performance</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {feedbackData.categoryBreakdown.map((category, index) => (
                <div key={index} className="col-md-4">
                  <div className="d-flex justify-content-between align-items-center p-3 border rounded-3">
                    <div>
                      <h6 className="mb-0">{category.category}</h6>
                      <small className="text-muted">
                        {category.count} reviews
                      </small>
                    </div>
                    <div className="text-end">
                      <div className="d-flex align-items-center">
                        {renderStars(Math.round(category.rating), "w-4 h-4")}
                        <span className="ms-2 fw-bold">{category.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="reviews-section">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Customer Reviews</h6>
              <div className="d-flex gap-2">
                <select
                  className="form-select form-select-sm"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  style={{ width: "auto" }}
                >
                  <option value="all">All Reviews</option>
                  <option value="5">5 Star</option>
                  <option value="4">4 Star</option>
                  <option value="3">3 Star</option>
                  <option value="unresponded">Unresponded</option>
                </select>
                <select
                  className="form-select form-select-sm"
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  style={{ width: "auto" }}
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="reviews-list">
              {recentFeedback.map((review) => (
                <motion.div
                  key={review.id}
                  className="review-item border-bottom pb-3 mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center">
                      <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h6 className="mb-0">
                          {review.customerName}
                          {review.verified && (
                            <CheckCircleIcon className="w-4 h-4 text-success ms-1" />
                          )}
                        </h6>
                        <small className="text-muted">
                          {review.serviceType}
                        </small>
                      </div>
                    </div>
                    <div className="text-end">
                      {renderStars(review.rating, "w-4 h-4")}
                      <small className="text-muted d-block">
                        {new Date(review.date).toLocaleDateString()}
                      </small>
                    </div>
                  </div>

                  <p className="mb-2">{review.comment}</p>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                      {review.wouldRecommend ? (
                        <span className="badge bg-success">
                          <HeartIconSolid className="w-3 h-3 me-1" />
                          Would Recommend
                        </span>
                      ) : (
                        <span className="badge bg-danger">
                          <ExclamationTriangleIcon className="w-3 h-3 me-1" />
                          Would Not Recommend
                        </span>
                      )}
                      <small className="text-muted">
                        {review.helpful} found this helpful
                      </small>
                    </div>
                    {review.response ? (
                      <div className="response-section mt-2 p-2 bg-light rounded">
                        <small className="text-muted d-block">
                          <strong>Response:</strong> {review.response}
                        </small>
                        <small className="text-muted">
                          Responded{" "}
                          {new Date(review.respondedAt).toLocaleDateString()}
                        </small>
                      </div>
                    ) : (
                      <button className="btn btn-outline-primary btn-sm">
                        Respond
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Write a Review</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReviewForm(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitReview}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    {renderStars(newReview.rating, "w-6 h-6", true)}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Service Type</label>
                    <select
                      className="form-select"
                      value={newReview.serviceType}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          serviceType: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select service type</option>
                      <option value="Oil Change">Oil Change</option>
                      <option value="Brake Service">Brake Service</option>
                      <option value="Engine Repair">Engine Repair</option>
                      <option value="Transmission Service">
                        Transmission Service
                      </option>
                      <option value="Tire Service">Tire Service</option>
                      <option value="Routine Maintenance">
                        Routine Maintenance
                      </option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Review</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      placeholder="Share your experience..."
                      required
                    ></textarea>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={newReview.wouldRecommend}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          wouldRecommend: e.target.checked,
                        })
                      }
                    />
                    <label className="form-check-label">
                      I would recommend this service to others
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFeedbackSystem;
