# 🚀 Novus Trend

> **"Stop Searching. Start Trending."**

A Trend Intelligence & Action Platform that democratizes content creation by aggregating social media trends, providing AI-powered context, and enabling one-click content generation.

![Custom Dark Theme](https://img.shields.io/badge/Theme-Cyan%20%7C%20Coral%20%7C%20Black-00c2ff)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933)
![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini-4285F4)

## ✨ Features

### 🔥 Multi-Platform Trend Aggregation
- **Twitter/X Trends**: Real-time trending topics via RapidAPI
- **AI Categorization**: Automatic sorting into Tech, Politics, Entertainment, Sports, Business
- **Trend Intelligence**: Volume tracking, trending direction, and category filtering

### 🤖 AI-Powered Content Generation
- **Smart Suggestions**: Gemini AI generates tweet drafts based on selected trends
- **AI Chatbot Assistant**: Conversational AI to brainstorm ideas and strategies
- **Image Captions**: Upload images and auto-generate engaging captions
- **Context-Aware**: AI analyzes trending topics to create relevant, engaging content

### 📝 Content Composer
- **Multi-Platform Posting**: Post to Twitter/X and LinkedIn
- **Media Upload**: Attach images/videos to posts
- **Schedule Posts**: Plan content for optimal posting times
- **Hashtag Management**: AI-suggested hashtags with easy selection

### 📊 Content Dashboard
- **Analytics Charts**: Visualize engagement trends with interactive charts
- **Posted Content**: Track your published tweets and LinkedIn posts
- **Scheduled Queue**: Manage upcoming posts
- **Engagement Tracking**: Monitor likes, retweets, and replies
- **Multi-Account Support**: Switch between Twitter and LinkedIn accounts

## 🎨 Custom Dark Theme
Stunning dark mode with a carefully crafted color palette:
- **Query Cyan** (`#00c2ff`) - Primary actions
- **Answer Coral** (`#ff6f59`) - Alerts & warnings
- **Source Yellow** (`#f9c74f`) - Secondary accents
- **Dark Mode Black** (`#121212`) - Backgrounds
- **Insight White** (`#fafafa`) - Text

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Recharts** - Data visualization
- **Custom CSS** - Responsive dark theme

### Backend
- **Node.js & Express** - REST API server
- **Twitter API v2** - OAuth 2.0 & tweet posting
- **LinkedIn API** - OAuth 2.0 & posting
- **Google Gemini AI** - Content generation & Chatbot
- **node-cron** - Tweet scheduling
- **RapidAPI** - Trend data aggregation

## 📦 Installation

### Prerequisites
- Node.js 20.x or higher
- Twitter Developer Account (API v2 credentials)
- LinkedIn Developer App (Client ID & Secret)
- Google AI Studio API Key (Gemini)
- RapidAPI Key (Twitter Trends API)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/novus-trend.git
cd novus-trend
```

### 2. Backend Setup
```bash
cd server
npm install

# Create .env file
cat > .env << EOF
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_CALLBACK_URL=http://localhost:3000/auth/callback
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:3000/auth/linkedin/callback
GEMINI_API_KEY=your_gemini_api_key
RAPIDAPI_KEY=your_rapidapi_key
PORT=4000
EOF

# Start backend server
npm start
```

### 3. Frontend Setup
```bash
cd ..
npm install

# Start React dev server
npm start
```

The app will open at `http://localhost:3000`

## 🔑 API Keys Setup

### Twitter Developer Portal
1. Go to [Twitter Developer Portal](https://developer.x.com/en/portal/dashboard)
2. Create a new app with OAuth 2.0
3. Add callback URL: `http://localhost:3000/auth/callback`
4. Required scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`, `tweet.moderate.write`
5. Copy Client ID and Client Secret

### LinkedIn Developer Portal
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add callback URL: `http://localhost:3000/auth/linkedin/callback`
4. Request `w_member_social`, `r_liteprofile`, `r_emailaddress` permissions
5. Copy Client ID and Client Secret

### Google AI Studio
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key for Gemini API access

### RapidAPI (Twitter Trends)
1. Subscribe to [Twitter Trends API](https://rapidapi.com/apidojo/api/twitter-trends-api)
2. Copy your RapidAPI key from the dashboard

## 🚀 Usage

### 1. Login
Connect your Twitter and LinkedIn accounts via the Settings page or Composer.

### 2. Discover Trends
Browse trending topics categorized by:
- Technology
- Politics
- Entertainment
- Sports
- Business

### 3. Create Content
- Click a trending topic to select it
- AI generates suggested hashtags and content
- Upload images for AI-powered captions
- Customize your post
- **AI Chatbot**: Ask the assistant for ideas or strategies

### 4. Post or Schedule
- **Post Now**: Immediately publish to Twitter or LinkedIn
- **Schedule**: Set a future date/time for automatic posting

## 📁 Project Structure
```
novus-trend/
├── server/                 # Backend (Node.js/Express)
│   ├── routes/
│   │   ├── auth.js        # Twitter OAuth 2.0
│   │   ├── linkedin.js    # LinkedIn OAuth & Posting
│   │   ├── chat.js        # AI Chatbot
│   │   └── tweets.js      # Tweet operations & trends
│   ├── utils/
│   │   └── gemini.js      # AI content generation
│   ├── data/
│   │   └── scheduled.json # Scheduled tweets storage
│   └── server.js          # Express app entry
│
├── src/                   # Frontend (React)
│   ├── components/
│   │   ├── Dashboard.js   # Main app layout
│   │   ├── Navbar.js      # Top navigation
│   │   ├── TrendingPanel.js    # Trends display
│   │   ├── ComposerPanel.js    # Multi-platform composer
│   │   ├── ChatbotPanel.js     # AI Assistant
│   │   ├── AnalyticsPanel.js   # Charts & Stats
│   │   ├── ActivityPage.js     # Posted/Scheduled view
│   │   └── OAuthCallback.js    # OAuth handler
│   ├── App.js
│   └── index.js
│
└── README.md
```

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Twitter OAuth 2.0 integration
- [x] Real-time trend fetching
- [x] AI content generation
- [x] Media upload support
- [x] Tweet scheduling
- [x] Custom dark theme

### Phase 2: Intelligence & Expansion ✅
- [x] LinkedIn Integration
- [x] AI Chatbot Assistant
- [x] Analytics Dashboard with Charts
- [ ] Smart Context: AI explains *why* topics are trending
- [ ] Multi-source trends (Google, YouTube, TikTok)

### Phase 3: Growth
- [ ] Advanced Analytics (Historical data)
- [ ] A/B testing for posts
- [ ] Competitor analysis
- [ ] Auto-posting based on optimal times

## 🐛 Known Issues
- RapidAPI rate limits may cause fallback to mock trends
- Media upload requires re-authentication after scope changes

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a PR.

## 📄 License
MIT License - see LICENSE file for details

## 👥 Authors
Built with ❤️ for novice content creators

---

**Made with Google Gemini AI & Twitter API v2**
