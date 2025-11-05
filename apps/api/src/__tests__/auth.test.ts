import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app';

const app = createApp();

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/talkitout-test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth API', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test Student',
          email: 'test@student.sg',
          password: 'password123',
          age: 15,
          school: 'Test School',
          guardianConsent: true,
          role: 'student',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('email', 'test@student.sg');
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Test Student 2',
          email: 'duplicate@student.sg',
          password: 'password123',
          age: 15,
          guardianConsent: true,
        });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test Student 3',
          email: 'duplicate@student.sg',
          password: 'password123',
          age: 15,
          guardianConsent: true,
        });

      expect(response.status).toBe(409);
    });

    it('should validate age range', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Too Young',
          email: 'young@student.sg',
          password: 'password123',
          age: 9,
          guardianConsent: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // First create a user
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Login Test',
          email: 'login@student.sg',
          password: 'password123',
          age: 16,
          guardianConsent: true,
        });

      // Then login
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@student.sg',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@student.sg',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});
