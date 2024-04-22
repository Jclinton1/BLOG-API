const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../database/models/userModel');

// Connection to test database
beforeAll(async () => {
  await mongoose.connect('mongodb+srv://bloguser:jessyhuncho12@blog-api.t7dyxxa.mongodb.net/?retryWrites=true&w=majority&appName=Blog-api');
}, 120000);

// Seed test data into the test database before each test
beforeEach(async () => {
  // Clear the User collection and seed test data
  await User.deleteMany();
  await User.create([
    { first_name: 'Test', last_name: 'User', email: 'test@example.com', password: 'password' }
  ]);
});

// Close the database connection after all tests are done
afterAll(async () => {
  await mongoose.disconnect();
});

describe('Authentication Endpoints', () => {
  it('should sign up a new user', async () => {
    const response = await request(app)
      .post('/auth/signup')
      .send({
        first_name: 'Chidera',
        last_name: 'Ezeoke',
        email: 'jclinton162@gmail.com',
        password: 'huncho12',
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('userId');
  });

  it('should sign in an existing user', async () => {
    const response = await request(app)
      .post('/auth/signin')
      .send({
        email: 'jclinton162@gmail.com',
        password: 'huncho',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('userId');
  });

  it('should return error for invalid sign in', async () => {
    const response = await request(app)
      .post('/auth/signin')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});

