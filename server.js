const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

// ================= LOAD ENVIRONMENT VARIABLES ================= //
// Make sure you have a .env file with PORT=3000 and MONGO_URI=your_mongodb_string
dotenv.config();

// ================= DATABASE CONNECTION ================= //
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/structured_legacy');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};
connectDB();

// ================= IMPORT MODELS ================= //
const Testimonial = require('./models/Testimonial');
const Blog = require('./models/Blog');
const Contact = require('./models/Contact');

// ================= INITIALIZE EXPRESS ================= //
const app = express();

// ================= VIEW ENGINE SETUP ================= //
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ================= MIDDLEWARE ================= //
// Serving static files (CSS, Images, JS)
app.use(express.static(path.join(__dirname, 'public')));
// Parsing form data
app.use(express.urlencoded({ extended: true }));
// Parsing JSON data
app.use(express.json());

// ================= PAGE ROUTES (FRONTEND) ================= //

// 1. Home Page Route (Dynamic)
app.get('/', async (req, res) => {
    try {
        // Fetch latest 10 testimonials and 4 blogs to show on Home
        const testimonials = await Testimonial.find().sort({ createdAt: -1 }).limit(10);
        const blogs = await Blog.find().sort({ createdAt: -1 }).limit(4);

        res.render('index', { 
            title: 'Structured Legacy | Premium Financial Advisory',
            testimonials,
            blogs 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error while loading Home Page.");
    }
});

// 2. About Us Route
app.get('/about', (req, res) => {
    res.render('about', { title: 'About Us | Structured Legacy' });
});

// 3. Services Route
app.get('/services', (req, res) => {
    res.render('services', { title: 'Premium Solutions | Structured Legacy' });
});

// 4. Tools (Calculators) Route - (Phase 5 Placeholder)
app.get('/tools', (req, res) => {
    res.render('tools', { title: 'Financial Calculators | Structured Legacy' });
});

// 5. Blogs Main Page Route
app.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.render('blogs', { 
            title: 'Knowledge Hub & Insights | Structured Legacy',
            blogs 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error while loading Blogs.");
    }
});

// 6. Contact Us Route
app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us | Structured Legacy' });
});

// ================= API ROUTES (BACKEND LOGIC) ================= //

// Handle Testimonial Form Submission
app.post('/api/testimonials', async (req, res) => {
    try {
        const { name, designation, message } = req.body;
        
        // Basic validation
        if (!name || !designation || !message) {
            return res.status(400).send("All fields are required.");
        }

        // Save to Database
        await Testimonial.create({ name, designation, message });
        
        // Redirect back to home page (you can add a ?success=true query param if you want to show a toast)
        res.redirect('/'); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error saving testimonial. Please try again.");
    }
});

// Handle Contact Form Submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, email, service, message } = req.body;
        
        if (!name || !phone || !email || !message) {
            return res.status(400).send("Please fill out all required fields.");
        }

        // 1. Save to Database (Taki dashboard/records ke liye safe rahe)
        await Contact.create({ name, phone, email, service, message });

        // 2. Nodemailer Transporter Setup
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const serviceName = service ? service.replace('-', ' ').toUpperCase() : 'General Inquiry';

        // 3. Email 1: Notification to Admin (Tujhe jo aayega)
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Yahan tu apna email daal sakta hai jahan leads aani chahiye
            subject: `🔥 New Lead Alert: ${serviceName} - ${name}`,
            html: `
                <h3>New Consultation Request</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Service Requested:</strong> ${serviceName}</p>
                <p><strong>Message:</strong><br>${message}</p>
            `
        };

        // 4. Email 2: Auto-Reply to Customer (Premium HTML Template)
        const customerMailOptions = {
            from: `"Structured Legacy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Consultation Request Received - Structured Legacy',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #0d47a1; margin: 0; font-size: 28px; letter-spacing: -0.5px;">STRUCTURED<span style="color: #1a202c; font-weight: 300;">LEGACY</span></h1>
                        <p style="color: #64748b; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px;">Protecting Wealth. Preserving Legacy.</p>
                    </div>
                    
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                        <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Hello ${name},</h2>
                        <p style="color: #475569; line-height: 1.6; font-size: 15px;">Thank you for reaching out to Structured Legacy. We have successfully received your request regarding <strong>${serviceName}</strong>.</p>
                        
                        <p style="color: #475569; line-height: 1.6; font-size: 15px;">Our premium advisory board is currently reviewing your details. A senior partner will contact you shortly on <strong>${phone}</strong> to discuss your exact requirements and schedule a private consultation.</p>
                        
                        <div style="background-color: #f1f5f9; border-left: 4px solid #0d47a1; padding: 15px; margin: 25px 0;">
                            <p style="color: #334155; margin: 0; font-size: 14px; font-style: italic;">"Growth is temporary, but protection makes it permanent."</p>
                        </div>
                        
                        <p style="color: #475569; line-height: 1.6; font-size: 15px;">If you have any urgent queries, please feel free to reply directly to this email.</p>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
                        <p style="margin-bottom: 5px;">&copy; 2026 Structured Legacy. All Rights Reserved.</p>
                        <p>123 Corporate Park, Business Avenue, New Delhi, India</p>
                    </div>
                </div>
            `
        };

        // Send both emails asynchronously
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(customerMailOptions)
        ]);
        
        // Redirect back with success flag
        res.redirect('/contact?success=true'); 
        
    } catch (error) {
        console.error("Contact Form / Email Error:", error);
        res.status(500).send("Error submitting form. Please try again.");
    }
});

// Generate & Download PDF using Puppeteer
app.post('/api/download-pdf', async (req, res) => {
    try {
        const { reportType, invested, returns, total, rows } = req.body;
        const date = new Date().toLocaleDateString('en-IN');

        // Create a Clean HTML Template for the PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
                    .header { border-bottom: 2px solid #0d47a1; padding-bottom: 10px; margin-bottom: 20px; }
                    .header h1 { color: #0d47a1; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; }
                    .header p { color: #666; margin: 5px 0 0 0; font-size: 14px; }
                    .summary { display: flex; justify-content: space-between; background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #dbeafe; }
                    .summary div { text-align: center; width: 30%; }
                    .summary span { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }
                    .summary h3 { font-size: 18px; margin: 8px 0 0 0; color: #0f172a; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #f8fafc; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
                    td { padding: 12px; font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 10px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Structured Legacy</h1>
                    <p style="float: right;">Date: ${date}</p>
                    <p>${reportType}</p>
                </div>
                
                <div class="summary">
                    <div><span>Total Invested</span><h3>${invested}</h3></div>
                    <div><span>Est. Returns</span><h3 style="color: #16a34a;">${returns}</h3></div>
                    <div><span>Total Wealth</span><h3 style="color: #0d47a1;">${total}</h3></div>
                </div>

                <table>
                    <thead>
                        <tr><th>Year</th><th>Total Invested</th><th>Est. Returns</th><th>End Value</th></tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>
                                <td><b>${row.year}</b></td>
                                <td>${row.invested}</td>
                                <td style="color: #16a34a;">${row.returns}</td>
                                <td style="color: #0d47a1; font-weight: bold;">${row.total}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>Disclaimer: Mutual Fund investments are subject to market risks. Calculations are illustrative and do not represent actual returns.</p>
                    <p><strong>www.structuredlegacy.com</strong></p>
                </div>
            </body>
            </html>
        `;

        // Launch Puppeteer (Headless Browser)
        const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Generate PDF Buffer
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            printBackground: true,
            margin: { top: '20px', bottom: '20px' }
        });
        
        await browser.close();

        // Send PDF back to frontend
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Structured_Legacy_${reportType.split(' ')[0]}_Report.pdf"`
        });
        res.end(pdfBuffer);

    } catch (error) {
        console.error("Puppeteer PDF Error:", error);
        res.status(500).send("Error generating PDF");
    }
});

// ================= BLOGS & ADMIN ROUTES ================= //

// 1. GET: Admin Page to Add Blog
app.get('/admin/add-blog', (req, res) => {
    res.render('add-blog', { title: 'Add New Blog | Admin Dashboard' });
});

// 2. POST: Process Admin Form and Save to DB
app.post('/admin/add-blog', async (req, res) => {
    try {
        const { title, category, image, excerpt, content } = req.body;
        
        // Auto-generate URL friendly slug from Title (e.g., "My Post" -> "my-post")
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        // Auto-generate formatted date (e.g., "Jun 04, 2026")
        const dateOptions = { month: 'short', day: '2-digit', year: 'numeric' };
        const date = new Date().toLocaleDateString('en-US', dateOptions);

        // Save to Database
        await Blog.create({ title, slug, category, image, excerpt, content, date });
        
        // Redirect to main blogs page after successful posting
        res.redirect('/blogs');
    } catch (error) {
        console.error("Error adding blog:", error);
        res.status(500).send("Server Error while publishing blog.");
    }
});

// 3. GET: Single Blog Reading Page (Dynamic Routing using Slug)
app.get('/blogs/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        
        if (!blog) {
            return res.status(404).render('404', { title: 'Blog Not Found' });
        }

        res.render('blog-single', { 
            title: `${blog.title} | Structured Legacy`, 
            blog 
        });
    } catch (error) {
        console.error("Error fetching single blog:", error);
        res.status(500).send("Server Error");
    }
});

// ================= 404 ERROR HANDLER ================= //
// Catch-all route for undefined URLs
app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Page Not Found | Structured Legacy' });
});

// ================= START SERVER ================= //
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running like a beast on http://localhost:${PORT}`);
});