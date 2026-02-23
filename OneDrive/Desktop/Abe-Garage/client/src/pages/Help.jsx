import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./Help.css";
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MapPinIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  ArrowPathIcon,
  TrophyIcon,
  FireIcon,
  LightBulbIcon,
  AcademicCapIcon,
  CloudArrowDownIcon,
  SpeakerWaveIcon,
  UserIcon,
  CogIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });

  // New state for enhanced features
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [popularQuestions, setPopularQuestions] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [articleRatings, setArticleRatings] = useState({});
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [helpStats, setHelpStats] = useState({
    totalArticles: 24,
    satisfactionRate: 98,
    avgResponseTime: "< 2 hours",
    activeUsers: 1247,
  });
  const [searchHistory, setSearchHistory] = useState([]);

  const helpCategories = [
    {
      id: "all",
      name: "All Topics",
      icon: BookOpenIcon,
      count: 24,
      color: "#667eea",
    },
    {
      id: "appointments",
      name: "Appointments",
      icon: ClockIcon,
      count: 8,
      color: "#10b981",
    },
    {
      id: "services",
      name: "Services",
      icon: WrenchScrewdriverIcon,
      count: 6,
      color: "#f59e0b",
    },
    {
      id: "payments",
      name: "Payments",
      icon: CreditCardIcon,
      count: 4,
      color: "#ef4444",
    },
    {
      id: "account",
      name: "Account",
      icon: UserGroupIcon,
      count: 3,
      color: "#8b5cf6",
    },
    {
      id: "locations",
      name: "Locations",
      icon: MapPinIcon,
      count: 3,
      color: "#06b6d4",
    },
    {
      id: "technical",
      name: "Technical",
      icon: ComputerDesktopIcon,
      count: 5,
      color: "#ec4899",
    },
    {
      id: "emergency",
      name: "Emergency",
      icon: ExclamationTriangleIcon,
      count: 2,
      color: "#dc2626",
    },
  ];

  const popularSearches = [
    "Schedule appointment",
    "Payment methods",
    "Service warranty",
    "Location hours",
    "Cancel appointment",
    "Technical support",
  ];

  const quickActions = [
    {
      icon: PhoneIcon,
      label: "Call Support",
      action: () => {},
      color: "#10b981",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      label: "Live Chat",
      action: () => setShowLiveChat(true),
      color: "#3b82f6",
    },
    {
      icon: VideoCameraIcon,
      label: "Video Call",
      action: () => {},
      color: "#8b5cf6",
    },
    {
      icon: EnvelopeIcon,
      label: "Email Us",
      action: () => {},
      color: "#f59e0b",
    },
  ];

  const downloadableResources = [
    {
      name: "Service Manual 2024",
      size: "2.4 MB",
      type: "PDF",
      icon: DocumentTextIcon,
    },
    {
      name: "Maintenance Guide",
      size: "1.8 MB",
      type: "PDF",
      icon: BookOpenIcon,
    },
    {
      name: "Warranty Information",
      size: "0.9 MB",
      type: "PDF",
      icon: ShieldCheckIcon,
    },
    {
      name: "Video Tutorial Series",
      size: "45 MB",
      type: "ZIP",
      icon: VideoCameraIcon,
    },
  ];

  const faqData = [
    {
      id: 1,
      category: "appointments",
      question: "How do I schedule an appointment?",
      answer:
        "You can schedule an appointment online through our booking system, call us directly, or use our mobile app. We offer flexible scheduling including same-day appointments for urgent services.",
      tags: ["scheduling", "booking", "appointments"],
      helpful: 45,
      rating: 4.8,
      views: 1250,
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      category: "appointments",
      question: "Can I reschedule or cancel my appointment?",
      answer:
        "Yes, you can reschedule or cancel your appointment up to 2 hours before your scheduled time. You can do this online, through the mobile app, or by calling us. Cancellations within 2 hours may incur a fee.",
      tags: ["reschedule", "cancel", "policy"],
      helpful: 38,
      rating: 4.6,
      views: 980,
      lastUpdated: "2024-01-12",
    },
    {
      id: 3,
      category: "appointments",
      question: "What should I bring to my appointment?",
      answer:
        "Please bring your vehicle registration, insurance information, and a valid ID. If you have any service records or warranty information, those are helpful too. We'll also need your keys and any special instructions.",
      tags: ["documents", "what to bring", "preparation"],
      helpful: 52,
      rating: 4.9,
      views: 1456,
      lastUpdated: "2024-01-10",
    },
    {
      id: 4,
      category: "services",
      question: "What services do you offer?",
      answer:
        "We offer comprehensive automotive services including oil changes, brake repairs, engine diagnostics, transmission service, AC/heating repair, tire service, battery replacement, and routine maintenance. We also provide emergency roadside assistance.",
      tags: ["services", "what we do", "offerings"],
      helpful: 67,
      rating: 4.7,
      views: 2100,
      lastUpdated: "2024-01-08",
    },
    {
      id: 5,
      category: "services",
      question: "How long do typical services take?",
      answer:
        "Service times vary by type: oil changes (30-45 minutes), brake service (1-2 hours), engine diagnostics (1-3 hours), transmission service (2-4 hours). We'll provide estimated completion times when you schedule.",
      tags: ["duration", "time", "how long"],
      helpful: 41,
      rating: 4.5,
      views: 876,
      lastUpdated: "2024-01-05",
    },
    {
      id: 6,
      category: "services",
      question: "Do you offer warranty on your work?",
      answer:
        "Yes, we provide warranties on all our work. Most repairs come with a 12-month/12,000-mile warranty, while parts have manufacturer warranties. We'll explain specific warranty terms for your service.",
      tags: ["warranty", "guarantee", "quality"],
      helpful: 59,
      rating: 4.8,
      views: 1678,
      lastUpdated: "2024-01-03",
    },
    {
      id: 7,
      category: "payments",
      question: "What payment methods do you accept?",
      answer:
        "We accept cash, all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, and digital payments (Apple Pay, Google Pay). We also offer financing options for larger repairs.",
      tags: ["payment", "methods", "accepted"],
      helpful: 34,
      rating: 4.4,
      views: 754,
      lastUpdated: "2024-01-01",
    },
    {
      id: 8,
      category: "payments",
      question: "Do you provide estimates before starting work?",
      answer:
        "Yes, we always provide written estimates before beginning any work. For complex issues, we may need to perform diagnostics first. We'll call you with the estimate and get your approval before proceeding.",
      tags: ["estimate", "cost", "approval"],
      helpful: 46,
      rating: 4.6,
      views: 1123,
      lastUpdated: "2023-12-28",
    },
    {
      id: 9,
      category: "account",
      question: "How do I create an account?",
      answer:
        "You can create an account by clicking 'Register' and filling out your information. We'll verify your email address, and then you can start booking appointments and tracking your service history.",
      tags: ["account", "register", "signup"],
      helpful: 29,
      rating: 4.3,
      views: 567,
      lastUpdated: "2023-12-25",
    },
    {
      id: 10,
      category: "account",
      question: "Can I track my service history?",
      answer:
        "Yes, your account dashboard shows your complete service history, including past appointments, invoices, service reports, and maintenance reminders. You can also download service records for warranty claims.",
      tags: ["history", "tracking", "records"],
      helpful: 33,
      rating: 4.5,
      views: 689,
      lastUpdated: "2023-12-22",
    },
    {
      id: 11,
      category: "locations",
      question: "Where are your service locations?",
      answer:
        "We have three locations: Main Location (123 Auto Service Blvd, NY), Brooklyn Branch (456 Brooklyn Ave, Brooklyn), and Queens Location (789 Queens Blvd, Queens). Each location offers full-service capabilities.",
      tags: ["locations", "addresses", "branches"],
      helpful: 27,
      rating: 4.2,
      views: 445,
      lastUpdated: "2023-12-20",
    },
    {
      id: 12,
      category: "locations",
      question: "Do you offer shuttle service?",
      answer:
        "Yes, we provide complimentary shuttle service within a 5-mile radius of our main location. We also offer car pickup and delivery services for an additional fee. Please call to schedule shuttle service.",
      tags: ["shuttle", "transportation", "pickup"],
      helpful: 31,
      rating: 4.4,
      views: 623,
      lastUpdated: "2023-12-18",
    },
  ];

  // Initialize data
  useEffect(() => {
    // Set popular questions (top 5 by views)
    const sorted = [...faqData].sort((a, b) => b.views - a.views);
    setPopularQuestions(sorted.slice(0, 5));

    // Initialize article ratings
    const ratings = {};
    faqData.forEach((faq) => {
      ratings[faq.id] = {
        rating: faq.rating,
        helpful: faq.helpful,
        liked: false,
      };
    });
    setArticleRatings(ratings);

    // Load search history from localStorage
    const savedHistory = localStorage.getItem("helpSearchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchTerm === "" ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    alert("Thank you for your message! We'll get back to you within 24 hours.");
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
      category: "general",
    });
  };

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);

    // Add to recently viewed
    const faq = faqData.find((f) => f.id === faqId);
    if (faq) {
      const updated = [
        faq,
        ...recentlyViewed.filter((f) => f.id !== faqId),
      ].slice(0, 5);
      setRecentlyViewed(updated);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term && !searchHistory.includes(term)) {
      const updated = [term, ...searchHistory].slice(0, 10);
      setSearchHistory(updated);
      localStorage.setItem("helpSearchHistory", JSON.stringify(updated));
    }
  };

  const rateArticle = (faqId, rating) => {
    setArticleRatings((prev) => ({
      ...prev,
      [faqId]: { ...prev[faqId], rating },
    }));
  };

  const markHelpful = (faqId) => {
    setArticleRatings((prev) => ({
      ...prev,
      [faqId]: { ...prev[faqId], helpful: prev[faqId].helpful + 1 },
    }));
  };

  const toggleLike = (faqId) => {
    setArticleRatings((prev) => ({
      ...prev,
      [faqId]: { ...prev[faqId], liked: !prev[faqId].liked },
    }));
  };

  return (
    <div className="help-page">
      <div className="container-fluid">
        {/* Enhanced Header with Stats */}
        <motion.div
          className="help-header mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h1 className="mb-3">
              <QuestionMarkCircleIcon className="me-3 text-primary" />
              Help & Support Center
            </h1>
            <p className="text-muted mb-4">
              Find answers to common questions or get in touch with our support
              team.
            </p>

            {/* Help Statistics */}
            <div className="help-stats">
              <div className="stat-item">
                <ChartBarIcon className="w-5 h-5" />
                <span>{helpStats.totalArticles} Articles</span>
              </div>
              <div className="stat-item">
                <StarIcon className="w-5 h-5" />
                <span>{helpStats.satisfactionRate}% Satisfied</span>
              </div>
              <div className="stat-item">
                <ClockIcon className="w-5 h-5" />
                <span>{helpStats.avgResponseTime} Response</span>
              </div>
              <div className="stat-item">
                <UserGroupIcon className="w-5 h-5" />
                <span>
                  {helpStats.activeUsers.toLocaleString()} Users Helped
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Bar */}
        <motion.div
          className="quick-actions-bar mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="card">
            <div className="card-body">
              <h6 className="mb-3">Quick Actions</h6>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="quick-action-btn"
                    onClick={action.action}
                    style={{ "--action-color": action.color }}
                  >
                    <action.icon className="w-5 h-5" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="row g-4">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Enhanced Search Section */}
            <motion.div
              className="search-section mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="card">
                <div className="card-body">
                  <div className="search-container mb-3">
                    <div className="input-group">
                      <span className="input-group-text">
                        <MagnifyingGlassIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search for help topics, guides, or FAQs..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleSearch("")}
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Search Suggestions */}
                    {searchTerm && (
                      <div className="search-suggestions-dropdown">
                        <div className="suggestions-header">
                          <span className="small text-muted">
                            Popular Searches
                          </span>
                        </div>
                        {popularSearches
                          .filter((s) =>
                            s.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .slice(0, 5)
                          .map((suggestion, index) => (
                            <button
                              key={index}
                              className="suggestion-item"
                              onClick={() => handleSearch(suggestion)}
                            >
                              <MagnifyingGlassIcon className="w-4 h-4" />
                              {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Search History */}
                  {searchHistory.length > 0 && !searchTerm && (
                    <div className="search-history mb-3">
                      <h6 className="mb-2">Recent Searches</h6>
                      <div className="history-tags">
                        {searchHistory.slice(0, 5).map((term, index) => (
                          <button
                            key={index}
                            className="history-tag"
                            onClick={() => handleSearch(term)}
                          >
                            <ClockIcon className="w-3 h-3" />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="categories-filter">
                    <h6 className="mb-3">Browse by Category</h6>
                    <div className="categories-enhanced">
                      {helpCategories.map((category) => (
                        <button
                          key={category.id}
                          className={`category-btn-enhanced ${
                            selectedCategory === category.id ? "active" : ""
                          }`}
                          onClick={() => setSelectedCategory(category.id)}
                          style={{ "--category-color": category.color }}
                        >
                          <category.icon className="w-5 h-5" />
                          <div className="category-info">
                            <span className="category-name">
                              {category.name}
                            </span>
                            <span className="category-count">
                              {category.count} articles
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Popular Questions Sidebar (for larger screens) */}
            {popularQuestions.length > 0 && (
              <motion.div
                className="popular-questions mb-4 d-none d-lg-block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <FireIcon className="me-2 text-warning" />
                      Popular Questions
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="popular-list">
                      {popularQuestions.map((faq) => (
                        <button
                          key={faq.id}
                          className="popular-item"
                          onClick={() => toggleFaq(faq.id)}
                        >
                          <div className="popular-content">
                            <span className="popular-question">
                              {faq.question}
                            </span>
                            <div className="popular-meta">
                              <span className="views">
                                <UserGroupIcon className="w-3 h-3" />
                                {faq.views}
                              </span>
                              <span className="rating">
                                <StarIcon className="w-3 h-3" />
                                {faq.rating}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FAQ Section */}
            <motion.div
              className="faq-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="card">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <BookOpenIcon className="me-2" />
                      Frequently Asked Questions
                      <span className="badge bg-primary ms-2">
                        {filteredFaqs.length}
                      </span>
                    </h6>
                    <div className="faq-controls">
                      <button className="btn btn-sm btn-outline-primary">
                        <SparklesIcon className="w-4 h-4 me-1" />
                        AI Help
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {filteredFaqs.length === 0 ? (
                    <div className="empty-state">
                      <QuestionMarkCircleIcon className="w-16 h-16 text-muted mb-3" />
                      <h5 className="text-muted">No results found</h5>
                      <p className="text-muted">
                        Try adjusting your search terms or browse different
                        categories.
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("all");
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="faq-list-enhanced">
                      {filteredFaqs.map((faq) => (
                        <div key={faq.id} className="faq-item-enhanced">
                          <button
                            className="faq-question-enhanced"
                            onClick={() => toggleFaq(faq.id)}
                          >
                            <div className="question-content">
                              <span className="question-text">
                                {faq.question}
                              </span>
                              <div className="question-meta">
                                <span className="views-badge">
                                  <UserGroupIcon className="w-3 h-3" />
                                  {faq.views}
                                </span>
                                <span className="rating-badge">
                                  <StarIcon className="w-3 h-3" />
                                  {faq.rating}
                                </span>
                              </div>
                            </div>
                            {expandedFaq === faq.id ? (
                              <ChevronUpIcon className="w-5 h-5" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5" />
                            )}
                          </button>

                          {expandedFaq === faq.id && (
                            <motion.div
                              className="faq-answer-enhanced"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="answer-content">
                                <p className="answer-text">{faq.answer}</p>

                                {/* Article Actions */}
                                <div className="article-actions">
                                  <div className="action-group">
                                    <button
                                      className="action-btn helpful"
                                      onClick={() => markHelpful(faq.id)}
                                    >
                                      <HeartIcon className="w-4 h-4" />
                                      Helpful (
                                      {articleRatings[faq.id]?.helpful ||
                                        faq.helpful}
                                      )
                                    </button>
                                    <button
                                      className={`action-btn like ${
                                        articleRatings[faq.id]?.liked
                                          ? "active"
                                          : ""
                                      }`}
                                      onClick={() => toggleLike(faq.id)}
                                    >
                                      {articleRatings[faq.id]?.liked ? (
                                        <HeartIconSolid className="w-4 h-4" />
                                      ) : (
                                        <HeartIcon className="w-4 h-4" />
                                      )}
                                      Like
                                    </button>
                                    <button className="action-btn share">
                                      <ShareIcon className="w-4 h-4" />
                                      Share
                                    </button>
                                    <button className="action-btn bookmark">
                                      <BookmarkIcon className="w-4 h-4" />
                                      Save
                                    </button>
                                  </div>

                                  <div className="rating-group">
                                    <span className="rating-label">
                                      Rate this article:
                                    </span>
                                    <div className="star-rating">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          className={`star ${
                                            star <=
                                            (articleRatings[faq.id]?.rating ||
                                              0)
                                              ? "active"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            rateArticle(faq.id, star)
                                          }
                                        >
                                          <StarIcon className="w-4 h-4" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Tags */}
                                <div className="faq-tags">
                                  {faq.tags.map((tag, index) => (
                                    <span key={index} className="tag-enhanced">
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                {/* Last Updated */}
                                <div className="last-updated">
                                  <small className="text-muted">
                                    Last updated: {faq.lastUpdated}
                                  </small>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="col-lg-4">
            {/* Live Chat Widget */}
            {showLiveChat && (
              <motion.div
                className="live-chat-widget mb-4"
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
              >
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <ChatBubbleBottomCenterTextIcon className="me-2" />
                        Live Chat Support
                      </h6>
                      <button
                        className="btn-close"
                        onClick={() => setShowLiveChat(false)}
                      ></button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="chat-interface">
                      <div className="chat-messages">
                        <div className="message support">
                          <div className="message-content">
                            <strong>Support Agent:</strong> Hi! How can I help
                            you today?
                          </div>
                          <small className="message-time">Just now</small>
                        </div>
                      </div>
                      <div className="chat-input">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Type your message..."
                          />
                          <button className="btn btn-primary">
                            <SpeakerWaveIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contact Form */}
            <motion.div
              className="contact-section mb-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <ChatBubbleLeftRightIcon className="me-2" />
                    Contact Support
                  </h6>
                </div>
                <div className="card-body">
                  <form onSubmit={handleContactSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={contactForm.category}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="general">General Question</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing Question</option>
                        <option value="service">Service Question</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactForm.subject}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            subject: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Message</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            message: e.target.value,
                          })
                        }
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      <EnvelopeIcon className="w-4 h-4 me-2" />
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Emergency Support */}
            <motion.div
              className="emergency-support mb-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="card border-danger">
                <div className="card-header bg-danger text-white">
                  <h6 className="mb-0">
                    <ExclamationTriangleIcon className="me-2" />
                    Emergency Support
                  </h6>
                </div>
                <div className="card-body">
                  <p className="small mb-3">
                    For urgent issues requiring immediate assistance:
                  </p>
                  <div className="emergency-contacts">
                    <a href="tel:+15551234567" className="emergency-contact">
                      <PhoneIcon className="w-4 h-4" />
                      <span>(555) 123-4567</span>
                      <small>24/7 Available</small>
                    </a>
                    <button className="emergency-contact">
                      <MapPinIcon className="w-4 h-4" />
                      <span>Find Nearest Location</span>
                      <small>Get Directions</small>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Download Center */}
            <motion.div
              className="download-center mb-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <CloudArrowDownIcon className="me-2" />
                    Download Center
                  </h6>
                </div>
                <div className="card-body">
                  <div className="download-list">
                    {downloadableResources.map((resource, index) => (
                      <div key={index} className="download-item">
                        <div className="download-info">
                          <resource.icon className="w-5 h-5 text-primary" />
                          <div className="resource-details">
                            <span className="resource-name">
                              {resource.name}
                            </span>
                            <div className="resource-meta">
                              <span className="file-size">{resource.size}</span>
                              <span className="file-type">{resource.type}</span>
                            </div>
                          </div>
                        </div>
                        <button className="btn btn-sm btn-outline-primary">
                          <CloudArrowDownIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <motion.div
                className="recently-viewed mb-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <ClockIcon className="me-2" />
                      Recently Viewed
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="recent-list">
                      {recentlyViewed.map((faq) => (
                        <button
                          key={faq.id}
                          className="recent-item"
                          onClick={() => toggleFaq(faq.id)}
                        >
                          <span className="recent-question">
                            {faq.question}
                          </span>
                          <small className="text-muted">{faq.category}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Contact */}
            <motion.div
              className="quick-contact mb-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <PhoneIcon className="me-2" />
                    Quick Contact
                  </h6>
                </div>
                <div className="card-body">
                  <div className="contact-options">
                    <div className="contact-option mb-3">
                      <div className="d-flex align-items-center">
                        <PhoneIcon className="w-5 h-5 text-primary me-3" />
                        <div>
                          <h6 className="mb-0">Call Us</h6>
                          <p className="text-muted small mb-0">
                            (555) 123-4567
                          </p>
                          <small className="text-muted">Mon-Fri: 8AM-6PM</small>
                        </div>
                      </div>
                    </div>
                    <div className="contact-option mb-3">
                      <div className="d-flex align-items-center">
                        <EnvelopeIcon className="w-5 h-5 text-primary me-3" />
                        <div>
                          <h6 className="mb-0">Email Support</h6>
                          <p className="text-muted small mb-0">
                            support@abegarage.com
                          </p>
                          <small className="text-muted">24-hour response</small>
                        </div>
                      </div>
                    </div>
                    <div className="contact-option">
                      <div className="d-flex align-items-center">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary me-3" />
                        <div>
                          <h6 className="mb-0">Live Chat</h6>
                          <p className="text-muted small mb-0">Available now</p>
                          <small className="text-success">• Online</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Resources */}
            <motion.div
              className="resources-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <DocumentTextIcon className="me-2" />
                    Helpful Resources
                  </h6>
                </div>
                <div className="card-body">
                  <div className="resource-links">
                    <a href="#" className="resource-link d-block mb-2">
                      <VideoCameraIcon className="w-4 h-4 me-2 text-primary" />
                      Video Tutorials
                    </a>
                    <a href="#" className="resource-link d-block mb-2">
                      <DocumentTextIcon className="w-4 h-4 me-2 text-primary" />
                      Service Manuals
                    </a>
                    <a href="#" className="resource-link d-block mb-2">
                      <BookOpenIcon className="w-4 h-4 me-2 text-primary" />
                      Maintenance Guide
                    </a>
                    <a href="#" className="resource-link d-block mb-2">
                      <InformationCircleIcon className="w-4 h-4 me-2 text-primary" />
                      FAQ Database
                    </a>
                    <a href="#" className="resource-link d-block mb-2">
                      <AcademicCapIcon className="w-4 h-4 me-2 text-primary" />
                      Training Materials
                    </a>
                    <a href="#" className="resource-link d-block">
                      <CogIcon className="w-4 h-4 me-2 text-primary" />
                      System Status
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .category-btn {
          padding: 0.75rem;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background: white;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          text-decoration: none;
          color: #374151;
          font-weight: 500;
        }

        .category-btn:hover {
          border-color: #667eea;
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .category-btn.active {
          border-color: #667eea;
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.1),
            rgba(118, 75, 162, 0.1)
          );
          color: #667eea;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Help;
