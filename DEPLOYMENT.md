# Deployment Guide for GMU Physics Lab Website

## Prerequisites
1. Node.js installed on the deployment server
2. A Gemini API key
3. Git installed (for version control)

## Files to Deploy
Ensure all these files are included in your deployment:
- `index.html`
- `mainpage.html`
- `js/` directory
  - `server.js`
  - `main.js`
  - `chatbot-widget.js`
- `file_urls.txt`
- `.env` (with your API key)
- `package.json`
- Other static assets (images, CSS, etc.)

## Environment Setup
1. Create a `.env` file with:
```
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

## Deployment Steps

### 1. Local Testing
```bash
# Install dependencies
npm install

# Start the server
node js/server.js
```

### 2. Deployment to Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `npm install`
   - Start Command: `node js/server.js`
   - Environment Variables:
     - Add `GEMINI_API_KEY`
     - Add `PORT`

4. Update API endpoint in chatbot-widget.js:
   Change:
   ```javascript
   fetch('http://localhost:3000/api/chat'
   ```
   To:
   ```javascript
   fetch('https://your-render-url.onrender.com/api/chat'
   ```

### 3. Post-Deployment Checks
1. Test the chatbot on all pages
2. Verify all URLs are working
3. Check mobile responsiveness
4. Test file downloads
5. Verify API responses

## Troubleshooting
1. If the chatbot doesn't load:
   - Check browser console for errors
   - Verify API endpoint URL
   - Check if server is running

2. If URLs are not working:
   - Verify file_urls.txt paths
   - Check URL encoding
   - Verify CORS settings

3. If server won't start:
   - Check port availability
   - Verify environment variables
   - Check log files

## Maintenance
1. Regularly update file_urls.txt with new resources
2. Monitor server logs for errors
3. Keep dependencies updated
4. Backup data regularly

## Support
For issues or questions, contact:
[Your Contact Information]
