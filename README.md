# Node.js Express Application with MongoDB: Step-by-Step Guide

This guide walks you through setting up a Node.js Express application with MongoDB, including routing, testing, and setting up CI/CD for deployment. Follow the instructions below to replicate the project.

---

## **Project Setup**

1. **Install Necessary Tools**:
   - Download and install [Node.js](https://nodejs.org/).
   - Set up a code editor, like [Visual Studio Code](https://code.visualstudio.com/).

2. **Initialize the Project**:
   ```bash
   npm init -y
   ```

3. **Install Dependencies**:
   - For the application:
     ```bash
     npm install express mongoose dotenv
     ```
   - For testing and development:
     ```bash
     npm install --save-dev jest supertest mongodb-memory-server babel-jest @babel/core @babel/preset-env cross-env
     ```

4. **Set Up the Directory Structure**:
   ```
   RenderCICD/
   ├── routes/
   │   └── Words.js
   ├── models/
   │   └── Word.js
   ├── __tests__/
   │   └── app.test.js
   ├── .env
   ├── server.mjs
   ├── package.json
   └── babel.config.json
   ```

---

## **Core Files**

### **1. Define the Word Model**
Create a `models/Word.js` file:
```javascript
import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema({
    value: { required: true, type: String },
});

const Word = mongoose.model('Word', wordSchema);

export default Word;
```

### **2. Define Routes**
Create a `routes/Words.js` file:
```javascript
import express from 'express';
import Word from '../models/Word.js'; // Import the Word model

const router = express.Router();

const HTTP_BAD_REQUEST = 400;
const HTTP_INTERNAL_SERVER_ERROR = 500;

// Add a word to the database using a GET request with a parameter
router.get('/addWord/:word', async (req, res) => {
    const { word } = req.params; // Extract the word from the URL parameter

    if (!word) {
        return res.status(HTTP_BAD_REQUEST).json({ error: 'Word is required' });
    }

    try {
        const newWord = new Word({ value: word });
        await newWord.save();
        return res.json({ message: 'Word added successfully' });
    } catch (err) {
        console.error('Error adding word:', err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ error: 'Error adding word' });
    }
});

// View all words from the database
router.get('/viewWords', async (req, res) => {
    try {
        const words = await Word.find();
        return res.json(words);
    } catch (err) {
        console.error('Error fetching words:', err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ error: 'Error fetching words' });
    }
});

export default router;
```

### **3. Set Up the Server**
Create a `server.mjs` file:
```javascript
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import wordRoutes from './routes/Words.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Use the routes
app.use('/api', wordRoutes);

// Start the server
const server = app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on port ${process.env.PORT || PORT}`);
});

export { app, server };
```

### **4. Set Environment Variables**
Create a `.env` file:
```
MONGO_URI="mongodb+srv://liehan13:P%40ssw0rd@maincluster.tbelnas.mongodb.net/?retryWrites=true&w=majority&appName=MainCluster"
PORT=3001
```

---

## **Testing**

### **1. Test File**
Create a `__tests__/app.test.js` file:
```javascript
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app, server } from '../server.mjs';
import { jest } from '@jest/globals';

let mongoServer;

beforeAll(async () => {
    jest.setTimeout(10000); // Increase timeout
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.disconnect(); // Disconnect default connection
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close(); // Close the server
});

describe('API Endpoints', () => {
    test('POST /api/addWord should add a word', async () => {
        const response = await request(app)
            .get('/api/addWord/testword');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Word added successfully');
    });

    test('GET /api/viewWords should return all words', async () => {
        const response = await request(app).get('/api/viewWords');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
```

### **2. Run Tests**
Run the tests to validate the application:
```bash
npm test
```

---

## **Starting the Server**

Start the application:
```bash
node server.mjs
```

Use a browser or tools like Postman to test the API endpoints:
- Add a word: `GET http://localhost:3000/api/addWord/<word>`
- View words: `GET http://localhost:3000/api/viewWords`

---

## **Optional Enhancements**

### **1. Add Linting**
- Install ESLint:
  ```bash
  npm install --save-dev eslint
  ```
- Initialize ESLint:
  ```bash
  npx eslint --init
  ```
- Add a linting script to `package.json`:
  ```json
  "scripts": {
      "lint": "eslint ."
  }
  ```
- Run the linter:
  ```bash
  npm run lint
  ```

### **2. Add CI/CD Pipeline**
Create a `.github/workflows/ci.yml` file:
```yaml
name: Node.js CI/CD Pipeline

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test

    - name: Lint code
      run: npm run lint
```
---
## **Deploying to Render**

### **1. Create a Render Account**
- Sign up at [Render](https://render.com) and log in to your account.

### **2. Push Your Code to GitHub**
- Make sure your project is a Git repository:
  ```bash
  git init
  git add --all
  git commit -m "Initial commit"
  ```
- Push your code to GitHub:
  ```bash
  git remote add origin git@github.com:<your-username>/<your-repo-name>.git
  git push -u origin main
  ```
  ### **OR USE GITHUB DESKTOP**

### **3. Set Up MongoDB Atlas**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
- Configure:
  - **Database Access**: Create a username and password.
  - **Network Access**: Whitelist all IPs (`0.0.0.0/0`).
- Copy your connection string from the "Connect your application" option.
- Update your `.env` file:
  ```
  MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<databaseName>?retryWrites=true&w=majority
  ```

### **4. Create a New Web Service on Render**
- Go to Render, click **New > Web Service**, and connect your GitHub repository.
- Select the branch to deploy (e.g., `main`).

### **5. Configure the Web Service**
- Set the following:
  - **Environment**: Node.js.
  - **Build Command**: `npm install`.
  - **Start Command**: `node server.mjs`.
- Add your MongoDB URI as an environment variable:
  - Key: `MONGO_URI`
  - Value: `mongodb+srv://<username>:<password>@cluster.mongodb.net/<databaseName>?retryWrites=true&w=majority`
  **PORT IS NOT REQUIRED**

### **6. Deploy the Application**
- Click **Create Web Service**.
- Render will build and deploy your application.
- Access your app via the live URL provided by Render.

### **7. Test Your Application**
- Use your live URL to test the API endpoints:
  - Add a word: `GET https://<your-app-name>.onrender.com/api/addWord/<word>`
  - View words: `GET https://<your-app-name>.onrender.com/api/viewWords`

---