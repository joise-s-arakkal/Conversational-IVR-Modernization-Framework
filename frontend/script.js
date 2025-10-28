// Updated script.js — voice input + always speak responses

// ====== Time Display ======
function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("time").textContent = timeStr;
}
setInterval(updateTime, 1000);
updateTime();

// ====== Screen Toggle ======
const callScreen = document.getElementById("call-screen");
const keypadScreen = document.getElementById("keypad-screen");
const keypadToggleBtn = document.getElementById("keypad-toggle-btn");

keypadToggleBtn.addEventListener("click", () => {
  callScreen.classList.remove("active");
  keypadScreen.classList.add("active");
});

// ====== Hangup Buttons ======
document.querySelectorAll(".hangup-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // stop any speech/recognition
    stopRecognition();
    window.speechSynthesis.cancel();
    alert("Call Ended!");
    callScreen.classList.add("active");
    keypadScreen.classList.remove("active");
    document.getElementById("transcript").innerHTML = "";
    startTimer();
  });
});

// ====== Call Timer ======
let timerInterval;
let seconds = 0;
function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${mins}:${secs}`;
  }, 1000);
}
startTimer();

// ====== Transcript System ======
const transcriptBox = document.getElementById("transcript");
function addMessage(sender, text) {
  const p = document.createElement("p");
  p.classList.add(sender === "user" ? "user" : "ivr");
  p.textContent = `${sender === "user" ? "You" : "IVR"}: ${text}`;
  transcriptBox.appendChild(p);
  transcriptBox.scrollTop = transcriptBox.scrollHeight;
}

// ====== Simulated IVR Responses ======
function getIVRResponse(input) {
  // If input is long text, use keywords; otherwise match digits
  const lower = (input || "").toString().trim().toLowerCase();

  // numeric keypad mappings
  const digitResponses = {
    "1": "Your current balance is ₹25,460.78.",
    "2": "Connecting you to a customer support agent.",
    "3": "Your last statement was generated on October 1st.",
    "4": "Your card has been blocked. A new one will be issued shortly.",
    "5": "Your card is now activated and ready for use.",
    "6": "Bill payment processed successfully.",
    "7": "Please visit our website to update your information.",
    "8": "Your loan application is under review.",
    "9": "We’ve detected no fraudulent activity recently.",
    "0": "Your e-statement has been sent to your registered email.",
    "*": "Special options menu.",
    "#": "End of input."
  };
  if (digitResponses[lower]) return digitResponses[lower];

  // handle natural language keywords
  if (lower.includes("balance")) return digitResponses["1"];
  if (lower.includes("agent") || lower.includes("representative") || lower.includes("support")) return digitResponses["2"];
  if (lower.includes("statement") || lower.includes("last transaction") || lower.includes("last trans")) return digitResponses["3"];
  if (lower.includes("lost") || lower.includes("blocked") || lower.includes("lost card")) return digitResponses["4"];
  if (lower.includes("activate") || lower.includes("activate card")) return digitResponses["5"];
  if (lower.includes("pay") || lower.includes("payment") || lower.includes("bill")) return digitResponses["6"];
  if (lower.includes("update") || lower.includes("change details")) return digitResponses["7"];
  if (lower.includes("loan") || lower.includes("emi")) return digitResponses["8"];
  if (lower.includes("fraud") || lower.includes("fraudulent")) return digitResponses["9"];
  if (lower === "") return "I didn't catch anything — please say that again or press a digit.";
  return "Sorry, I didn't understand that. Please press a number from the keypad or try saying 'Balance' or 'Agent'.";
}

// ====== Text-to-Speech Setup ======
const synth = window.speechSynthesis;
let selectedVoice = null;

function initVoices() {
  if (!synth) {
    console.warn("SpeechSynthesis not supported in this browser.");
    return;
  }
  let voices = synth.getVoices();
  if (!voices.length) {
    // voices may load asynchronously
    synth.onvoiceschanged = () => {
      voices = synth.getVoices();
      chooseVoice(voices);
    };
  } else {
    chooseVoice(voices);
  }
}

function chooseVoice(voices) {
  // prefer a natural female-ish voice, fallback to any 'en' voice
  const preferred = [
    "Microsoft Zira Desktop - English (United States)",
    "Microsoft Hazel Desktop - English (Great Britain)",
    "Google UK English Female",
    "Google US English Female",
    "Microsoft Ana - English (United States)",
    "Microsoft Eva - English (United States)",
    "Microsoft Aria Online (Natural) - English (United States)",
    "Microsoft Jenny Online (Natural) - English (United States)"
  ];
  for (const name of preferred) {
    const v = voices.find(x => x.name === name);
    if (v) { selectedVoice = v; break; }
  }
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang && v.lang.startsWith("en")) || voices[0] || null;
  }
  // debug
  if (selectedVoice) console.log("Selected voice:", selectedVoice.name, selectedVoice.lang);
}
initVoices();

// central speak function — always used for responses
function speakText(text, options = {}) {
  if (!text) return;
  // cancel any ongoing speech so responses don't overlap
  if (synth && synth.speaking) {
    synth.cancel();
  }
  if (!synth) {
    console.warn("No speechSynthesis available — cannot speak.");
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  if (selectedVoice) utter.voice = selectedVoice;
  // optional rate/pitch settings
  utter.rate = options.rate || 1;
  utter.pitch = options.pitch || 1;
  utter.volume = options.volume || 1;

  utter.onstart = () => { updateVoiceStatus("🔊 Speaking response...", "speaking"); };
  utter.onend = () => { updateVoiceStatus("", ""); };
  utter.onerror = (e) => {
    console.error("Speech synthesis error:", e);
    updateVoiceStatus("", "");
  };
  synth.speak(utter);
}

// ensure voices load
window.addEventListener("load", () => {
  initVoices();
});

// ====== Keypad Click (also speak response) ======
document.querySelectorAll(".key").forEach(key => {
  key.addEventListener("click", () => {
    // digit is first character (works for "1Balance" style text too)
    const text = key.textContent.trim();
    const value = text[0];
    addMessage("user", `Pressed ${value}`);
    const response = getIVRResponse(value);
    setTimeout(() => {
      addMessage("ivr", response);
      speakText(response);
    }, 400);
  });
});

// ====== Speech Recognition Setup ======
let recognition = null;
let isRecording = false;

function setupRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("SpeechRecognition not supported in this browser.");
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false; // capture one command at a time

  recognition.onstart = () => {
    isRecording = true;
    updateVoiceButton("recording");
    updateVoiceStatus("🎤 Listening... Speak now!", "recording");
    console.log("Recognition started");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    console.log("Recognized:", transcript);
    addMessage("user", transcript);

    // generate & show response
    const responseText = getIVRResponse(transcript);
    addMessage("ivr", responseText);
    speakText(responseText);

    // UI updates
    setTimeout(() => updateVoiceStatus("✅ Voice command processed", "success"), 600);
  };

  recognition.onerror = (event) => {
    console.error("Recognition error:", event.error);
    updateVoiceStatus("❌ Speech recognition error. Try again.", "error");
  };

  recognition.onend = () => {
    isRecording = false;
    updateVoiceButton("idle");
    // If recognition stopped because of no speech, provide hint
    if (!synth.speaking) {
      // do nothing — user can trigger again
    }
    console.log("Recognition ended");
  };
}
setupRecognition();

// start / stop helpers
function startRecognition() {
  if (!recognition) {
    alert("Speech Recognition not supported. Use Chrome or Edge.");
    return;
  }
  if (isRecording) return;
  try {
    recognition.start();
  } catch (e) {
    // sometimes start() throws if called multiple times quickly — ignore
    console.warn("recognition start error:", e);
  }
}

function stopRecognition() {
  if (recognition && isRecording) {
    recognition.stop();
  }
  isRecording = false;
  updateVoiceButton("idle");
}

// ====== Voice UI Helpers ======
function updateVoiceButton(state) {
  const voiceButton = document.getElementById('talk-btn-main') || null;
  const voiceButtonKeypad = document.getElementById('talk-btn-keypad') || null;

  [voiceButton, voiceButtonKeypad].forEach(btn => {
    if (!btn) return;
    btn.classList.remove('recording', 'processing');
    if (state === 'recording') btn.classList.add('recording');
    if (state === 'processing') btn.classList.add('processing');
  });

  const voiceIcon = document.querySelector('#talk-btn-main i') || null;
  if (state === 'recording' && voiceIcon) {
    // optionally change appearance; handled by CSS classes
  }
}

function updateVoiceStatus(message, className = '') {
  // there may not be a dedicated #voiceStatus in this layout; create or reuse
  let voiceStatus = document.getElementById('voiceStatus');
  if (!voiceStatus) {
    // create a small ephemeral element below transcript if missing
    voiceStatus = document.createElement('div');
    voiceStatus.id = 'voiceStatus';
    voiceStatus.style.fontSize = '12px';
    voiceStatus.style.color = '#fff';
    voiceStatus.style.textAlign = 'center';
    voiceStatus.style.padding = '6px 12px';
    const parent = document.querySelector('.phone');
    if (parent) parent.appendChild(voiceStatus);
  }
  voiceStatus.textContent = message;
  voiceStatus.className = `voice-status ${className}`;
}

// ====== Talk Buttons (start recognition) ======
const talkMain = document.getElementById("talk-btn-main");
const talkKeypad = document.getElementById("talk-btn-keypad");
[talkMain, talkKeypad].forEach(btn => {
  if (!btn) return;
  btn.addEventListener("click", () => {
    // If already recording, stop; else start
    if (isRecording) {
      stopRecognition();
    } else {
      startRecognition();
      // Safety timeout: stop if no speech after 9s (prevents hanging)
      setTimeout(() => {
        if (isRecording) {
          try { recognition.stop(); } catch(e) {}
          updateVoiceStatus("⏳ Processing...", "processing");
          setTimeout(() => {
            updateVoiceStatus("⏰ No speech detected. Try again.", "error");
            setTimeout(() => updateVoiceStatus("", ""), 1800);
          }, 1100);
        }
      }, 9000);
    }
  });
});

// ====== Keyboard digit support ======
document.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k >= '0' && k <= '9') {
    // find matching key button and trigger click
    const btn = [...document.querySelectorAll('.key')].find(b => b.textContent.trim().startsWith(k));
    if (btn) btn.click();
  }
});

// ====== Simulated Talk Buttons fallback (for browsers w/o recognition) ======
[talkMain, talkKeypad].forEach(btn => {
  if (!btn) return;
  // if recognition unavailable, use a simulated canned flow
  if (!recognition) {
    btn.addEventListener('click', () => {
      addMessage("user", "Hello IVR, please tell me my balance.");
      const reply = getIVRResponse("balance");
      setTimeout(() => {
        addMessage("ivr", reply);
        speakText(reply);
      }, 700);
    });
  }
});

// ====== Init helpers on DOM load ======
document.addEventListener('DOMContentLoaded', () => {
  // ensure session/timer already started
  // start voice resources
  initVoices();
  setupRecognition();
});
