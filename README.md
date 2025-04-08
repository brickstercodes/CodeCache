# 📚 Snippet Library

A modern, AI-powered platform for managing and sharing code snippets and prompts. Perfect for developers who want to organize their code fragments and leverage AI assistance.

## ✨ Features

- 🔍 Smart search with AI-powered suggestions
- 💾 Store and organize code snippets
- 🤖 AI-assisted snippet descriptions and tagging
- 🌙 Dark/Light theme support
- 🔐 Secure upload system
- 📋 Easy copy-to-clipboard functionality

## 🛠️ Tech Stack

- **Frontend**: React + Vite with TypeScript
- **Backend**: Express.js + Python
- **Database**: Supabase
- **AI Integration**: Google Gemini API

## 🚀 Live Demo

[Visit Snippet Library](codecache.anugrahshetty.tech)

## 🏗️ Local Development Setup

### Prerequisites

- Node.js 16 or higher
- Python 3.8 or higher
- Supabase account
- Google AI API key (Gemini)

### Environment Configuration

1. **Backend** (Create `backend/.env`):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
GOOGLE_API_KEY=your_gemini_api_key
UPLOAD_PASSWORD=your_secure_password
PORT=4872
```

2. **Frontend** (Create `frontend/.env`):

```env
VITE_API_URL=http://localhost:4872
```

### Running Locally

1. **Set up backend:**

```bash
cd backend
npm install
pip install -r requirements.txt
node server.js
```

The backend will run on `http://localhost:4872`

2. **Set up frontend:**

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and will communicate with the backend on port 4872.

## 🌟 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

If you find this project helpful, please give it a ⭐️ on GitHub!

For issues, feature requests, or questions, please [open an issue](../../issues).

## 👥 Contributors

Soon...

---

Made with ❤️ by Anugrah Shetty
