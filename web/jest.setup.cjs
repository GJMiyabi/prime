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

// Mock Web APIs (Request, Response, etc.) for Next.js API Routes
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init?.method || 'GET'
      this.headers = init?.headers instanceof Headers ? init.headers : new Headers(init?.headers)
      this.body = init?.body
    }
  }
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.statusText = init?.statusText || ''
      this.headers = new Map(Object.entries(init?.headers || {}))
    }
  }
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this._headers = new Map()
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this._headers.set(key.toLowerCase(), value))
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this._headers.set(key.toLowerCase(), value))
        } else if (typeof init === 'object') {
          Object.entries(init).forEach(([key, value]) => this._headers.set(key.toLowerCase(), value))
        }
      }
    }

    get(name) {
      const value = this._headers.get(name.toLowerCase())
      return value !== undefined ? value : null
    }

    set(name, value) {
      this._headers.set(name.toLowerCase(), value)
    }

    has(name) {
      return this._headers.has(name.toLowerCase())
    }

    delete(name) {
      this._headers.delete(name.toLowerCase())
    }

    forEach(callback) {
      this._headers.forEach((value, key) => callback(value, key, this))
    }

    entries() {
      return this._headers.entries()
    }

    keys() {
      return this._headers.keys()
    }

    values() {
      return this._headers.values()
    }

    [Symbol.iterator]() {
      return this._headers[Symbol.iterator]()
    }
  }
}

// Mock window.location for tests (remove this section - causes issues)
let mockPathname = '/'

// Export for tests to modify pathname
global.setMockPathname = (pathname) => {
  mockPathname = pathname
}

// Export getter for mockPathname
global.getMockPathname = () => mockPathname
