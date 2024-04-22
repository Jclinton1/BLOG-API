const express = require('express');
const authMiddleware = require('../middlewares/authenticationMiddleware');
const blogController = require('../controllers/blogController');

const router = express.Router();

// Route to get all published blogs (accessible to all users)
router.get('/', blogController.getPublishedBlogs);

// Route to get a specific published blog (accessible to all users)
router.get('/:id', blogController.getBlog);

// Authentication middleware
router.use(authMiddleware);

// Routes for authenticated users to manage their own blogs
router.post('/', blogController.createBlog);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

// Route to get all blogs of the authenticated user
router.get('/user-blogs', blogController.getUserBlogs);

module.exports = router;
