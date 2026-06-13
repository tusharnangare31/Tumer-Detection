# NeuroGenAI Frontend

React-based frontend for the Brain Tumor Detection system.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Environment Variables

Create a `.env` file in the Frontend root:

```env
VITE_API_URL=http://127.0.0.1:8000
```

For production, set this to your deployed backend URL.

## Project Structure

```
src/
├── assets/          # Static images and SVGs
├── components/      # Reusable UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ProtectedRoute.jsx
│   ├── ResultCard.jsx
│   ├── UploadSection.jsx
│   └── DetectionHistory.jsx
├── pages/           # Route pages
│   ├── Home.jsx
│   ├── Upload.jsx
│   ├── Detection.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── MyPatients.jsx
│   ├── CreatePatient.jsx
│   ├── PatientDetail.jsx
│   ├── MyScans.jsx
│   ├── DoctorDashboard.jsx
│   ├── DoctorPatients.jsx
│   ├── DoctorPatientDetail.jsx
│   ├── DoctorScans.jsx
│   ├── Dataset.jsx
│   ├── Model.jsx
│   ├── Results.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   └── NotFound.jsx
├── services/        # API client
│   └── api.js
├── App.jsx          # Root component with routing
├── main.jsx         # Entry point
└── index.css        # Global styles (Tailwind)
```

## API Integration

All API calls go through the centralized `services/api.js` module which:
- Automatically attaches JWT tokens to requests
- Handles token refresh on 401 responses
- Uses environment-based API URL configuration
- Provides typed API methods grouped by feature
