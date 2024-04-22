const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const User = require('../database/models/userModel');

beforeAll(async () => {
  // Connecting to the test database
  await mongoose.connect("mongodb+srv://bloguser:jessyhuncho12@blog-api.t7dyxxa.mongodb.net/?retryWrites=true&w=majority&appName=Blog-api"); 
}, 120000);

// Seed test data into the test database
beforeEach(async () => {
  await User.deleteMany();
  await User.create([
    { first_name: 'Chidera', last_name: 'Ezeoke', email: 'jclinton162@gmail.com', password: 'huncho12' },
    { first_name: 'Test', last_name: 'User', email: 'test@example.com', password: 'password' }
  ]);
});

  // Close the database connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

describe("Blog Endpoints", () => {
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

  it('should create a new blog post', async () => {
    const response = await request(app)
      .post('/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Blog Post',
        description: 'This is a test blog post',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        tags: ['tag1', 'tag2'],
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('title', 'Test Blog Post');
    expect(response.body).toHaveProperty('state', 'draft');
  });

  it('should update an existing blog post', async () => {
    // Create a new blog post to update
    const createResponse = await request(app)
      .post('/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Blog Post',
        description: 'This is a test blog post',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        tags: ['tag1', 'tag2'],
      });

    const blogId = createResponse.body._id;

    // Update the blog post
    const updateResponse = await request(app)
      .put(`/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Blog Post',
        description: 'This is an updated blog post',
        body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        tags: ['tag1', 'tag2'],
        state: 'published',
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toHaveProperty('_id', blogId);
    expect(updateResponse.body).toHaveProperty('title', 'Updated Blog Post');
    expect(updateResponse.body).toHaveProperty('state', 'published');
  });

  it('should delete an existing blog post', async () => {
    // Create a new blog post to delete
    const createResponse = await request(app)
      .post('/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Blog Post to Delete',
        description: 'This is a blog post to delete',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        tags: ['tag1', 'tag2'],
      });

    const blogId = createResponse.body._id;

    // Delete the blog post
    const deleteResponse = await request(app)
      .delete(`/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(204);
  });

  it('should get all published blogs', async () => {
    const response = await request(app)
      .get('/blogs')
      .query({ state: 'published' });

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should get a specific published blog', async () => {
    // Create a new published blog post
    const createResponse = await request(app)
      .post('/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Published Blog Post',
        description: 'This is a published blog post',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        tags: ['tag1', 'published'],
        state: 'published',
      });

    const blogId = createResponse.body._id;

    // Get the specific published blog post
    const getResponse = await request(app)
      .get(`/blogs/${blogId}`);

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toHaveProperty('_id', blogId);
    expect(getResponse.body).toHaveProperty('state', 'published');
  });
});

