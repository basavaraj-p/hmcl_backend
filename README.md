# EV Kiosk Backend Application

## Overview
This is the backend application for the EV Kiosk, developed by Basavaraj in collaboration with Rahul at Senseops. The application is built using Node.js and follows REST Architecture principles to facilitate communication between the frontend React Application and MSSQL database.

## Technical Architecture
The codebase is organized into three main sections inside of the folder v1:
- Controllers
- Routes
- Database Services

These components are integrated using various npm packages including:
- express
- mssql
- dotenv

## Development Setup

### Prerequisites
- Node.js version >=18 installed on your system
- Access to the HMCL network
- Access to the MSSQL databases

### Installation
1. Open a terminal in the main project directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
You can start the application using either of these methods:

**Method 1: Direct Node Execution**
```bash
node index.js
```

**Method 2: Using PM2**
Add the application to PM2 for process management