// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom')

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Material Tailwind React components
jest.mock('@material-tailwind/react', () => {
  const createMockComponent = (name) => {
    const Component = jest.fn((props) => props)
    Component.displayName = name
    return Component
  }

  return {
    Button: createMockComponent('Button'),
    Input: createMockComponent('Input'),
    Card: createMockComponent('Card'),
    CardHeader: createMockComponent('CardHeader'),
    CardBody: createMockComponent('CardBody'),
    CardFooter: createMockComponent('CardFooter'),
    Typography: createMockComponent('Typography'),
    Alert: createMockComponent('Alert'),
    Spinner: createMockComponent('Spinner'),
    Dialog: createMockComponent('Dialog'),
    DialogHeader: createMockComponent('DialogHeader'),
    DialogBody: createMockComponent('DialogBody'),
    DialogFooter: createMockComponent('DialogFooter'),
  }
})

// Setup global mocks
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
