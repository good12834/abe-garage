import React, { useState, useEffect } from "react";
import LiveStatusIndicator from "../components/ui/LiveStatusIndicator";
import LiveStatusIndicatorAdvanced from "../components/ui/LiveStatusIndicatorAdvanced";
import FloatingLiveIndicator from "../components/ui/FloatingLiveIndicator";
import "../components/ui/LiveStatusIndicator.css";
import "../components/ui/LiveStatusIndicatorAdvanced.css";
import "../components/ui/FloatingLiveIndicator.css";

const LiveStatusDemo = () => {
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [demoTime, setDemoTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDemoTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleConnection = () => {
    setConnectionStatus(!connectionStatus);
  };

  return (
    <div className="live-status-demo-page">
      {/* Floating Live Indicator */}
      <FloatingLiveIndicator
        isConnected={connectionStatus}
        position="top-right"
        size="large"
        showLabel={true}
        animate={true}
      />

      {/* Page Header */}
      <div className="demo-header">
        <h1>🚀 Live Status Indicators Demo</h1>
        <p>
          Experience the most visible and attractive live status indicators!
        </p>
        <div className="demo-controls">
          <button
            className={`demo-toggle-btn ${
              connectionStatus ? "connected" : "disconnected"
            }`}
            onClick={toggleConnection}
          >
            {connectionStatus ? "🟢 Connected" : "🔴 Disconnected"}
          </button>
          <span className="demo-time">
            Current Time: {demoTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Demo Sections */}
      <div className="demo-sections">
        {/* Basic Live Status Indicators */}
        <section className="demo-section">
          <h2>📊 Basic Live Status Indicators</h2>
          <p>Simple, clean indicators with essential features</p>

          <div className="demo-grid">
            <div className="demo-item">
              <h3>Small Size</h3>
              <LiveStatusIndicator
                isConnected={connectionStatus}
                showText={true}
                size="small"
                pulse={true}
              />
            </div>

            <div className="demo-item">
              <h3>Medium Size</h3>
              <LiveStatusIndicator
                isConnected={connectionStatus}
                showText={true}
                size="medium"
                pulse={true}
              />
            </div>

            <div className="demo-item">
              <h3>Large Size</h3>
              <LiveStatusIndicator
                isConnected={connectionStatus}
                showText={true}
                size="large"
                pulse={true}
              />
            </div>

            <div className="demo-item">
              <h3>Text Only</h3>
              <LiveStatusIndicator
                isConnected={connectionStatus}
                showText={true}
                size="medium"
                pulse={false}
              />
            </div>
          </div>
        </section>

        {/* Advanced Live Status Indicators */}
        <section className="demo-section">
          <h2>⚡ Advanced Live Status Indicators</h2>
          <p>Ultra-visible indicators with spectacular visual effects</p>

          <div className="demo-grid">
            <div className="demo-item">
              <h3>Neon Style</h3>
              <LiveStatusIndicatorAdvanced
                isConnected={connectionStatus}
                showText={true}
                size="large"
                variant="neon"
                pulse={true}
                bounce={true}
                sound={true}
              />
            </div>

            <div className="demo-item">
              <h3>Cyberpunk Style</h3>
              <LiveStatusIndicatorAdvanced
                isConnected={connectionStatus}
                showText={true}
                size="large"
                variant="cyberpunk"
                pulse={true}
                rotate={true}
              />
            </div>

            <div className="demo-item">
              <h3>Matrix Style</h3>
              <LiveStatusIndicatorAdvanced
                isConnected={connectionStatus}
                showText={true}
                size="large"
                variant="matrix"
                pulse={true}
                bounce={true}
              />
            </div>

            <div className="demo-item">
              <h3>Minimal Style</h3>
              <LiveStatusIndicatorAdvanced
                isConnected={connectionStatus}
                showText={false}
                size="medium"
                variant="minimal"
                pulse={true}
              />
            </div>
          </div>
        </section>

        {/* Floating Indicators */}
        <section className="demo-section">
          <h2>🎯 Floating Live Indicators</h2>
          <p>Corner-positioned indicators that always stay visible</p>

          <div className="demo-grid">
            <div className="demo-item">
              <h3>Top Right (Current)</h3>
              <div className="demo-visual">
                <div className="screen-mockup">
                  <div className="screen-content">
                    <div className="floating-indicator-demo top-right">
                      <FloatingLiveIndicator
                        isConnected={connectionStatus}
                        position="top-right"
                        size="medium"
                        showLabel={true}
                        animate={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="demo-item">
              <h3>Top Left</h3>
              <div className="demo-visual">
                <div className="screen-mockup">
                  <div className="screen-content">
                    <FloatingLiveIndicator
                      isConnected={connectionStatus}
                      position="top-left"
                      size="medium"
                      showLabel={true}
                      animate={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="demo-item">
              <h3>Bottom Right</h3>
              <div className="demo-visual">
                <div className="screen-mockup">
                  <div className="screen-content">
                    <FloatingLiveIndicator
                      isConnected={connectionStatus}
                      position="bottom-right"
                      size="medium"
                      showLabel={true}
                      animate={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="demo-item">
              <h3>Extra Large</h3>
              <div className="demo-visual">
                <div className="screen-mockup">
                  <div className="screen-content">
                    <FloatingLiveIndicator
                      isConnected={connectionStatus}
                      position="bottom-left"
                      size="xl"
                      showLabel={true}
                      animate={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Comparison */}
        <section className="demo-section">
          <h2>🔄 Status Comparison</h2>
          <p>See how indicators look in different states</p>

          <div className="comparison-grid">
            <div className="comparison-item">
              <h3>Connected States</h3>
              <div className="status-comparison">
                <LiveStatusIndicator
                  isConnected={true}
                  showText={true}
                  size="medium"
                  variant="default"
                />
                <LiveStatusIndicatorAdvanced
                  isConnected={true}
                  showText={true}
                  size="medium"
                  variant="neon"
                />
                <FloatingLiveIndicator
                  isConnected={true}
                  size="small"
                  showLabel={false}
                />
              </div>
            </div>

            <div className="comparison-item">
              <h3>Disconnected States</h3>
              <div className="status-comparison">
                <LiveStatusIndicator
                  isConnected={false}
                  showText={true}
                  size="medium"
                  variant="default"
                />
                <LiveStatusIndicatorAdvanced
                  isConnected={false}
                  showText={true}
                  size="medium"
                  variant="cyberpunk"
                />
                <FloatingLiveIndicator
                  isConnected={false}
                  size="small"
                  showLabel={false}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section className="demo-section">
          <h2>✨ Feature Showcase</h2>
          <p>All the amazing features working together</p>

          <div className="features-grid">
            <div className="feature-card">
              <h3>🌈 Multiple Color Schemes</h3>
              <p>Neon, Cyberpunk, Matrix, and more styles</p>
              <div className="feature-demo">
                <LiveStatusIndicatorAdvanced
                  isConnected={connectionStatus}
                  variant="neon"
                  size="small"
                  showText={false}
                />
                <LiveStatusIndicatorAdvanced
                  isConnected={connectionStatus}
                  variant="cyberpunk"
                  size="small"
                  showText={false}
                />
                <LiveStatusIndicatorAdvanced
                  isConnected={connectionStatus}
                  variant="matrix"
                  size="small"
                  showText={false}
                />
              </div>
            </div>

            <div className="feature-card">
              <h3>🎭 Animation Effects</h3>
              <p>Pulse, bounce, rotate, and particle effects</p>
              <div className="feature-demo">
                <LiveStatusIndicatorAdvanced
                  isConnected={connectionStatus}
                  pulse={true}
                  bounce={true}
                  size="small"
                  showText={false}
                />
                <LiveStatusIndicatorAdvanced
                  isConnected={connectionStatus}
                  pulse={true}
                  rotate={true}
                  size="small"
                  showText={false}
                />
              </div>
            </div>

            <div className="feature-card">
              <h3>🔊 Audio Feedback</h3>
              <p>Sound effects for status changes</p>
              <div className="feature-demo">
                <LiveStatusIndicatorAdvanced
                  isConnected={connectionStatus}
                  sound={true}
                  size="small"
                  showText={false}
                />
              </div>
            </div>

            <div className="feature-card">
              <h3>📱 Responsive Design</h3>
              <p>Works perfectly on all device sizes</p>
              <div className="feature-demo">
                <LiveStatusIndicator
                  isConnected={connectionStatus}
                  size="small"
                  showText={true}
                />
                <LiveStatusIndicator
                  isConnected={connectionStatus}
                  size="large"
                  showText={true}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Demo Footer */}
      <div className="demo-footer">
        <h3>🎉 All Enhanced Live Status Indicators Are Now Live!</h3>
        <p>
          These ultra-visible and attractive indicators will make your
          application's status impossible to miss!
        </p>
        <div className="demo-stats">
          <div className="stat">
            <span className="stat-number">12+</span>
            <span className="stat-label">Visual Variants</span>
          </div>
          <div className="stat">
            <span className="stat-number">8+</span>
            <span className="stat-label">Animation Effects</span>
          </div>
          <div className="stat">
            <span className="stat-number">100%</span>
            <span className="stat-label">More Visible</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStatusDemo;
