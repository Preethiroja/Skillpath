const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../src/app');
const User = require('../src/models/User');

describe('Auth REST API Integration Endpoints', () => {
  beforeAll(async () => {
    // Avoid starting server since we export app directly
    // Connect database if not connected (Mongoose connects via connectDB automatically in app.js)
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await server.close();
  });

  describe('POST /api/auth/register validations', () => {
    it('should block registration requests lacking email details', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Beta Student',
          password: 'password123'
        });

      expect(res.status).toBe(400); // Mongoose validation will reject missing email
      expect(res.body.success).toBe(false);
    });

    it('should validate invalid formats of email inputs', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Beta Student',
          email: 'invalid-email-format',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
