# Conversational IVR Modernization API Documentation

**Project:** Team A – IVR Modernization
**Author:** Sumedha Kar
**Date:** 2025-09-28
**Version:** v1
**Module:** API Documentation

---

## Overview

This API provides endpoints for the **Conversational IVR Modernization Framework**, enabling both **legacy IVR flows** (DTMF/speech) and **modern conversational AI flows**.

It integrates with **ACS (Account Customer Services)** and **BAP (Banking Application Platform)** mock services to simulate balance checks, recharge, card management, agent handoff, mini-statements, utility bill payments, and more.

**Who should use it?**
- Developers building middleware features
- QA testers validating functionality with Postman
- Future interns onboarding to the project

---

## Base URL & Versioning

- **Base URL:** `http://localhost:3000`
- **Version:** v1
- **Future (v2):** Authentication and real ACS/BAP integrations

---

## Headers

| Key | Value | Required | Notes |
|---------------|---------------------|----------|--------------------------------|
| Content-Type | application/json | Yes | Required for all POST requests |
| Accept | application/json | Optional | Defaults to JSON |
| Authorization | N/A (for now) | No | Will be added in v2 |

---

## Conventions

- All endpoints use **POST** unless stated otherwise.
- All responses are **JSON**.
- IDs and timestamps are returned as **strings**.

---

## Endpoints Summary

| Endpoint | Method | Purpose |
|----------------------|--------|-----------------------------------|
| `/ivr` | POST | Handle legacy IVR input (DTMF/speech) |
| `/ivr/conversation` | POST | Handle conversational free-text queries |
| `/acs/start` | POST | Start ACS call session |
| `/acs/stop` | POST | Stop ACS call session |
| `/acs/sendDTMF` | POST | Send DTMF tones to ACS |
| `/bap/input` | POST | Process BAP intents via IVR input |
| `/` | GET | Health check endpoint |

---

# 1. IVR Endpoints

## 1.1 POST `/ivr`

**Description:** Handles traditional IVR user input (DTMF or speech).
- Input `1` → Balance inquiry (BAP)
- Input `2` → Transfer to agent (ACS)

### Request Fields

| Field | Type | Required | Description |
|------------|--------|----------|-----------------------------------|
| sessionId | String | Yes | Unique session identifier |
| inputType | String | Yes | `"dtmf"` or `"speech"` |
| inputValue | String | Yes | User input (e.g., `"1"`) |

### Success Example

```json
{
"sessionId": "12345",
"responseText": "Your account balance is ₹5,000."
}
Error Example
Code: 400 Bad Request


{ "error": "sessionId is required" }

## 1.2 POST /ivr/conversation

Description: Handles conversational free-text queries.
The system detects intent via keyword matching and routes to ACS or BAP mock services.

Request Fields
Field Type Required Description
sessionId String Yes Unique session identifier
query String Yes Free-text query from user input

Success Response Format

{
"success": true,
"sessionId": "sess-123",
"response": "Your account balance is ₹500.",
"meta": { "intent": "ACS_BALANCE" }
}
Error Response Format

{
"success": false,
"sessionId": "sess-123",
"error": "sessionId and query are required"
}
Supported Intents & Examples
 ACS Intents
Balance Inquiry
Query: "Check my balance"


{
"success": true,
"sessionId": "101",
"response": "Your account balance is ₹500.",
"meta": { "intent": "ACS_BALANCE" }
}
Recharge Account
Query: "Recharge my account for 100"


{
"success": true,
"sessionId": "102",
"response": "Recharge successful for ₹100.",
"meta": { "intent": "ACS_RECHARGE" }
}
Report Lost Card
Query: "I lost my card, please block it"


{
"success": true,
"sessionId": "103",
"response": "Your card has been blocked immediately. A customer service agent will call you shortly.",
"meta": { "intent": "ACS_REPORT_LOST_CARD" }
}
Activate Card
Query: "How can I activate my new card?"


{
"success": true,
"sessionId": "104",
"response": "Your card ending with 1234 has been successfully activated.",
"meta": { "intent": "ACS_ACTIVATE_CARD" }
}
Update Contact Details
Query: "I want to update my mobile number"
{
"success": true,
"sessionId": "105",
"response": "Your contact details have been updated successfully.",
"meta": { "intent": "ACS_UPDATE_CONTACT" }
}

Report Suspicious Transaction
Query: "I see a suspicious transaction"
{
"success": true,
"sessionId": "106",
"response": "We have flagged the transaction for review and secured your account.",
"meta": { "intent": "ACS_REPORT_SUSPICIOUS" }
}

 BAP Intents
Agent Handoff
Query: "I want to talk to an agent"
{
"success": true,
"sessionId": "201",
"response": "Connecting you to a live agent. Please wait...",
"meta": { "intent": "BAP_AGENT" }
}

Mini Statement
Query: "Give me a mini statement"
{
"success": true,
"sessionId": "202",
"response": "Your last five transactions are: a debit of ₹50, a credit of ₹200, a debit of ₹25, a debit of ₹10, and a credit of ₹500.",
"meta": { "intent": "BAP_GET_MINI_STATEMENT" }
}
Pay Utility Bill
Query: "Pay my electricity bill"
{
"success": true,
"sessionId": "203",
"response": "Please say or enter your 10-digit customer ID for your utility provider.",
"meta": { "intent": "BAP_PAY_UTILITY_BILL" }
}
Loan Details Inquiry
Query: "Tell me about my loan"


{
"success": true,
"sessionId": "204",
"response": "Your outstanding loan balance is ₹1,20,000. Your next EMI of ₹10,000 is due on 10th Oct 2025.",
"meta": { "intent": "BAP_GET_LOAN_DETAILS" }
}
E-Statement Request
Query: "Send me my e-statement"


{
"success": true,
"sessionId": "205",
"response": "Your e-statement has been sent to your registered email address.",
"meta": { "intent": "BAP_REQUEST_ESTATEMENT" }
}
 Fallback (Unknown Intent)
Query: "What's the weather today?"
{
"success": true,
"sessionId": "300",
"response": "Sorry, I didn't understand that. Could you rephrase?",
"meta": { "intent": "UNKNOWN" }
}

 Negative Cases
Missing sessionId
{
"success": false,
"error": "sessionId and query are required"
}

Missing query
{
"success": false,
"sessionId": "sess-400",
"error": "sessionId and query are required"
}

Empty body
{
"success": false,
"error": "Missing required fields"
}

#2. ACS Endpoints

Legacy ACS routes (used in Milestone 2). Shown here for reference.

## 2.1 POST /acs/start

Request:


{ "sessionId": "sess1" }
Response:


{
"success": true,
"message": "ACS call started successfully",
"acsCallId": "acs_001"
}

## 2.2 POST /acs/stop

Request:
{ "sessionId": "sess1" }

Response:
{
"success": true,
"message": "ACS call stopped successfully"
}

## 2.3 POST /acs/sendDTMF

Request:
{
"sessionId": "sess1",
"dtmf": "1234"
}

Response:
{
"success": true,
"message": "DTMF tones sent successfully"
}

# 3. BAP Endpoint

POST /bap/input
Request:
{
"sessionId": "sess1",
"inputType": "dtmf",
"inputValue": "1"
}

Response (Balance):
{
"intent": "GetBalance",
"responseText": "Your balance is ₹5,000"
}

# 4. Health Check

GET /
Response:
{ "status": "ok" }

### Intent Detection Logic

The detectIntent(query) function maps user queries to intents using keyword-based matching.

"balance" → ACS_BALANCE
"recharge" → ACS_RECHARGE
"lost card", "block card", "report lost" → ACS_REPORT_LOST_CARD
"activate card" → ACS_ACTIVATE_CARD
"update contact", "change contact" → ACS_UPDATE_CONTACT
"suspicious", "fraud", "transaction" → ACS_REPORT_SUSPICIOUS
"agent", "representative" → BAP_AGENT
"mini statement" → BAP_GET_MINI_STATEMENT
"pay bill" → BAP_PAY_UTILITY_BILL
"loan" → BAP_GET_LOAN_DETAILS
"e-statement", "estatement" → BAP_REQUEST_ESTATEMENT
Otherwise → UNKNOWN

# 5. Error Codes

HTTP Code Error Type Example Cause
400 Bad Request { "error": "sessionId is required" } Missing required field (e.g., sessionId)
400 Bad Request { "error": "inputValue must be '1' or '2'" } Invalid IVR input value
400 Bad Request { "error": "dtmf is required" } Missing DTMF in ACS request
404 Not Found { "error": "session not found" } Invalid sessionId or callId
500 Server Error { "error": "internal server error" } Unexpected backend error

# 6. Testing & Postman

The Postman collection covers:

✅ ACS intents (balance, recharge, lost card, etc.)

✅ BAP intents (agent, loan, mini statement, etc.)

✅ Unknown/fallback queries

✅ Negative test cases (missing fields, empty body)

# 7. Future Enhancements (v2)

Authentication (Bearer token)

Real ACS + BAP integrations

Standardized error envelope

Rate limiting & monitoring

Staging & production base URLs
