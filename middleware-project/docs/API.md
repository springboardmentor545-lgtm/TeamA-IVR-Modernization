# Conversational IVR Modernization API Documentation  

Project: TeamA IVR Modernization  
Author: Sumedha Kar  
Date: 2025-09-10  
Version: v1  
Module: API Documentation  

---

## Overview
This API provides endpoints for the Conversational IVR Modernization Framework.  
It simulates interactions with IVR, ACS, and BAP systems to support development and QA testing.  

Who should use it: Developers, QA testers, and new contributors.  

---

## Base URL & Versioning
- Base URL: `http://localhost:3000`  
- Version: v1   
- Note: v2 will include authentication and real ACS/BAP integrations.  

---

## Headers
| Key            | Value               | Required | Notes                 |
|----------------|---------------------|----------|-----------------------|
| Content-Type   | application/json    | Yes      | For all POST requests |
| Accept         | application/json    | Optional | Defaults to JSON      |
| Authorization  | N/A (for now)       | No       | Will be added in v2   |

---

## Conventions
- All endpoints use POST unless stated otherwise.  
- All responses are JSON.  
- IDs and timestamps are strings.  

---

## Endpoints Summary
| Endpoint         | Method | Description             |
|------------------|--------|-------------------------|
| `/ivr`           | POST   | Handle IVR input        |
| `/acs/start`     | POST   | Start ACS call          |
| `/acs/stop`      | POST   | Stop ACS call           |
| `/acs/sendDTMF`  | POST   | Send DTMF digits to ACS |
| `/bap/input`     | POST   | Process BAP intent      |
| `/`              | GET    | Health check            |

---

## IVR Endpoint

### 1. POST `/ivr`
Description: Routes IVR user input (DTMF/Speech).  
- Input `1` → Balance info (BAP).  
- Input `2` → Transfer to agent (ACS).  

Request Fields  
| Field      | Type   | Required | Description                |
|------------|--------|----------|----------------------------|
| sessionId  | String | Yes      | Unique session identifier  |
| inputType  | String | Yes      | `dtmf` or `speech`         |
| inputValue | String | Yes      | User input (e.g., "1")     |

Success Example (Input = 1)  
```json
{
  "sessionId": "12345",
  "responseText": "Your account balance is ₹5,000."
}
````

Negative Example (Missing sessionId)
*Response Code: 400 Bad Request*

```json
{ "error": "sessionId is required" }
```

---

## ACS Endpoints

### 2. POST `/acs/start`

Description: Start an ACS call.

Request

```json
{ "sessionId": "sess1" }
```

Success Response

```json
{
  "success": true,
  "message": "ACS call started successfully",
  "acsCallId": "acs_001"
}
```

Negative Example (Missing sessionId)
*Response Code: 400 Bad Request*

```json
{ "error": "sessionId is required" }
```

---

### 3. POST `/acs/stop`

Description: Stop an active ACS call.

Request

```json
{ "sessionId": "sess1" }
```

Success Response

```json
{
  "success": true,
  "message": "ACS call stopped successfully"
}
```

---

### 4. POST `/acs/sendDTMF`

Description: Send DTMF tones to ACS.

Request

```json
{
  "sessionId": "sess1",
  "dtmf": "1234"
}
```

Success Response

```json
{
  "success": true,
  "message": "DTMF tones sent successfully"
}
```

Negative Example (Missing DTMF)
*Response Code: 400 Bad Request*

```json
{ "error": "dtmf is required" }
```

---

## BAP Endpoint

### 5. POST `/bap/input`

Description: Handle BAP intents based on IVR input.

Request

```json
{
  "sessionId": "sess1",
  "inputType": "dtmf",
  "inputValue": "1"
}
```

Success (Input = 1 → Balance)

```json
{
  "intent": "GetBalance",
  "responseText": "Your balance is ₹5,000"
}
```

Success (Input = 2 → Transfer)

```json
{
  "intent": "TransferToAgent",
  "nextAction": { "transfer": true }
}
```

Negative (Invalid Input)
*Response Code: 400 Bad Request*

```json
{ "error": "Invalid input value" }
```

---

## Health Check

### 6. GET `/`

Description: Simple endpoint to check API health.

Response

```json
{ "status": "ok" }
```

---

## Integration Flows

* Flow 1: IVR Input `1` → `/bap/input` → Balance response.
* Flow 2: IVR Input `2` → `/acs/start` → Agent transfer.


---

## Error Handling

| HTTP Code | Error Type   | Example                                            | Cause                                    |
| --------- | ------------ | -------------------------------------------------- | ---------------------------------------- |
| 400       | Bad Request  | `{ "error": "sessionId is required" }`             | Missing required field (e.g., sessionId) |
| 400       | Bad Request  | `{ "error": "inputValue must be \"1\" or \"2\"" }` | Invalid IVR input value                  |
| 400       | Bad Request  | `{ "error": "Missing required fields" }`           | Incomplete or empty request body         |
| 400       | Bad Request  | `{ "error": "dtmf is required" }`                  | Missing DTMF digit in ACS request        |
| 404       | Not Found    | `{ "error": "session not found" }`                 | Invalid sessionId or callId              |
| 500       | Server Error | `{ "error": "internal server error" }`             | Unexpected backend error                 |

Notes:

* All error responses use a consistent JSON structure with an `error` field.
* Additional validation and detailed error logic will be added in v2.

---

## Testing & Postman

QA Postman collection includes:

* IVR positive + negative tests
* ACS positive + negative tests
* DTMF test
* Integration flows


---

## Future Enhancements (v2)

* Authentication (Bearer token)
* Real ACS + BAP integration
* Standardized error envelope
* Rate limiting
* Staging & production base URLs


