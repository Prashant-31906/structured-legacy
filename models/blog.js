const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    image: { type: String, required: true }, // Image URL
    excerpt: { type: String, required: true },
    content: { type: String, required: true }, // Rich text or HTML
    date: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);