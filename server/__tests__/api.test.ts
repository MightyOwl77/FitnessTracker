
import express from 'express';
import request from 'supertest';
import { setupAppRoutes } from '../routes';

describe('API Endpoints', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    setupAppRoutes(app);
  });

  describe('Profile API', () => {
    test('GET /api/profile should return profile data', async () => {
      const response = await request(app).get('/api/profile');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    test('POST /api/profile should create or update profile', async () => {
      const profileData = {
        gender: 'male',
        age: 40,
        height: 175,
        activityLevel: 'moderate'
      };

      const response = await request(app)
        .post('/api/profile')
        .send(profileData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Goals API', () => {
    test('GET /api/goals should return goals data', async () => {
      const response = await request(app).get('/api/goals');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    test('POST /api/goals should create or update goals', async () => {
      const goalData = {
        currentWeight: 85,
        targetWeight: 75,
        currentBodyFat: 22,
        targetBodyFat: 15,
        timeFrame: 12,
        weightLiftingSessions: 3,
        cardioSessions: 2,
        stepsPerDay: 8000
      };

      const response = await request(app)
        .post('/api/goals')
        .send(goalData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
});
