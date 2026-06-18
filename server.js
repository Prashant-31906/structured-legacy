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

// ================= STATIC SERVICES DATABASE (For Dynamic SEO & Pages) ================= //
const servicesDatabase = [
    {
        slug: 'succession-planning',
        title: 'Succession Planning',
        tagline: 'Ensuring Smooth Ownership and Leadership Transitions',
        heroDesc: 'Build a definitive roadmap to protect your empire\'s operational continuity across generations without disruptions.',
        bgImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1632&auto=format&fit=crop',
        problemTitle: 'What Happens Without A Succession Plan?',
        problemDesc1: 'Many businesses are built through decades of sweat and sacrifice. However, they face immense vulnerability when leadership transitions inevitably occur.',
        problemDesc2: 'Without a legally robust succession plan, families risk massive tax hits, leadership vacuums, stakeholder panic, and disputes that can dismantle an empire overnight.',
        failurePoints: [
            'Sudden leadership vacuum causing market panic.',
            'Lack of clear authority leading to operational paralysis.',
            'Key employees and stakeholders losing confidence.',
            'Intergenerational family disputes over control.'
        ],
        framework: [
            { icon: 'fa-file-contract', title: 'Ownership Transition', desc: 'Structuring legal entities to transfer shares efficiently while retaining voting control.' },
            { icon: 'fa-user-graduate', title: 'Leadership Frameworks', desc: 'Separating ownership from management. Grooming the next generation of leaders.' },
            { icon: 'fa-handshake', title: 'Stakeholder Alignment', desc: 'Ensuring minority shareholders and institutional investors are legally aligned.' }
        ],
        faqs: [
            { q: 'Why is succession planning critical for family businesses?', a: 'Without a structured succession plan, family businesses face severe risks including leadership vacuums and intergenerational disputes. It ensures operational continuity and preserves the founder\'s legacy.' },
            { q: 'When should a business owner start succession planning?', a: 'Succession planning should ideally begin 5 to 10 years before the anticipated transition. This allows ample time for leadership grooming, tax structuring, and family alignment.' },
            { q: 'Does succession planning only mean handing over to children?', a: 'No. Succession planning can involve selling to a key employee, bringing in professional management while retaining board control, or structuring an acquisition.' }
        ]
    },
    {
        slug: 'wealth-transfer-planning',
        title: 'Wealth Transfer Planning',
        tagline: 'Preserving Wealth Across Generations',
        heroDesc: 'Explore structured approaches that support efficient transfer of assets while maintaining absolute clarity, flexibility, and control.',
        bgImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop',
        problemTitle: 'The Cost of Unstructured Wealth Transfer',
        problemDesc1: 'Transferring wealth involves much more than simply handing over assets. Without a strategy, wealth transfer becomes complex, inefficient, and highly taxed.',
        problemDesc2: 'A lack of structural wealth transfer can trigger unnecessary legal fees, probate delays, and significant estate dilution, ultimately erasing decades of wealth accumulation.',
        failurePoints: [
            'Heavy tax burdens eroding the total estate value.',
            'Assets tied up in lengthy and public legal battles (probate).',
            'Loss of control over how and when beneficiaries receive assets.',
            'Unintended beneficiaries gaining access to family wealth.'
        ],
        framework: [
            { icon: 'fa-university', title: 'Trust Structuring', desc: 'Creating private family trusts to ring-fence assets and bypass public probate.' },
            { icon: 'fa-percent', title: 'Tax-Efficiency', desc: 'Minimizing transfer taxes through compliant restructuring and gifting strategies.' },
            { icon: 'fa-sliders-h', title: 'Controlled Distribution', desc: 'Setting clear mandates on how and when the next generation accesses capital.' }
        ],
        faqs: [
            { q: 'What is wealth transfer planning?', a: 'It is a comprehensive strategy used to pass accumulated wealth to the next generation in the most tax-efficient and legally secure manner possible.' },
            { q: 'How does a Family Trust help in wealth transfer?', a: 'A Family Trust protects assets from probate, provides strict control over asset distribution, and offers significant protection against creditors and family disputes.' },
            { q: 'Can I maintain control of my wealth after transferring it?', a: 'Yes. Through specific legal vehicles like Revocable Trusts or Holding Companies, you can transfer the economic value of assets while retaining operational and voting control.' }
        ]
    },
    {
        slug: 'business-continuity-planning',
        title: 'Business Continuity Planning',
        tagline: 'Protecting What You Have Built',
        heroDesc: 'Establish robust frameworks designed to support stability, continuity, and resilience against unexpected operational challenges.',
        bgImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop',
        problemTitle: 'Vulnerability to the Unexpected',
        problemDesc1: 'Unexpected events—whether a global crisis, sudden incapacitation of a key promoter, or economic shifts—can create massive operational challenges.',
        problemDesc2: 'If your business heavily relies on a single founder, a sudden absence can lead to frozen bank accounts, canceled credit lines, and complete business stagnation.',
        failurePoints: [
            'Frozen corporate assets due to lack of authorized signatories.',
            'Banks withdrawing credit lines citing "Key Man" risk.',
            'Competitors poaching clients during periods of instability.',
            'Immediate loss of market valuation and shareholder trust.'
        ],
        framework: [
            { icon: 'fa-shield-virus', title: 'Risk Management', desc: 'Identifying operational bottlenecks and establishing immediate contingency protocols.' },
            { icon: 'fa-key', title: 'Keyman Protection', desc: 'Securing high-value life covers on key executives to inject immediate liquidity.' },
            { icon: 'fa-file-signature', title: 'Legal Mandates', desc: 'Drafting clear Power of Attorney and emergency board transition documents.' }
        ],
        faqs: [
            { q: 'How does Business Continuity differ from Succession Planning?', a: 'Succession planning is a long-term strategy for retirement or exit. Business Continuity is an emergency response plan to keep the company running if a key leader is suddenly incapacitated.' },
            { q: 'What is Keyman Insurance?', a: 'It is a policy purchased by the company on the life of a crucial executive. The payout provides the company with liquidity to survive the financial shock of losing that key person.' },
            { q: 'Who needs a business continuity plan?', a: 'Any business where the revenue, operations, or credit lines are heavily dependent on one or a few key individuals.' }
        ]
    },
    {
        slug: 'estate-liquidity-planning',
        title: 'Estate Liquidity Planning',
        tagline: 'Creating Financial Readiness For Future Obligations',
        heroDesc: 'Ensure appropriate resources and immediate capital pools are available to handle taxes and buyouts without forced asset sales.',
        bgImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
        problemTitle: 'Asset Rich, Cash Poor',
        problemDesc1: 'Many high-net-worth families possess significant assets in real estate and private equity, but face massive cash flow challenges during wealth transfer.',
        problemDesc2: 'When a promoter passes away, the estate may owe heavy duties or require cash to buy out passive shareholders. Without liquid cash, the family is forced into "fire sales" of prime assets at a loss.',
        failurePoints: [
            'Selling prime real estate or equity at a massive discount (Fire Sale).',
            'Inability to pay immediate legal or statutory obligations.',
            'Taking on high-interest emergency debt to settle estate dues.',
            'Dilution of family ownership to raise quick capital.'
        ],
        framework: [
            { icon: 'fa-search-dollar', title: 'Liquidity Assessment', desc: 'Evaluating the current ratio of liquid to illiquid assets within the family portfolio.' },
            { icon: 'fa-piggy-bank', title: 'Funding Strategies', desc: 'Using structured life covers (up to ₹200 Cr) to instantly inject cash upon a triggering event.' },
            { icon: 'fa-balance-scale', title: 'Buy-Sell Agreements', desc: 'Funding legal agreements to ensure surviving partners can seamlessly buy out the deceased\'s heirs.' }
        ],
        faqs: [
            { q: 'What is Estate Liquidity?', a: 'It refers to the amount of cash or easily convertible assets available in an estate to pay immediate expenses, taxes, and debts upon the estate owner\'s death.' },
            { q: 'Why do wealthy families face liquidity problems?', a: 'Because their wealth is often locked in illiquid assets like private businesses, real estate, or restricted stock, which cannot be sold quickly without losing value.' },
            { q: 'How does life insurance solve estate liquidity?', a: 'A properly structured life insurance policy provides an immediate, tax-free cash payout exactly when it is needed, preventing the need to liquidate business assets.' }
        ]
    },
    {
        slug: 'family-governance',
        title: 'Family Governance',
        tagline: 'Strengthening Alignment Across Generations',
        heroDesc: 'Develop structures that support clear communication, decision-making, and long-term continuity to prevent intergenerational disputes.',
        bgImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop',
        problemTitle: 'The Threat of Internal Conflict',
        problemDesc1: 'As wealth and businesses grow across multiple generations, maintaining alignment becomes increasingly complex.',
        problemDesc2: 'Without a formal governance structure, differing opinions on dividends, business direction, and family employment can quickly escalate into devastating legal battles that destroy the family legacy.',
        failurePoints: [
            'Disputes between active working family members and passive shareholders.',
            'Lack of clear criteria for next-generation family members entering the business.',
            'Breakdown in communication leading to fractured family relationships.',
            'Decisions driven by emotion rather than corporate logic.'
        ],
        framework: [
            { icon: 'fa-scroll', title: 'Family Constitution', desc: 'Drafting a formal document outlining the family\'s core values, mission, and employment policies.' },
            { icon: 'fa-users-cog', title: 'Family Boards', desc: 'Establishing Family Councils to separate business decisions from family emotional dynamics.' },
            { icon: 'fa-comments', title: 'Conflict Resolution', desc: 'Creating structured, legal protocols to handle disputes before they escalate to litigation.' }
        ],
        faqs: [
            { q: 'What is a Family Constitution?', a: 'It is a formal, written document that sets out the rights, values, responsibilities, and rules applying to family members regarding their wealth and business.' },
            { q: 'How does Family Governance prevent disputes?', a: 'By setting clear rules in advance—such as how dividends are paid or how family members are hired—it removes ambiguity and emotional decision-making.' },
            { q: 'Is a Family Constitution legally binding?', a: 'While the constitution itself is a moral document, its principles are often embedded into legally binding Shareholders\' Agreements and Trust Deeds.' }
        ]
    },
    {
        slug: 'wealth-protection-strategies',
        title: 'Wealth Protection Strategies',
        tagline: 'Building Long-Term Financial Security',
        heroDesc: 'Evaluate and implement legally compliant strategies designed to strengthen your personal balance sheet and ring-fence assets from vulnerabilities.',
        bgImage: 'https://images.unsplash.com/photo-1497366754-0556ce78a4f1?q=80&w=2070&auto=format&fit=crop',
        problemTitle: 'Exposure to Business Risks',
        problemDesc1: 'Many entrepreneurs reinvest all their profits back into the business, leaving their personal balance sheets highly vulnerable to market downturns.',
        problemDesc2: 'If personal assets are not legally separated from corporate liabilities, a single business failure, lawsuit, or aggressive creditor can wipe out a family\'s entire net worth.',
        failurePoints: [
            'Personal assets being seized to settle corporate debts (lifting the corporate veil).',
            'Lack of diversified, protected wealth outside the primary business.',
            'Vulnerability to hostile litigation or aggressive audits.',
            'Erosion of capital due to poor tax structuring.'
        ],
        framework: [
            { icon: 'fa-layer-group', title: 'Asset Ring-Fencing', desc: 'Legally separating high-risk business operations from safe family assets via Holding structures.' },
            { icon: 'fa-chart-pie', title: 'Balance Sheet Strategy', desc: 'Systematically moving capital from the business into protected personal trust vehicles.' },
            { icon: 'fa-user-shield', title: 'Risk Transfer', desc: 'Utilizing specialized insurance and trust structures to shield wealth from external creditors.' }
        ],
        faqs: [
            { q: 'What does "ring-fencing" assets mean?', a: 'Ring-fencing is the legal process of protecting a portion of your wealth or assets from being affected by the financial risks or liabilities of your active business.' },
            { q: 'Why should I separate personal wealth from business capital?', a: 'To ensure that if the business faces a severe downturn or lawsuit, your family\'s core lifestyle, home, and savings remain completely untouched and secure.' },
            { q: 'Are wealth protection strategies legal?', a: 'Absolutely. When done correctly through compliant Trusts, Holding Companies, and proper corporate structuring, wealth protection is a standard and legal practice for HNIs.' }
        ]
    }
];

// ================= DYNAMIC ROUTE FOR SERVICE PAGES ================= //
app.get('/services/:slug', (req, res) => {
    const service = servicesDatabase.find(s => s.slug === req.params.slug);
    
    if (service) {
        // Dynamic Meta Title based on service
        res.render('service-detail', { 
            title: `${service.title} | Structured Legacy`,
            service: service 
        });
    } else {
        // If slug doesn't match, send to premium 404
        res.status(404).render('404', { title: 'Service Not Found | Structured Legacy' });
    }
});

app.get('/blogs/:slug', async (req, res) => {
    // ... fetching blog logic ...
    res.render('blog-single', { 
        blog: blogData,
        title: `${blogData.title} | Structured Legacy`,
        description: blogData.excerpt,
        ogImage: blogData.image,
        ogType: 'article',
        currentUrl: `https://www.structuredlegacy.com/blogs/${blogData.slug}`
    });
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

        // Perfect corporate styled HTML for Puppeteer to print
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${reportType}</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0a192f; background: #ffffff; padding: 40px; margin: 0; }
                h1 { color: #0d47a1; text-align: center; margin-bottom: 5px; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
                h3 { text-align: center; color: #475569; margin-top: 0; margin-bottom: 30px; font-weight: 400; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
                
                .summary-container { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
                .summary-box { text-align: center; width: 33%; }
                .border-box { border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; }
                .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold; }
                .val { font-size: 16px; color: #0f172a; font-weight: bold; margin-top: 5px; display: inline-block; }
                .val-returns { font-size: 16px; color: #16a34a; font-weight: bold; margin-top: 5px; display: inline-block; }
                .val-total { font-size: 20px; color: #0d47a1; font-weight: bold; margin-top: 5px; display: inline-block; }
                
                table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; margin-top: 20px; }
                th { background-color: #0a192f; color: white; padding: 12px; border: 1px solid #1e293b; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
                td { padding: 10px; border: 1px solid #e2e8f0; }
                
                .row-even { background-color: #f8fafc; }
                .row-odd { background-color: #ffffff; }
                .row-hold { background-color: #eef2ff; }
                .text-hold { color: #4338ca; font-weight: bold; text-transform: uppercase; font-size: 10px; }
                .text-invest { color: #16a34a; font-weight: bold; text-transform: uppercase; font-size: 10px; }
                .text-compound { color: #2563eb; font-weight: bold; text-transform: uppercase; font-size: 10px; }
                
                .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; }
                .disclaimer { font-size: 10px; color: #94a3b8; margin: 0; line-height: 1.5; text-align: justify; }
            </style>
        </head>
        <body>
            <h1>Structured Legacy</h1>
            <h3>${reportType}</h3>
            
            <div class="summary-container">
                <div class="summary-box">
                    <span class="label">Total Invested</span><br>
                    <span class="val">${invested}</span>
                </div>
                <div class="summary-box border-box">
                    <span class="label">Est. Returns</span><br>
                    <span class="val-returns">${returns}</span>
                </div>
                <div class="summary-box">
                    <span class="label" style="color: #0d47a1;">Total Wealth</span><br>
                    <span class="val-total">${total}</span>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Phase</th>
                        <th>Total Invested</th>
                        <th>Est. Returns</th>
                        <th>End Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((row, index) => {
                        const isHold = row.phaseStr === 'Hold';
                        const isCompound = row.phaseStr === 'Compound';
                        const rowClass = isHold ? 'row-hold' : (index % 2 === 0 ? 'row-even' : 'row-odd');
                        const phaseClass = isHold ? 'text-hold' : (isCompound ? 'text-compound' : 'text-invest');
                        
                        return `
                            <tr class="${rowClass}">
                                <td style="font-weight: bold;">Year ${row.year}</td>
                                <td class="${phaseClass}">${row.phaseStr}</td>
                                <td>${row.invested}</td>
                                <td style="color: #16a34a; font-weight: bold;">${row.returns}</td>
                                <td style="font-weight: bold; color: #0d47a1;">${row.total}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div class="footer">
                <p class="disclaimer"><strong>Disclaimer:</strong> The financial estimates and growth projections provided in this report are generated for educational and illustrative purposes only based on mathematical compounding equations. Actual investment performance fluctuates according to active market parameters and asset performance risk profiles.</p>
                <p style="font-size: 10px; color: #94a3b8; margin-top: 8px; font-weight: bold;">Generated securely via Structured Legacy Core Tool Engine | www.structuredlegacy.com</p>
            </div>
        </body>
        </html>
        `;

        // Launch Puppeteer headless browser
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        // Set the structured HTML content
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
        
        // Output clean A4 PDF profile binary
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0.4in', bottom: '0.4in', left: '0.4in', right: '0.4in' }
        });

        await browser.close();

        // Send PDF blob response back to front-end browser context
        res.contentType("application/pdf");
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Puppeteer Server PDF Error:", error);
        res.status(500).json({ error: "Failed to compile document" });
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