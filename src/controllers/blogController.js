const Blog = require('../database/models/blogModel');
const logger = require('../utils/logging');

exports.createBlog = async (req, res) => {
  try {
    const { title, description, body, tags } = req.body;

    // Create a new blog post
    const newBlog = new Blog({
      title,
      description,
      body,
      tags,
      author: req.user._id,
      state: 'draft',
    });

    newBlog.reading_time = Math.ceil(newBlog.body.split(' ').length / 200);

    // Save the new blog post
    await newBlog.save();
    logger.info(`New blog post created: ${title} by user ID ${req.user._id}`);

    res.status(201).json(newBlog);
  } catch (error) {
    logger.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, body, tags, state } = req.body;

    // Find and update the blog post
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: id, author: req.user._id },
      { title, description, body, tags, state },
      { new: true }
    );

    if (!updatedBlog) {
      logger.warn(`Blog post update failed: Post ID ${id} not found or not owned by user ID ${req.user._id}`);
      return res.status(404).json({ error: 'Blog post not found or not owned by user' });
    }

    // Recalculate reading time if body is updated
    if (body) {
      updatedBlog.reading_time = Math.ceil(updatedBlog.body.split(' ').length / 200);
      await updatedBlog.save();
    }

    logger.info(`Blog post updated: ${title} by user ID ${req.user._id}`);
    res.json(updatedBlog);
  } catch (error) {
    logger.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the blog post
    const deletedBlog = await Blog.findOneAndDelete({
      _id: id,
      author: req.user._id,
    });

    if (!deletedBlog) {
      logger.warn(`Blog post delete failed: Post ID ${id} not found or not owned by user ID ${req.user._id}`);
      return res.status(404).json({ error: 'Blog post not found or not owned by user' });
    }

    logger.info(`Blog post deleted: ${deletedBlog.title} by user ID ${req.user._id}`);
    res.status(204).end();
  } catch (error) {
    logger.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPublishedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, author, title, tags } = req.query;

    const filter = { state: 'published' };

    // Apply filters
    if (author) {
      filter.author = author;
    }
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    // Calculate pagination skip and limit
    const skip = (page - 1) * limit;

    // Query for published blogs with filtering and pagination
    const blogs = await Blog.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });

    logger.info('Retrieved published blogs');
    res.json(blogs);
  } catch (error) {
    logger.error('Error fetching published blogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the blog post by ID
    const blog = await Blog.findById(id).populate('author', 'first_name last_name email');

    if (!blog || blog.state !== 'published') {
      logger.warn(`Blog not found or not published: Post ID ${id}`);
      return res.status(404).json({ error: 'Blog not found or not published' });
    }

    blog.read_count += 1;
    await blog.save();

    logger.info(`Retrieved blog post: ${blog.title} by user ID ${req.user ? req.user._id : 'guest'}`);
    res.json(blog);
  } catch (error) {
    logger.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, state } = req.query;

    const filter = { author: req.user._id };

    // Apply state filter
    if (state) {
      filter.state = state;
    }

    // Calculate pagination skip and limit
    const skip = (page - 1) * limit;

    // Query for the user's blogs with filtering and pagination
    const blogs = await Blog.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });

    logger.info(`Retrieved blogs for user ID ${req.user._id}`);
    res.json(blogs);
  } catch (error) {
    logger.error('Error fetching user blogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};