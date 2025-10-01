# Conversational IVR Modernisation  
**Conversational Middleware – Milestone 3**  

---

## Team A Members
- Bhargav Molleti
- Animesh Mondal
- Prachi Saxena
- Karnika 
- Vinay Kumar
- Shifa
- Amita
- Amshula
- Sumedha Kar  
- Nithya
- Abilash

---

## Introduction and Overview

In **Milestone 3**, the project goal was to extend our IVR modernization middleware with **conversational capabilities**. Traditional IVR systems mainly rely on DTMF (Dual Tone Multi Frequency) inputs, which can feel restrictive for users. Our objective was to allow natural language interactions (typed or voice-transcribed queries), creating a system that is more user-friendly and scalable for future AI upgrades.  

To achieve this, we:  
- Introduced a new endpoint `/ivr/conversation`.  
- Built an **intent detection module** to route queries intelligently.  
- Enhanced **ACS (Account Control Service)** and **BAP (Business Agent Platform)** mock services to support conversational requests.  
- Implemented fallback responses for unsupported queries.  
- Validated functionality with positive, negative, and fallback test cases.  

This milestone represents a shift from a **menu-driven IVR system** to a **modern conversational middleware framework**.  

---

## System Architecture

![System Architecture Diagram](middleware-project/docs/architecture.png)



**Explanation:**  
- User queries are received by the **Middleware**.  
- Middleware forwards queries to the **Intent Detection** module.  
- Based on detected intent:  
  - **ACS** handles account-related queries (balance, recharge, card operations).  
  - **BAP** handles agent or transactional queries (mini statement, loans, utility bills).  
  - **Fallback** safely handles unsupported or unknown queries.  
- Responses are returned through the Middleware back to the User.  

This modular design ensures **clear routing, scalability, and future readiness** for AI-powered NLU integration.  

---

## Project Structure

middleware-project/
│
├── index.js # Main Express app entry point
├── package.json # Project manifest and scripts
├── routes/
│ ├── ivrRoutes.js # IVR + /ivr/conversation routing
│ ├── acsRoutes.js # ACS endpoint routing
├── controllers/
│ ├── ivrController.js # IVR & conversation handling
│ ├── acsController.js # ACS call management
├── services/
│ ├── acsService.js # Mock ACS services
│ ├── bapService.js # Mock BAP services
├── handlers/
│ └── intentHandler.js # Intent detection (keyword-based)
├── docs/
│ ├── API.md # Detailed API documentation
│ └── architecture.png # System flow diagram
└── tests/
└── postman_collection.json # Automated QA test cases



---

## Endpoints

### IVR Endpoints
- `POST /ivr`  
  Handles traditional IVR input (DTMF).  

### ACS Endpoints
- `POST /acs/start`  
- `POST /acs/stop`  
- `POST /acs/sendDTMF`  

### Conversational Endpoint
- `POST /ivr/conversation`  
  - Accepts user queries in natural language.  
  - Routes them to **ACS** or **BAP** depending on detected intent.  
  - Returns structured JSON response.  

---

## Testing

- Postman collection (`postman_collection.json`) covers:  
  - **Positive flows** – balance inquiry, recharge, loan details, agent requests.  
  - **Negative flows** – missing fields, invalid input, empty body.  
  - **Fallback flows** – unsupported queries like “play music”.  

---

## Test Cases Reference

- **Positive Tests:** ACS (balance, recharge, card ops), BAP (mini statement, utility bill, loans, e-statement).  
- **Negative Tests:** Missing `sessionId`, missing `query`, empty request body.  
- **Fallback Tests:** Unknown queries are safely handled with a polite error message.  

---

## Dependencies

- express  
- body-parser  
- nodemon (dev)  

All dependencies are declared in `package.json`.  

---

## License

This project is licensed under **ISC**.  