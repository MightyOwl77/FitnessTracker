
# Contributing to Body Transform

Thank you for considering contributing to Body Transform! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure environment variables
4. Start the development server: `npm run dev`

## Code Standards

- Follow the TypeScript coding standards
- Use the provided ESLint and Prettier configurations
- Write tests for new features or bug fixes
- Document your code with clear comments

## Testing

Before submitting a pull request, ensure that:

1. All tests pass: `npm test`
2. Linting passes: `npm run lint`
3. TypeScript type checking passes: `npm run check`

## Pull Request Process

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Ensure tests, linting, and type checking pass
5. Update documentation if necessary
6. Submit a pull request

## Commit Message Guidelines

We follow a simplified version of [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code changes that neither fix bugs nor add features
- `test:` Adding or modifying tests
- `chore:` Changes to the build process or auxiliary tools

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
