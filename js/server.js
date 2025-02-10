const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Google Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Add debugging configuration
const DEBUG = process.env.DEBUG || true;

function debugLog(...args) {
    if (DEBUG) {
        console.log('[DEBUG]', ...args);
    }
}

// Read and process URLs from file_urls.txt
function processUrls() {
    try {
        const filePath = path.join(__dirname, '..', 'file_urls.txt');
        const content = fs.readFileSync(filePath, 'utf8');
        const urls = content.split('\n').filter(url => url.trim());

        // Organize URLs by category
        const urlsByCategory = {};

        urls.forEach(url => {
            if (!url) return;
            
            const parts = url.split('/');
            // Find the course part (e.g., phy103, phy161)
            const coursePart = parts.find(p => /phy\d+/.test(p.toLowerCase())) || 'general';
            // Get the category (parent folder name)
            const category = parts[parts.length - 2]?.toLowerCase() || 'misc';
            // Get the filename
            const fileName = parts[parts.length - 1];
            const fileType = path.extname(fileName).toLowerCase();
            
            // Create course if it doesn't exist
            if (!urlsByCategory[coursePart]) {
                urlsByCategory[coursePart] = {};
            }
            
            // Create category if it doesn't exist
            if (!urlsByCategory[coursePart][category]) {
                urlsByCategory[coursePart][category] = [];
            }
            
            // Add the URL with metadata
            urlsByCategory[coursePart][category].push({
                url: url.trim(),
                fileName,
                fileType,
                category,
                course: coursePart,
                isImage: ['.jpg', '.jpeg', '.png', '.gif', '.JPG', '.PNG', '.GIF'].includes(fileType),
                isPdf: ['.pdf', '.PDF'].includes(fileType)
            });
        });

        return urlsByCategory;
    } catch (error) {
        console.error('Error reading file_urls.txt:', error);
        return {};
    }
}

const urlDatabase = processUrls();

// Function to clean and validate URLs
function cleanUrl(url) {
    if (!url) return '';
    
    // Remove parentheses from start and end
    url = url.replace(/^[\(\[]+/, '').replace(/[\)\]]+$/, '');
    
    // Remove other trailing characters that aren't part of a valid URL
    url = url.replace(/[\),\]\}>\s]+$/, '');
    
    // Ensure it starts with http/https
    if (!url.startsWith('http')) {
        return '';
    }
    
    return url.trim();
}

// Function to encode URLs properly
function encodeURL(url) {
    // Split the URL into parts (before and after the filename)
    const parts = url.split('/');
    const filename = parts.pop(); // Get the last part (filename)
    const basePath = parts.join('/'); // Rejoin the rest
    
    // Encode the filename part only
    const encodedFilename = encodeURIComponent(filename);
    
    // Return the full encoded URL
    return `${basePath}/${encodedFilename}`;
}

// Function to get relevant URLs based on query
function getRelevantUrls(query) {
    try {
        // Read URLs from file
        const urlsContent = fs.readFileSync('file_urls.txt', 'utf8');
        const allUrls = urlsContent.split('\n')
            .map(url => url.trim())
            .filter(url => url && url.startsWith('https://'));

        // Convert query to lowercase for case-insensitive matching
        const queryLower = query.toLowerCase();

        // Define course-specific patterns
        const coursePatterns = {
            'phy103': ['phy103', 'physics 103', 'physics103'],
            'phy104': ['phy104', 'physics 104', 'physics104'],
            'phy161': ['phy161', 'physics 161', 'physics161'],
            'phy244': ['phy244', 'physics 244', 'physics244'],
            'phy246': ['phy246', 'physics 246', 'physics246'],
            'phy261': ['phy261', 'physics 261', 'physics261'],
            'phy263': ['phy263', 'physics 263', 'physics263'],
            'phy311': ['phy311', 'physics 311', 'physics311'],
            'phy312': ['phy312', 'physics 312', 'physics312']
        };

        // Define experiment and equipment patterns
        const experimentPatterns = [
            'archimedes', 'collision', 'momentum', 'energy', 'force',
            'motion', 'pendulum', 'wave', 'sound', 'electric', 'circuit',
            'optics', 'newton', 'vector', 'free fall', 'freefall',
            'capacitor', 'kirchhoff', 'magnetic', 'induction', 'heat',
            'atomic', 'spectra', 'radiation', 'malus', 'labview',
            'multisim', 'black body', 'interference', 'diffraction'
        ];

        // Check if query matches any course
        const matchedCourse = Object.entries(coursePatterns)
            .find(([_, patterns]) => 
                patterns.some(pattern => queryLower.includes(pattern))
            );

        // Filter URLs based on course and experiment patterns
        const matchingUrls = allUrls.filter(url => {
            const urlLower = url.toLowerCase();
            
            // If a specific course was mentioned, prioritize those URLs
            if (matchedCourse && !urlLower.includes(matchedCourse[0])) {
                return false;
            }

            // Check for experiment/equipment keywords
            return experimentPatterns.some(pattern => 
                queryLower.includes(pattern) && urlLower.includes(pattern)
            ) || experimentPatterns.some(pattern => urlLower.includes(pattern));
        });

        // Categorize and format URLs
        return matchingUrls.map(url => {
            const filename = url.split('/').pop();
            if (/\.(jpg|jpeg|png|gif|JPG|PNG|GIF)$/i.test(url)) {
                return `🖼️ [${filename}]${url}`;
            } else if (/\.(pdf|PDF)$/i.test(url)) {
                return `📄 [${filename}]${url}`;
            }
            return url;
        });
    } catch (error) {
        console.error('Error reading URLs file:', error);
        return [];
    }
}

// System prompt template
const baseSystemPrompt = `You are a helpful assistant for the Physics Lab at GMU. You help students find information about lab equipment, experiments, and course materials.

For general greetings like "hi", "hello", "how are you", respond warmly and ask how you can help with physics lab information. For example:
"Hello! I'm your GMU Physics Lab Assistant. I can help you find information about lab equipment, experiments, and course materials. What would you like to know about?"

When answering questions:
1. ONLY use URLs that are provided to you in the "Relevant resources" section
2. NEVER make up or modify URLs
3. Format URLs exactly as provided:
   - Images: 🖼️ [filename]url
   - PDFs: 📄 [filename]url
4. If no relevant URLs are found, suggest topics the user can ask about:
   "I don't have specific information about that. You can ask me about:
   - PHY 103 experiments (Archimedes, Free Fall, Energy Conservation)
   - PHY 104 experiments (Electric Circuits, Sound, Optics)
   - PHY 161 experiments (Vectors, Newton's Laws, Momentum)
   - PHY 244/246 experiments
   - PHY 261 experiments (DC Circuits, Kirchhoff's Laws, Capacitors, Magnetic Induction)
   - PHY 263 experiments (Optics, Heat Engine, Atomic Spectra, Wave Optics)
   - PHY 311/312 experiments (LabView, MultiSim, Black Body Radiation, Malus's Law)
   - Lab equipment and demonstrations
   - Course materials and manuals"

Example response with resources:
"Here's what I found about the Archimedes experiment:
🖼️ [Archimedes-1.jpg]https://raw.githubusercontent.com/physicslabgmu/Lab_db/main/phy103/Archimedes/Archimedes-1.jpg
📄 [Archimedes Principle 2016.pdf]https://raw.githubusercontent.com/physicslabgmu/Lab_db/main/phy103/Archimedes%20Principle%202016.pdf"`;

// CORS and middleware configuration
app.use(cors({
    origin: [
        'https://physicslabgmu.github.io',
        'http://localhost:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://your-app-name.onrender.com'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());

// Chat configuration
const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
};

// Update the chat endpoint to handle history and URLs properly
app.post('/api/chat', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        const history = req.body.history || [];

        // Get relevant URLs based on the query
        const relevantUrls = getRelevantUrls(userPrompt);
        
        // Create chat context from history and URLs
        let contextPrompt = '';
        if (history.length > 0) {
            contextPrompt = 'Previous conversation:\n' + 
                history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n') +
                '\n\nCurrent question:\n';
        }

        // Add URLs to system prompt if relevant
        const systemPromptWithUrls = relevantUrls.length > 0 ? 
            `${baseSystemPrompt}\n\nRelevant resources:\n${relevantUrls.join('\n')}` :
            baseSystemPrompt;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent([
            systemPromptWithUrls,
            contextPrompt + userPrompt
        ]);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Error handlers
app.use((err, req, res, next) => {
    debugLog('Global error handler:', err);
    res.status(500).json({ error: "Internal server error", details: err.message });
});

process.on('unhandledRejection', (reason, promise) => {
    debugLog('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('URL Database loaded with:');
    console.log(Object.keys(urlDatabase).map(course => 
        `${course}: ${Object.keys(urlDatabase[course]).length} categories`
    ));
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\x1b[31mPort ${port} is already in use. Solutions:\n1. Close existing server instances\n2. Run: npx kill-port 3000\n3. Use different port via: PORT=3001 node server.js\x1b[0m`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});
