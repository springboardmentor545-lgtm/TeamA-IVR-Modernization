# TeamA IVR Modernization - Test Cases Documentation

## Overview
This document describes the comprehensive test cases for the IVR and ACS API endpoints, including automated validations and negative test scenarios.

## Postman Collection Structure

### 📁 IVR Endpoints
- **IVR - Test Case 1: Input 1 (Balance)** - Tests balance retrieval functionality
- **IVR - Test Case 2: Input 2 (Transfer)** - Tests agent transfer functionality
- **IVR - Negative Test: Invalid Input Value** - Tests validation for invalid inputs
- **IVR - Negative Test: Missing Required Fields** - Tests error handling for missing fields
- **IVR - Negative Test: Empty Request Body** - Tests error handling for empty requests

### 📁 ACS Endpoints
- **ACS - Start Call** - Tests call initiation functionality
- **ACS - Stop Call** - Tests call termination functionality
- **ACS - Send DTMF** - Tests DTMF tone transmission
- **ACS - Negative Test: Missing sessionId** - Tests validation for missing sessionId
- **ACS - Negative Test: Missing digit for DTMF** - Tests validation for missing DTMF digit

### 📁 Integration Tests
- **Full IVR Flow: Input 1 → Balance → Start Call** - End-to-end test for balance flow
- **Full IVR Flow: Input 2 → Transfer → Start Call** - End-to-end test for transfer flow

## Test Cases Details

### ✅ Test Case 1: Input 1 → Balance Response

**Endpoint:** `POST /ivr/`
**Request Body:**
```json
{
  "sessionId": "test-session-123",
  "inputType": "dtmf",
  "inputValue": "1"
}
```

**Expected Response:**
```json
{
  "sessionId": "test-session-123",
  "responseText": "Your account balance is ₹5,000.00"
}
```

**Automated Validations:**
- ✅ Status code is 200
- ✅ Response contains sessionId
- ✅ Response text includes "balance"
- ✅ Response text includes "₹" (currency symbol)
- ✅ Response time < 2000ms
- ✅ Content-Type is application/json

### ✅ Test Case 2: Input 2 → Transfer Response

**Endpoint:** `POST /ivr/`
**Request Body:**
```json
{
  "sessionId": "test-session-123",
  "inputType": "dtmf",
  "inputValue": "2"
}
```

**Expected Response:**
```json
{
  "sessionId": "test-session-123",
  "responseText": "Please wait while we transfer you to an agent."
}
```

**Automated Validations:**
- ✅ Status code is 200
- ✅ Response contains sessionId
- ✅ Response text includes "transfer"
- ✅ Response text includes "agent"
- ✅ Response time < 2000ms
- ✅ Content-Type is application/json

## Negative Test Cases

### ❌ Invalid Input Value Test

**Endpoint:** `POST /ivr/`
**Request Body:**
```json
{
  "sessionId": "test-session-123",
  "inputType": "dtmf",
  "inputValue": "3"
}
```

**Expected Response:**
```json
{
  "error": "inputValue must be \"1\" or \"2\""
}
```

**Automated Validations:**
- ✅ Status code is 400
- ✅ Response contains error message
- ✅ Response time < 1000ms

### ❌ Missing Required Fields Test

**Endpoint:** `POST /ivr/`
**Request Body:**
```json
{
  "sessionId": "test-session-123"
}
```

**Expected Response:**
```json
{
  "error": "Missing required fields"
}
```

**Automated Validations:**
- ✅ Status code is 400
- ✅ Response contains error message
- ✅ Response time < 1000ms

### ❌ Empty Request Body Test

**Endpoint:** `POST /ivr/`
**Request Body:**
```json
{}
```

**Expected Response:**
```json
{
  "error": "Missing required fields"
}
```

**Automated Validations:**
- ✅ Status code is 400
- ✅ Response contains error message

## ACS Endpoint Tests

### ✅ ACS Start Call Test

**Endpoint:** `POST /acs/start`
**Request Body:**
```json
{
  "sessionId": "test-session-123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "sessionId": "test-session-123",
  "action": "startCall",
  "message": "Mock: Call started for test-session-123",
  "acsCallId": "ACS-1234567890"
}
```

**Automated Validations:**
- ✅ Status code is 200
- ✅ Response has success property (true)
- ✅ Response contains call information
- ✅ Response time < 2000ms
- ✅ Content-Type is application/json

### ✅ ACS Stop Call Test

**Endpoint:** `POST /acs/stop`
**Request Body:**
```json
{
  "sessionId": "test-session-123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "sessionId": "test-session-123",
  "action": "stopCall",
  "message": "Mock: Call stopped for test-session-123"
}
```

**Automated Validations:**
- ✅ Status code is 200
- ✅ Response has success property (true)
- ✅ Response contains stop information
- ✅ Response time < 2000ms
- ✅ Content-Type is application/json

### ✅ ACS Send DTMF Test

**Endpoint:** `POST /acs/sendDTMF`
**Request Body:**
```json
{
  "sessionId": "test-session-123",
  "digit": "1"
}
```

**Expected Response:**
```json
{
  "success": true,
  "sessionId": "test-session-123",
  "action": "sendDTMF",
  "dtmf": "1",
  "message": "Mock: Received DTMF '1' for test-session-123"
}
```

**Automated Validations:**
- ✅ Status code is 200
- ✅ Response has success property (true)
- ✅ Response contains DTMF information
- ✅ Response time < 2000ms
- ✅ Content-Type is application/json

## Integration Test Scenarios

### 🔄 Full IVR Flow: Input 1 → Balance → Start Call

1. **Step 1:** Send IVR input "1" to get balance
2. **Step 2:** Use returned sessionId to start ACS call
3. **Validation:** Ensure seamless flow between IVR and ACS services

### 🔄 Full IVR Flow: Input 2 → Transfer → Start Call

1. **Step 1:** Send IVR input "2" to get transfer message
2. **Step 2:** Use returned sessionId to start ACS call
3. **Validation:** Ensure seamless flow between IVR and ACS services

## How to Use the Postman Collection

### 1. Import the Collection
1. Open Postman
2. Click "Import" button
3. Select `TeamA-IVR-API.postman_collection.json`
4. Click "Import"

### 2. Set Environment Variables
The collection uses these variables:
- `baseUrl`: `http://localhost:3000` (default)
- `sessionId`: Auto-generated random session ID

### 3. Run Individual Tests
1. Select any test from the collection
2. Click "Send" button
3. View results in the "Test Results" tab

### 4. Run Collection Runner
1. Click on the collection name
2. Click "Run" button
3. Select all tests or specific tests
4. Click "Run TeamA IVR Modernization API"

### 5. View Test Results
- **Passed Tests:** Green checkmarks
- **Failed Tests:** Red X marks with error details
- **Response Time:** Shown for each request
- **Test Results:** Detailed validation results

## Automated Validations Included

### Response Validation
- ✅ HTTP status code verification
- ✅ Response structure validation
- ✅ Required field presence checks
- ✅ Data type validation
- ✅ Content-Type header validation

### Performance Validation
- ✅ Response time thresholds
- ✅ Global response time limits
- ✅ Individual endpoint performance checks

### Error Handling Validation
- ✅ Error message content validation
- ✅ Error status code verification
- ✅ Error response structure validation

### Integration Validation
- ✅ Cross-service data flow
- ✅ Session ID consistency
- ✅ End-to-end workflow validation

## Test Coverage Summary

| Category | Test Cases | Coverage |
|----------|------------|----------|
| IVR Positive Tests | 2 | 100% |
| IVR Negative Tests | 3 | 100% |
| ACS Positive Tests | 3 | 100% |
| ACS Negative Tests | 2 | 100% |
| Integration Tests | 2 | 100% |
| **Total** | **12** | **100%** |

## Notes

- All tests include automated assertions
- Response times are validated against performance thresholds
- Error scenarios are thoroughly tested
- Integration tests ensure end-to-end functionality
- Collection can be run in CI/CD pipelines
- Tests are designed to be maintainable and scalable

## Troubleshooting

### Common Issues
1. **Server not running:** Ensure the Node.js server is running on port 3000
2. **Test failures:** Check server logs for detailed error information
3. **Timeout errors:** Verify server response times are within acceptable limits

### Debug Tips
1. Check the "Console" tab in Postman for detailed logs
2. Review the "Test Results" tab for specific validation failures
3. Use the "Raw" response view to inspect actual API responses
