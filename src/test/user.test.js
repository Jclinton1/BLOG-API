const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const User = require('../database/models/userModel');

beforeAll(async () => {
  // Connecting to test database
  await mongoose.connect("mongodb+srv://bloguser:jessyhuncho12@blog-api.t7dyxxa.mongodb.net/?retryWrites=true&w=majority&appName=Blog-api");
}, 120000);

  // Seed test data into the test database
  beforeEach(async () => {
    await User.deleteMany();
    await User.create([
      { first_name: 'Chidera', last_name: 'Ezeoke', email: 'jclinton162@gmail.com', password: 'huncho12' },
    ]);
  });

  // Close the database connection after all tests are done
afterAll(async () => {
  
  await mongoose.connection.close();
});

describe('User Endpoints', () => {
  let token;

  beforeAll(async () => {
    // Sign in a user to get authentication token
    const response = await request(app)
      .post('/auth/signin')
      .send({
        email: 'jclinton162@gmail.com',
        password: 'huncho12',
      });
    token = response.body.token;
  }, 120000);

  it('should get user profile', async () => {
    const response = await request(app)
      .get('/user/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('first_name', 'Chidera');
    expect(response.body).toHaveProperty('last_name', 'Ezeoke');
    expect(response.body).toHaveProperty('email', 'jclinton162@gmail.com');
    
  });

  it('should update user profile', async () => {
    const response = await request(app)
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name: 'Updated',
        last_name: 'User',
        email: 'updated@example.com',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('first_name', 'Updated');
    expect(response.body).toHaveProperty('last_name', 'Updated Lastname');
    expect(response.body).toHaveProperty('email', 'updated@example.com');
    
  });
});

