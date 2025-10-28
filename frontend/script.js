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

// ====== Updated IVR Response Engine (API-based) ======
async function getIVRResponse(input) {
  const lower = (input || "").toString().trim().toLowerCase();
  const sessionId = "abc123"; // TODO: replace or generate dynamically if needed

  // If input is numeric or keypad symbol, treat as DTMF request
  const isDigit = /^[0-9*#]$/.test(lower);
  const url = isDigit
    ? "https://conversational-ivr-modernization-fr.vercel.app/ivr/request"
    : "https://conversational-ivr-modernization-fr.vercel.app/ivr/conversation";

  const payload = isDigit
    ? { sessionId, digit: lower }
    : { sessionId, query: input };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    // expect either {response: "..."} or fallback text
    return data.response || "Sorry, no response from IVR system.";
  } catch (err) {
    console.error("IVR API error:", err);
    return "⚠️ Unable to reach IVR server. Please try again later.";
  }
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
    (async () => {
      const response = await getIVRResponse(value);
      addMessage("ivr", response);
      speakText(response);
    })();
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
    (async () => {
      const responseText = await getIVRResponse(transcript);
      addMessage("ivr", responseText);
      speakText(responseText);
    })();


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
