# 🎙️ Conversational IVR Modernization Framework

This project modernizes legacy **VoiceXML (VXML)-based Interactive Voice Response (IVR)** systems by integrating them with cutting-edge **Conversational AI platforms** like ACS and BAP. By reusing and extending existing assets, we enable seamless transitions to **natural language-driven interactions**, enhancing usability, user experience, and operational efficiency while minimizing redevelopment efforts.

The framework supports **dual-mode operations**: traditional digit-based IVR menus alongside **voice-activated conversational workflows**. This intelligent bridge ensures backward compatibility, real-time data handling, and scalable deployment.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-%23007ACC.svg?style=for-the-badge)](https://conversational-ivr-modernization-fr.vercel.app/)

---

## ✨ Key Features
- **Legacy Integration**: Connectors for VXML systems to ACS/BAP, enabling real-time communication without full rewrites.
- **Conversational AI Flows**: Natural language processing (NLP) for intent recognition, mapping user speech to IVR actions like balance checks, recharges, and agent transfers.
- **Dual-Mode Support**: Handles numeric keypad inputs and voice queries via a unified middleware layer.
- **Enhanced User Experience**: Voice-driven dialogues with text-to-speech (TTS) readiness, reducing navigation friction.
- **Scalable Architecture**: Modular design with middleware APIs, services, and controllers for easy maintenance and expansion.
- **Comprehensive Testing**: Full-cycle validation for performance, accuracy, and edge cases.

---

## 📋 Project Overview
### Project Statement
Modernize existing IVR systems built on VXML by integrating with ACS and BAP. Reuse legacy assets to support conversational interfaces, focusing on usability, user experience, and reduced transition costs.

### Expected Outcomes
- Seamless integration of VXML IVRs with ACS/BAP.
- Conversational interactions within traditional frameworks.
- Minimized redevelopment during legacy-to-AI transitions.
- Improved end-user experience via voice workflows.

---
## 🧱 Project Structure
The repository is organized into frontend, backend, and shared utilities for a full-stack implementation.

```
Conversational-IVR-Modernization-Framework/
├── controllers/
│   ├── ivrController.js          # Logic for digit-based IVR requests
│   ├── conversationController.js # Logic for natural language queries
│   ├── acsController.js          # Handles requests for the mock ACS service
│   └── bapController.js          # Handles requests for the mock BAP service
│
├── routes/
│   ├── ivrRoutes.js              # Defines the /ivr/* endpoints
│   ├── conversationRoutes.js     # Defines the /conversation/* endpoints
│   ├── acsRoutes.js              # Defines the /acs/* endpoints
│   └── bapRoutes.js              # Defines the /bap/* endpoints
│
├── services/
│   ├── intentService.js          # The "brain" - maps user speech to intents
│   ├── acsService.js             # Simulates the legacy ACS backend
│   └── bapService.js             # Simulates the legacy BAP backend
│
├── utils/
│   └── logger.js                 # Contains the global error handler
│
├── .env                          # Environment configuration (PORT, URLs)
├── .gitignore                    # Specifies files for Git to ignore
├── index.js                      # The main entry point of the server
├── package.json                  # Node.js dependencies and scripts
└── README.md                     # This project documentation file
└── LICENSE
```

---

## 👩‍💻 Contributors

<a href="https://github.com/ramyainavolu"><img src="https://github.com/ramyainavolu.png" width="50" alt="Ramya Inavolu"></a>
<a href="https://github.com/Seshwar123"><img src="https://github.com/Seshwar123.png" width="50" alt="Seshwar Bhemineni"></a>
<a href="https://github.com/ranesujal2005"><img src="https://github.com/ranesujal2005.png" width="50" alt="Sujal Rane"></a>
<a href="https://github.com/Umanjanipati"><img src="https://github.com/Umanjanipati.png" width="50" alt="Pati Veera Surya Umanjani"></a>
<a href="https://github.com/ThrupthiChandanaG"><img src="https://github.com/ThrupthiChandanaG.png" width="50" alt="Thrupthi Chandana G"></a>
<br>
<a href="https://github.com/Maheswari-565"><img src="https://github.com/Maheswari-565.png" width="50" alt="Uma Maheswari Naidu"></a>
<a href="https://github.com/joise-s-arakkal"><img src="https://github.com/joise-s-arakkal.png" width="50" alt="Joise S Arakkal"></a>
<a href="https://github.com/Nehasri99"><img src="https://github.com/Nehasri99.png" width="50" alt="Parasaram Neha Sri"></a>
<a href="https://github.com/alankrith123"><img src="https://github.com/alankrith123.png" width="50" alt="Alankrith"></a>
<a href="https://github.com/Laasya5"><img src="https://github.com/Laasya5.png" width="50" alt="Laasya"></a>


## 🛠️ Tech Stack
- **Frontend**: React.js, Vercel for deployment, Web Speech API for voice interactions.
- **Backend**: Node.js, Express.js, Axios for API calls.
- **AI/ML**: Keyword-based intent recognition (extensible to Dialogflow/Rasa).
- **Configuration**: dotenv for environment management.
- **Development**: Nodemon for hot-reloading, Git for version control.

---

## 🌐 API Endpoints
The backend exposes RESTful endpoints for IVR and conversational interactions.

| Endpoint                  | Method | Description                          | Request Body Example |
|---------------------------|--------|--------------------------------------|----------------------|
| `/ivr/request`            | POST   | Process digit-based IVR input.       | `{"sessionId": "abc123", "digit": "1"}` |
| `/conversation/process`   | POST   | Handle natural language queries.     | `{"sessionId": "abc123", "query": "Check my balance"}` |
| `/acs/*`                  | GET/POST | Mock ACS service routes.            | Varies by action. |
| `/bap/*`                  | GET/POST | Mock BAP service routes.            | Varies by action. |

---

## 🔮 Future Enhancements
- **Advanced NLU**: Integrate full NLP engines (e.g., Google Dialogflow) for multi-turn conversations.
- **Database Layer**: Add MongoDB/PostgreSQL for session persistence and analytics.
- **Authentication**: JWT-based user sessions for secure, personalized interactions.
- **Cloud Scaling**: AWS/Heroku deployment with auto-scaling.
- **Analytics Dashboard**: Track user engagement and system performance.

---

## 📜 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
---

*Built with ❤️*
