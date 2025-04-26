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