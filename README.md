# ![HALCYON](HALCYON-Frontend/bird.png) HALCYON

A full-stack e-commerce web application with a React frontend and Node.js/Express backend.

## Project Structure

```
HALCYON/
├── HALCYON-Frontend/          # Frontend application
│   ├── client/                 # React + Vite application
│   │   ├── src/
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── context/        # React Context (Auth, Cart)
│   │   │   ├── pages/         # Page components
│   │   │   └── services/      # API services
│   │   └── package.json
│   ├── admin/                  # Admin dashboard (HTML/JS)
│   ├── *.html                  # Static HTML pages
│   └── styles.css             # Global styles
│
└── HALCYON-Backend/            # Backend API server
    ├── server.js              # Express server entry point
    └── package.json
```

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MySQL
- JSON Web Token (JWT)
- CORS
- Body Parser

## Getting Started

### Prerequisites
- Node.js
- MySQL

### Backend Setup

```bash
cd HALCYON-Backend
npm install
```

Configure your MySQL database connection in `server.js`, then:

```bash
npm start
```

Server runs on http://localhost:3000

### Frontend Setup

```bash
cd HALCYON-Frontend/client
npm install
npm run dev
```

Frontend runs on http://localhost:5173 (default Vite port)

## Features

- User authentication (login/register)
- Shopping cart functionality
- Product browsing
- Admin dashboard
- Blog system
- Customer support
- Order checkout
- Exchange & return requests

