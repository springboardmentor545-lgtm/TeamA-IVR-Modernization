# Middleware Project

This folder contains the core Express.js middleware and routing logic for the TeamA IVR Modernization initiative. It exposes endpoints for both IVR (Interactive Voice Response) and ACS (Automated Call System) flows, integrates with the main app, and includes comprehensive test documentation.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Testing](#testing)
- [Test Cases Reference](#test-cases-reference)
- [Dependencies](#dependencies)
- [License](#license)

## Overview

This middleware exposes REST APIs for IVR and ACS integration, handling request routing, input validation, and automated test scenarios. It is designed to serve as the central communication layer between the frontend IVR interface and backend services.

## Project Structure

```
middleware-project/
│
├── index.js                        # Main Express app entry point
├── package.json                    # Project manifest and scripts
├── package-lock.json               # Dependency lock file
├── TeamA-IVR-API.postman_collection.json # Postman collection for endpoint testing
├── TEST_CASES_DOCUMENTATION.md     # Details and expected outcomes for all API test cases
├── routes/
│   ├── acsRoutes.js                # ACS endpoint routing logic (not shown here)
│   └── ivrRoutes.js                # IVR endpoint routing logic (not shown here)
└── ... (other supporting files)
```

## Installation

You must have [Node.js](https://nodejs.org/) installed.

```bash
cd middleware-project
npm install
```

## Usage

Start the middleware server:
```bash
npm start
```
Or for development with hot-reload:
```bash
npm run dev
```
By default, the server runs on port `3000`. You can override this by setting the `PORT` environment variable.

## Endpoints

### IVR Endpoints
- `POST /ivr`
  - Handles DTMF input for balance inquiry and agent transfer.
  - See test cases in [TEST_CASES_DOCUMENTATION.md](./TEST_CASES_DOCUMENTATION.md).

### ACS Endpoints
- `POST /acs`
  - Handles call initiation, termination, and DTMF tone transmission.
  - See test cases in [TEST_CASES_DOCUMENTATION.md](./TEST_CASES_DOCUMENTATION.md).

## Testing

- Use [TeamA-IVR-API.postman_collection.json](./TeamA-IVR-API.postman_collection.json) for automated API tests in Postman.
- Test scripts validate correct responses, error handling, and response times.
- See [TEST_CASES_DOCUMENTATION.md](./TEST_CASES_DOCUMENTATION.md) for expected inputs and outputs.

## Test Cases Reference

- **Positive Tests:** Balance inquiry, agent transfer, ACS call management.
- **Negative Tests:** Invalid inputs, missing required fields, empty requests.
- **Integration Tests:** Full IVR-to-ACS flow scenarios.

## Dependencies

- [express](https://www.npmjs.com/package/express)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [nodemon](https://www.npmjs.com/package/nodemon) (dev)

See [package.json](./package.json) for details.

## License

This project is licensed under ISC. See [package.json](./package.json) for more.
