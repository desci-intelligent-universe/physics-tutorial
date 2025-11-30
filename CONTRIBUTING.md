# Contributing to DIU Physics Tutorial

Thank you for your interest in contributing to the DIU Physics Tutorial! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- **Rust** 1.75+ ([rustup.rs](https://rustup.rs/))
- **Node.js** 18+ ([nodejs.org](https://nodejs.org/))
- **Docker** (optional, for database)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/physics-tutorial.git
   cd physics-tutorial
   ```

3. Start the backend:
   ```bash
   cd backend
   cargo run
   ```

4. Start the frontend (in another terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📝 Code Style

### Rust

- Follow the official [Rust Style Guide](https://doc.rust-lang.org/1.0.0/style/README.html)
- Use `cargo fmt` before committing
- Run `cargo clippy` and fix warnings

### TypeScript/React

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use functional components with hooks

## 🔀 Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `style:` - Formatting
   - `refactor:` - Code restructuring
   - `test:` - Adding tests
   - `chore:` - Maintenance

3. Push and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Ensure CI checks pass
5. Request review from maintainers

## 🎯 Areas for Contribution

### High Priority
- [ ] Additional physics simulations
- [ ] UI/UX improvements
- [ ] Performance optimizations
- [ ] Documentation

### Good First Issues
- Fix typos in documentation
- Add more AI responses
- Improve error messages
- Add loading states

## 📧 Questions?

- Open an issue for bugs or feature requests
- Email: barust67@gmail.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
