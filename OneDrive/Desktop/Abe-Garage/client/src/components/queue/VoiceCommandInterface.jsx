import React, { useState, useEffect, useRef } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaPlay,
  FaPause,
  FaStop,
  FaCog,
  FaBrain,
  FaLanguage,
  FaComments,
  FaRobot,
  FaLightbulb,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import "./VoiceCommandInterface.css";

const VoiceCommandInterface = ({
  onCommand,
  serviceBays,
  queue,
  onStatusUpdate,
  currentUser,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [availableCommands, setAvailableCommands] = useState([]);
  const [voiceSettings, setVoiceSettings] = useState({
    language: "en-US",
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
  });
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState([]);
  const [voiceMode, setVoiceMode] = useState("command"); // command, conversation, assistant
  const [confidence, setConfidence] = useState(0);

  const recognitionRef = useRef(null);
  const commandTimeoutRef = useRef(null);

  // Voice command patterns
  const commandPatterns = {
    // Status queries
    "how many bays are (available|occupied|free)": (matches) => {
      const status = matches[1];
      const bays = serviceBays.filter((bay) =>
        status === "available"
          ? bay.is_available
          : status === "occupied"
          ? bay.status === "occupied"
          : bay.is_available
      );
      return `There ${bays.length === 1 ? "is" : "are"} ${
        bays.length
      } ${status} service bay${bays.length === 1 ? "" : "s"}.`;
    },

    "how many customers are waiting": () => {
      const waitingCount = queue.filter(
        (item) => item.queue_status === "waiting"
      ).length;
      return `There ${
        waitingCount === 1 ? "is" : "are"
      } ${waitingCount} customer${
        waitingCount === 1 ? "" : "s"
      } waiting in the queue.`;
    },

    "what is the average wait time": () => {
      const waitTimes = queue
        .map((item) => item.estimated_wait_time)
        .filter((time) => time > 0);
      const avgWait =
        waitTimes.length > 0
          ? Math.round(
              waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length
            )
          : 0;
      return `The average wait time is ${avgWait} minutes.`;
    },

    // Bay control
    "show me bay (\\d+)": (matches) => {
      const bayNumber = parseInt(matches[1]);
      const bay = serviceBays.find((b) => b.bay_number === bayNumber);
      if (bay) {
        return `Bay ${bayNumber} is currently ${bay.status}. ${
          bay.is_available
            ? "It is available for service."
            : bay.vehicle_info
            ? `It is servicing a ${bay.vehicle_info.year} ${bay.vehicle_info.brand} ${bay.vehicle_info.model}.`
            : ""
        }`;
      }
      return `Bay ${bayNumber} was not found.`;
    },

    "what's the status of bay (\\d+)": (matches) => {
      const bayNumber = parseInt(matches[1]);
      return handleBayStatusQuery(bayNumber);
    },

    // Queue management
    "show me the next customer": () => {
      const nextCustomer = queue.find(
        (item) => item.queue_status === "waiting"
      );
      if (nextCustomer) {
        return `The next customer is ${nextCustomer.customer_name} with a ${nextCustomer.car_year} ${nextCustomer.car_brand} ${nextCustomer.car_model}. Estimated wait time is ${nextCustomer.estimated_wait_time} minutes.`;
      }
      return "There are no customers waiting in the queue.";
    },

    "call next customer": () => {
      const nextCustomer = queue.find(
        (item) => item.queue_status === "waiting"
      );
      if (nextCustomer) {
        onCommand("call_next_customer", nextCustomer);
        return `Calling ${nextCustomer.customer_name} to service bay.`;
      }
      return "No customers are waiting to be called.";
    },

    // Service commands
    "start service for bay (\\d+)": (matches) => {
      const bayNumber = parseInt(matches[1]);
      onCommand("start_service", { bayNumber });
      return `Starting service for bay ${bayNumber}.`;
    },

    "complete service for bay (\\d+)": (matches) => {
      const bayNumber = parseInt(matches[1]);
      onCommand("complete_service", { bayNumber });
      return `Completing service for bay ${bayNumber}.`;
    },

    // Time queries
    "what time is it": () => {
      const now = new Date();
      return `The current time is ${now.toLocaleTimeString()}.`;
    },

    "how long until (.*) is ready": (matches) => {
      const serviceName = matches[1].toLowerCase();
      const service = queue.find(
        (item) =>
          item.service_name.toLowerCase().includes(serviceName) ||
          item.services.some((s) => s.toLowerCase().includes(serviceName))
      );
      if (service) {
        return `${service.customer_name}'s ${service.service_name} should be ready in approximately ${service.estimated_wait_time} minutes.`;
      }
      return `I couldn't find any ${serviceName} services in progress.`;
    },

    // Help and information
    "what can you do": () => {
      return "I can help you manage the service queue, check bay status, call customers, and answer questions about wait times. Try saying 'show me bay 1' or 'how many customers are waiting'.";
    },

    help: () => {
      return "You can ask me about bay status, queue information, or request to call customers. For example, try 'show me bay 1' or 'what's the average wait time'.";
    },

    // System controls
    "refresh data": () => {
      onCommand("refresh_data");
      return "Refreshing live queue data.";
    },

    "turn off voice": () => {
      setIsEnabled(false);
      return "Voice interface disabled.";
    },

    "repeat that": () => {
      return lastCommand || "I don't have anything to repeat.";
    },
  };

  useEffect(() => {
    // Initialize speech recognition and synthesis
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechRecognition = new SpeechRecognition();

      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = voiceSettings.language;
      speechRecognition.maxAlternatives = 3;

      speechRecognition.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };

      speechRecognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          setConfidence(confidence);

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);

        if (finalTranscript) {
          handleVoiceCommand(finalTranscript.trim().toLowerCase());
        }
      };

      speechRecognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionRef.current = speechRecognition;
      setRecognition(speechRecognition);
    }

    if ("speechSynthesis" in window) {
      setSynthesis(window.speechSynthesis);
    }

    // Generate available commands list
    generateCommandList();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (recognition) {
      recognition.lang = voiceSettings.language;
    }
  }, [voiceSettings.language, recognition]);

  const generateCommandList = () => {
    const commands = [
      {
        category: "Status Queries",
        commands: [
          "How many bays are available?",
          "How many customers are waiting?",
          "What's the average wait time?",
          "Show me bay 1",
        ],
      },
      {
        category: "Queue Management",
        commands: [
          "Show me the next customer",
          "Call next customer",
          "Who is next in line?",
        ],
      },
      {
        category: "Service Control",
        commands: [
          "Start service for bay 1",
          "Complete service for bay 2",
          "Refresh data",
        ],
      },
      {
        category: "Information",
        commands: [
          "What time is it?",
          "How long until oil change is ready?",
          "What can you do?",
        ],
      },
      {
        category: "System",
        commands: ["Help", "Repeat that", "Turn off voice"],
      },
    ];

    setAvailableCommands(commands);
  };

  const handleVoiceCommand = async (command) => {
    setIsProcessing(true);
    setLastCommand(command);
    addToHistory(command);

    try {
      // Find matching command pattern
      for (const [pattern, handler] of Object.entries(commandPatterns)) {
        const regex = new RegExp(pattern, "i");
        const matches = command.match(regex);

        if (matches) {
          const response = handler(matches);
          if (response) {
            await speak(response);
          }
          break;
        }
      }

      // If no pattern matches, provide helpful response
      if (!commandHistory.includes(command)) {
        const suggestions = getCommandSuggestions(command);
        setCommandSuggestions(suggestions);

        if (suggestions.length > 0) {
          await speak(
            `I didn't understand that. Did you mean: ${suggestions[0]}?`
          );
        } else {
          await speak(
            "I didn't understand that command. Try saying 'help' for available commands."
          );
        }
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      await speak("Sorry, I encountered an error processing that command.");
    } finally {
      setIsProcessing(false);
      setTranscript("");
    }
  };

  const getCommandSuggestions = (input) => {
    const allCommands = availableCommands.flatMap(
      (category) => category.commands
    );
    return allCommands
      .filter((cmd) => cmd.toLowerCase().includes(input.split(" ")[0]))
      .slice(0, 3);
  };

  const handleBayStatusQuery = (bayNumber) => {
    const bay = serviceBays.find((b) => b.bay_number === bayNumber);
    if (!bay) {
      return `Bay ${bayNumber} was not found.`;
    }

    let status = `Bay ${bayNumber} is currently ${bay.status}.`;

    if (bay.is_available) {
      status += " It is available for service.";
    } else if (bay.vehicle_info) {
      status += ` It is servicing a ${bay.vehicle_info.year} ${bay.vehicle_info.brand} ${bay.vehicle_info.model}.`;
      if (bay.service_progress !== undefined) {
        status += ` Service is ${bay.service_progress}% complete.`;
      }
    }

    return status;
  };

  const addToHistory = (command) => {
    setCommandHistory((prev) => [
      { command, timestamp: new Date(), confidence },
      ...prev.slice(0, 9), // Keep last 10 commands
    ]);
  };

  const speak = (text) => {
    return new Promise((resolve, reject) => {
      if (!synthesis || !isEnabled) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      utterance.lang = voiceSettings.language;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (error) => {
        setIsSpeaking(false);
        reject(error);
      };

      synthesis.speak(utterance);
    });
  };

  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const testVoice = () => {
    speak(
      "Voice interface is working correctly. How can I help you manage the service queue today?"
    );
  };

  const clearHistory = () => {
    setCommandHistory([]);
  };

  const selectSuggestion = (suggestion) => {
    setTranscript(suggestion);
    handleVoiceCommand(suggestion.toLowerCase());
    setCommandSuggestions([]);
  };

  return (
    <div className="voice-command-interface">
      {/* Header */}
      <div className="voice-header">
        <div className="header-main">
          <div className="voice-icon">
            <FaMicrophone />
          </div>
          <div>
            <h3>Voice Command Interface</h3>
            <p className="subtitle">
              Hands-free queue management with AI-powered voice commands
            </p>
          </div>
        </div>

        <div className="voice-controls">
          <div className="mode-selector">
            <select
              value={voiceMode}
              onChange={(e) => setVoiceMode(e.target.value)}
              className="mode-select"
            >
              <option value="command">Command Mode</option>
              <option value="conversation">Conversation</option>
              <option value="assistant">AI Assistant</option>
            </select>
          </div>

          <button
            className={`voice-toggle ${!isEnabled ? "disabled" : ""}`}
            onClick={() => setIsEnabled(!isEnabled)}
            title={
              isEnabled ? "Disable voice commands" : "Enable voice commands"
            }
          >
            {isEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>
        </div>
      </div>

      {/* Voice Status */}
      <div className="voice-status">
        <div className="status-indicator">
          <div
            className={`status-dot ${
              isListening ? "listening" : isProcessing ? "processing" : "idle"
            }`}
          ></div>
          <span className="status-text">
            {isListening
              ? "Listening..."
              : isProcessing
              ? "Processing..."
              : isEnabled
              ? "Ready"
              : "Disabled"}
          </span>
        </div>

        {confidence > 0 && (
          <div className="confidence-meter">
            <span className="confidence-label">Confidence:</span>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${confidence * 100}%` }}
              ></div>
            </div>
            <span className="confidence-value">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Main Controls */}
      <div className="voice-main">
        {/* Transcript Display */}
        {(transcript || lastCommand) && (
          <div className="transcript-display">
            <div className="transcript-label">
              <FaComments />
              <span>{isListening ? "Listening" : "Last Command"}:</span>
            </div>
            <div className="transcript-text">{transcript || lastCommand}</div>
          </div>
        )}

        {/* Command Suggestions */}
        {commandSuggestions.length > 0 && (
          <div className="suggestions">
            <div className="suggestions-label">Did you mean:</div>
            <div className="suggestions-list">
              {commandSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice Controls */}
        <div className="voice-buttons">
          <button
            className={`voice-btn primary ${isListening ? "active" : ""}`}
            onClick={toggleListening}
            disabled={!isEnabled}
          >
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            {isListening ? "Stop Listening" : "Start Listening"}
          </button>

          <button
            className="voice-btn secondary"
            onClick={testVoice}
            disabled={!isEnabled}
            title="Test voice synthesis"
          >
            <FaPlay />
            Test Voice
          </button>

          <button
            className="voice-btn secondary"
            onClick={() =>
              speak("Voice interface test completed successfully.")
            }
            disabled={!isEnabled || isSpeaking}
            title="Test speech synthesis"
          >
            {isSpeaking ? <FaPause /> : <FaVolumeUp />}
            {isSpeaking ? "Speaking..." : "Speak Test"}
          </button>
        </div>
      </div>

      {/* Command Categories */}
      <div className="command-categories">
        <h4>Available Commands</h4>
        <div className="categories-grid">
          {availableCommands.map((category, index) => (
            <div key={index} className="category-card">
              <h5>{category.category}</h5>
              <ul className="command-list">
                {category.commands.map((command, cmdIndex) => (
                  <li key={cmdIndex}>
                    <button
                      className="command-example"
                      onClick={() => selectSuggestion(command)}
                      disabled={!isEnabled}
                    >
                      "{command}"
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <div className="command-history">
          <div className="history-header">
            <h4>Recent Commands</h4>
            <button className="clear-history" onClick={clearHistory}>
              Clear History
            </button>
          </div>
          <div className="history-list">
            {commandHistory.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-command">{item.command}</div>
                <div className="history-meta">
                  <span className="history-time">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="history-confidence">
                    {Math.round(item.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Settings */}
      <div className="voice-settings">
        <details>
          <summary>
            <FaCog />
            Voice Settings
          </summary>
          <div className="settings-grid">
            <div className="setting-group">
              <label>Language:</label>
              <select
                value={voiceSettings.language}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    language: e.target.value,
                  }))
                }
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Speech Rate:</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.rate}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    rate: parseFloat(e.target.value),
                  }))
                }
              />
              <span>{voiceSettings.rate}x</span>
            </div>

            <div className="setting-group">
              <label>Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceSettings.volume}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    volume: parseFloat(e.target.value),
                  }))
                }
              />
              <span>{Math.round(voiceSettings.volume * 100)}%</span>
            </div>

            <div className="setting-group">
              <label>Pitch:</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.pitch}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    pitch: parseFloat(e.target.value),
                  }))
                }
              />
              <span>{voiceSettings.pitch}</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default VoiceCommandInterface;
