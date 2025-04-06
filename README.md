# Snippet Library

A modern code snippet and prompt management system with AI-powered features.

## Project Structure

- `frontend/`: React/Vite frontend application
- `backend/`: Express.js and Python backend services

## Prerequisites

- Node.js 16+
- Python 3.8+
- Supabase account
- Google AI (for Gemini API)

## Environment Variables

### Backend (.env)

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
GOOGLE_API_KEY=your_gemini_api_key
UPLOAD_PASSWORD=your_secure_password
PORT=4872
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:4872
```

## Local Development

1. Install backend dependencies:

```bash
cd backend
npm install
pip install -r requirements.txt
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Start the backend:

```bash
cd backend
node server.js
```

4. Start the frontend:

```bash
cd frontend
npm run dev
```

## Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add environment variables in Render dashboard
5. The service will be available at `https://your-service-name.onrender.com`

### Frontend (Vercel)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set the following:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: dist
4. Add environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your Render backend URL
5. Deploy!

## Important Notes

1. Update CORS settings in `backend/server.js` with your Vercel domain
2. Ensure all environment variables are set in both Render and Vercel
3. The free tier of Render may have cold starts
4. Monitor your API usage for both Supabase and Google AI
