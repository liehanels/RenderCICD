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

export default mongoose.model('Word', wordSchema);
```

### **2. Define Routes**
Create a `routes/Words.js` file:
```javascript
import express from 'express';
import Word from '../models/Word.js';

const router = express.Router();

// Add a word to the database
router.get('/addWord/:word', async (req, res) => {
    const { word } = req.params;
    if (!word) {
        return res.status(400).json({ error: 'Word is required' });
    }
    try {
        const newWord = new Word({ value: word });
        await newWord.save();
        return res.json({ message: 'Word added successfully' });
    } catch (err) {
        return res.status(500).json({ error: 'Error adding word' });
    }
});

// View all words in the database
router.get('/viewWords', async (req, res) => {
    try {
        const words = await Word.find();
        return res.json(words);
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching words' });
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

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

app.use('/api', wordRoutes);

const server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export { app, server };
```

### **4. Set Environment Variables**
Create a `.env` file:
```
MONGO_URI=mongodb://localhost:27017/yourDatabaseName
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
    jest.setTimeout(10000);
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.disconnect();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
});

describe('API Endpoints', () => {
    test('GET /api/addWord/:word should add a word', async () => {
        const response = await request(app).get('/api/addWord/testword');
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
  build-and-test:
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