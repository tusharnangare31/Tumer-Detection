# NeuroGenAI — Brain Tumor Detection System

AI-powered brain tumor detection and clinical decision support system built with Django REST Framework and React.

## 🧠 Overview

NeuroGenAI uses a Convolutional Neural Network (CNN) to analyze MRI brain scans and classify tumors into four categories:
- **Glioma**
- **Meningioma**
- **Pituitary Tumor**
- **No Tumor**

The system integrates **Google Gemini AI** for clinical reasoning and treatment protocol recommendations, and generates professional PDF diagnostic reports.

## 🏗️ Architecture

```
┌─────────────────────┐     ┌──────────────────────────────┐
│   React Frontend    │────▶│    Django REST Backend        │
│   (Vite + TailwindCSS)   │     │                              │
└─────────────────────┘     │  ┌────────────┐  ┌──────────┐│
                            │  │ CNN Model   │  │ Gemini AI ││
                            │  │ (TensorFlow)│  │ (Clinical)││
                            │  └────────────┘  └──────────┘│
                            │  ┌────────────┐  ┌──────────┐│
                            │  │ Cloudinary  │  │ xhtml2pdf││
                            │  │ (Storage)   │  │ (Reports)││
                            │  └────────────┘  └──────────┘│
                            └──────────────────────────────┘
```

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Technician** | Register patients, upload MRI scans, view AI predictions, manage scan history |
| **Doctor** | View all patients & scans, access clinical reasoning, download PDF reports, verify diagnoses |
| **Public** | Try the detection tool (sandbox mode), view model info, dataset details |

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm 9+

### Backend Setup

```bash
cd DBackend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API calls to `http://localhost:8000`.

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Debug mode (True/False) |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CLOUD_NAME` | Cloudinary cloud name |
| `API_KEY` | Cloudinary API key |
| `API_SECRET` | Cloudinary API secret |

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| Accuracy | 93.5% |
| Precision | 92.8% |
| Recall | 91.2% |
| F1 Score | 92.0% |

**Dataset**: 7,023 MRI images across 4 classes, trained on 128×128 grayscale images.

## 🛠️ Tech Stack

### Backend
- Django 6.0 + Django REST Framework
- SimpleJWT Authentication
- TensorFlow/Keras (CNN Model)
- Google Gemini AI (Clinical Reasoning)
- Cloudinary (Image Storage)
- xhtml2pdf (PDF Reports)

### Frontend
- React 19 + Vite 7
- Tailwind CSS 4
- Framer Motion (Animations)
- Chart.js (Data Visualization)
- Axios (HTTP Client)
- Lucide React (Icons)

## 👨‍💻 Team

- **Kalpesh Patil** — Project Lead
- **Tushar Nangare** — Team Member
- **Sarvesh Namra** — Team Member
- **Neha Patil** — Team Member
- **Digvijay Patil** — Project Guide (Dept of IT)

## 📄 License

This project is part of an academic submission at Progressive Education Society's Modern College of Engineering, Pune.
