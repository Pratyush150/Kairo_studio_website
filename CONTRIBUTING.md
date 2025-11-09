# Contributing to Kairoverse 🌌

First off, thank you for considering contributing to Kairoverse! It's people like you that make this project such a great tool.

## 🎯 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues list. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples**
* **Describe the behavior you observed** and **what behavior you expected to see**
* **Include screenshots and animated GIFs** if possible
* **Include your environment details** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 💻 Development Process

### Setting Up Your Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Kairo_studio_website.git

# Navigate to directory
cd Kairo_studio_website

# Install dependencies
npm install

# Start development server
npm run dev
```

### Coding Standards

* **TypeScript**: Use TypeScript for all new code
* **Formatting**: We use Prettier with specific configurations
* **Linting**: ESLint is configured - make sure your code passes
* **Components**: Follow the existing component structure
* **Naming**: Use descriptive names for variables, functions, and components

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

Example:
```
Add camera fly-in animation to entities

- Implement GSAP timeline for smooth transitions
- Add easing functions for natural movement
- Fix #123
```

### Branch Naming

* `feature/` - New features
* `fix/` - Bug fixes
* `docs/` - Documentation changes
* `refactor/` - Code refactoring
* `test/` - Adding or updating tests

Examples:
* `feature/spatial-audio`
* `fix/particle-performance`
* `docs/update-readme`

## 🎨 Code Style Guide

### React Components

```typescript
// Good
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  const [state, setState] = useState<Type>();

  useEffect(() => {
    // Effect code
  }, [dependencies]);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}

// Bad
function myComponent(props) {
  // Non-TypeScript, poor naming
}
```

### GLSL Shaders

```glsl
// Good - Clear naming and comments
uniform float u_time;
uniform vec3 u_color;

void main() {
  // Calculate final color
  vec3 color = calculateColor(u_color, u_time);
  gl_FragColor = vec4(color, 1.0);
}
```

### File Structure

* Components in `src/components/`
* Hooks in `src/hooks/`
* Shaders in `src/shaders/`
* Utilities in `src/lib/`
* Styles in `src/styles/`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Check TypeScript
npm run type-check

# Lint code
npm run lint
```

## 📝 Documentation

* Update README.md if you change functionality
* Add JSDoc comments to functions and components
* Update CHANGELOG.md for notable changes
* Include inline comments for complex logic

## 🎯 Areas for Contribution

We especially welcome contributions in:

* **Performance Optimization** - Improve FPS, reduce bundle size
* **Accessibility** - Enhance keyboard navigation, screen reader support
* **Mobile Experience** - Touch gestures, mobile-specific optimizations
* **Audio System** - Spatial audio implementation
* **Entity Animations** - New entity types or improved animations
* **Documentation** - Tutorials, guides, API documentation
* **Testing** - Unit tests, integration tests, E2E tests

## ❓ Questions?

Feel free to open an issue with your question or reach out to the maintainers.

---

**Thank you for contributing to Kairoverse!** 🌌✨
