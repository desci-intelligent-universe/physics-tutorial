# 🔬 DIU Physics Tutorial

**Interactive Quantum Physics Learning Platform**

[![CI](https://github.com/desci-intelligent-universe/physics-tutorial/actions/workflows/ci.yml/badge.svg)](https://github.com/desci-intelligent-universe/physics-tutorial/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Part of the [DeSci Intelligent Universe](https://github.com/desci-intelligent-universe) project

## 🎯 Overview

An interactive web application for learning quantum physics through real-time 3D simulations and AI-assisted explanations. This is the MVP (Minimum Viable Product) for the DIU platform.

### Features

- **🌊 Double-Slit Experiment** - Visualize wave-particle duality and quantum interference
- **🚀 Quantum Tunneling** - Explore probability and barrier penetration
- **⚛️ Hydrogen Atom** - Interactive 3D orbital visualization
- **🤖 AI Assistant** - Get contextual explanations and answers to "what if" questions
- **📊 Progress Tracking** - Save your learning journey
- **🎓 NFT Certificates** - Blockchain-verified achievements (optional)

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.75+
- [Docker](https://docs.docker.com/get-docker/) (optional, for database)

### Installation

```bash
# Clone the repository
git clone https://github.com/desci-intelligent-universe/physics-tutorial.git
cd physics-tutorial

# Start backend
cd backend
cargo run

# In another terminal, start frontend
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
physics-tutorial/
├── backend/                 # Rust API server (Axum)
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Data structures
│   │   └── services/       # Business logic
│   └── Cargo.toml
├── frontend/                # React + Three.js
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── simulations/    # Physics simulations
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.tsx
│   └── package.json
├── docs/                    # Documentation
└── docker-compose.yml       # Local development
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Three.js, Tailwind CSS |
| **Backend** | Rust, Axum, SQLx, PostgreSQL |
| **AI** | OpenAI API / Local LLM |
| **Infrastructure** | Docker, GitHub Actions |

## 📖 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Physics Simulations Guide](docs/SIMULATIONS.md)

## 🎮 Simulations

### 1. Double-Slit Experiment
Explore the fundamental quantum phenomenon demonstrating wave-particle duality.

**Parameters:**
- Wavelength: 400-700 nm
- Slit separation: 0.01-1 mm
- Observer mode: on/off

### 2. Quantum Tunneling
Visualize how particles can pass through potential barriers.

**Parameters:**
- Barrier height
- Barrier width
- Particle energy

### 3. Hydrogen Atom Orbitals
Interactive 3D visualization of electron probability clouds.

**Features:**
- s, p, d orbital visualization
- Energy level transitions
- Spectral line display

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'feat: add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

## 📊 Roadmap

### December 2025
- [x] Project setup
- [ ] Double-slit simulation
- [ ] Quantum tunneling simulation
- [ ] Hydrogen atom visualization

### January-February 2026
- [ ] AI assistant integration
- [ ] User authentication (Supabase)
- [ ] Progress tracking
- [ ] Gamification

### March 2026
- [ ] NFT certificates
- [ ] Closed beta (50 users)

### April-May 2026
- [ ] Public launch
- [ ] 500+ users

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Bakhtiyor Ruzimatov** - Founder & CTO
- Email: barust67@gmail.com
- GitHub: [@barust](https://github.com/barust)

---

**Part of [DeSci Intelligent Universe](https://github.com/desci-intelligent-universe)** - Building the Cognitive Future of Science

---

*Last updated: November 29, 2025*
