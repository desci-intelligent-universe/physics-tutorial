# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│                    (React + Three.js)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Simulations │  │   Controls   │  │    AI Assistant      │  │
│  │  (Three.js)  │  │   (Leva)     │  │    (Chat UI)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend                                  │
│                     (Rust + Axum)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Simulations  │  │     AI       │  │      Progress        │  │
│  │    API       │  │   Service    │  │      Service         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL  │  │   OpenAI     │  │      Redis           │  │
│  │  (Storage)   │  │   (LLM)      │  │     (Cache)          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
physics-tutorial/
├── backend/                    # Rust API server
│   ├── src/
│   │   ├── main.rs            # Entry point, router setup
│   │   ├── routes/            # API endpoints
│   │   │   ├── mod.rs
│   │   │   ├── simulations.rs # Simulation endpoints
│   │   │   ├── ai.rs          # AI assistant endpoints
│   │   │   └── progress.rs    # User progress endpoints
│   │   ├── models/            # Data structures
│   │   └── services/          # Business logic
│   ├── Cargo.toml
│   └── Dockerfile
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # Main application
│   │   ├── components/        # Reusable UI components
│   │   │   ├── SimulationControls.tsx
│   │   │   └── AIAssistant.tsx
│   │   ├── simulations/       # 3D simulation components
│   │   │   └── DoubleSlit.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md        # This file
│   ├── API.md                 # API documentation
│   └── SIMULATIONS.md         # Physics simulations guide
│
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI
│
├── docker-compose.yml          # Local development setup
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

## API Endpoints

### Simulations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/simulations` | List all simulations |
| GET | `/api/v1/simulations/:id` | Get simulation details |
| POST | `/api/v1/simulations/:id/run` | Run simulation with parameters |

### AI Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/ask` | Ask a physics question |

### User Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/progress` | Get user progress |
| POST | `/api/v1/progress` | Save progress |

## Data Flow

### Simulation Flow
```
User adjusts parameter → React state updates → Three.js re-renders
                                            ↓
                                      Optional: API call
                                            ↓
                               Backend calculates physics
                                            ↓
                                    Returns results
```

### AI Assistant Flow
```
User asks question → Frontend sends POST /api/v1/ai/ask
                              ↓
                    Backend processes question
                              ↓
                    Returns answer + suggestions
                              ↓
                    Frontend displays response
```

## Technology Choices

### Backend (Rust + Axum)
- **Why Rust?** Performance for physics calculations, memory safety
- **Why Axum?** Modern, async-first, great developer experience
- **Why SQLx?** Compile-time checked SQL queries

### Frontend (React + Three.js)
- **Why React?** Component-based, large ecosystem
- **Why Three.js?** Industry standard for 3D web graphics
- **Why Tailwind?** Rapid UI development

## Scaling Considerations

### Current (MVP)
- Single server deployment
- In-memory caching
- SQLite/PostgreSQL for persistence

### Future
- Kubernetes deployment
- Redis for caching
- CDN for static assets
- WebSocket for real-time collaboration
