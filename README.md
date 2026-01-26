# AI-Based Social Media Detoxification Application

An Android application that helps users track, analyze, and reduce social media addiction using native Android UsageStats, machine learning–driven insights, and behavioral detox challenges.

---

## Overview

This app monitors real-time social media usage on Android devices, processes behavioral patterns, and provides **personalized AI insights** to promote healthier digital habits.

Unlike basic screen-time apps, this project integrates:
- Native Android system APIs
- Full-stack backend services
- Machine learning inference
- Gamified habit-building mechanics

---

## Key Features

### Native Usage Tracking
- Uses **Android UsageStats API**
- Foreground app detection
- Per-app usage breakdown
- Session duration & app-switch tracking
- Night activity detection  
- Implemented via **custom Kotlin native module**

### AI Insights Engine
- Addiction score (0–100)
- User classification: *Light / Moderate / Heavy*
- Personalized recommendations
- Alternative activity suggestions
- Flask-based ML inference service

### Analytics Dashboard
- Daily social media usage
- Weekly usage visualization
- Behavioral metrics:
  - Screen time
  - Avg session duration
  - App switches
  - Night activity

### Detox Timer
- Focus sessions (preset & custom)
- Coin rewards
- Confetti animations
- Usage logging integration

### Detox Challenges
- Multi-level challenges (Beginner → Legendary)
- Background persistence
- Real-time progress tracking
- Reward-based motivation system

### User Management
- JWT authentication
- Secure login & registration
- Profile management
- Persistent sessions

---


## Tech Stack

### Mobile
- React Native
- Expo (Prebuild workflow)
- Custom Kotlin Native Modules
- Android UsageStats API

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT Authentication

### AI / ML
- Python
- Flask
- Scikit-learn
- Behavioral clustering & prediction

---


## Android Permissions

- `PACKAGE_USAGE_STATS` — App usage tracking
- `INTERNET` — API communication
- `SYSTEM_ALERT_WINDOW` — Overlay support (future use)

> ⚠️ Users must manually grant **Usage Access** in Android system settings.

---

## Local Setup

### Backend
```bash
cd backend
npm install
npm start
```

### AI Service
```bash
cd ml
pip install -r requirements.txt
python app.py
```

### Mobile App
```bash
cd mobile
npm install
npx expo run:android
```

---

## Production Build (EAS)

```bash
npx eas build -p android
```

---

## Testing

- Native module debugging via test screens
- Backend testing using `curl`
- AI insights validation via `/user/insights`
- Weekly stats derived from stored usage logs

---

## AI Model Inputs

The ML model consumes:
- Daily screen time
- Average session duration
- App switches
- Night activity

Metrics are sourced from:
- Android UsageStats (preferred)
- Server-side computation fallback

---

## Future Enhancements

- iOS support
- Push notifications
- Social accountability features
- Cloud deployment
- Enhanced AI personalization

---
