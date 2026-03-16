// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Supabase
global.Supabase = {
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}

// Mock Web Speech API
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {}
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
}

// Mock MediaRecorder
global.MediaRecorder = class {
  constructor() {
    this.state = 'inactive'
  }
  start() {
    this.state = 'recording'
    this.onstart?.()
  }
  stop() {
    this.state = 'inactive'
    this.onstop?.()
  }
  addEventListener() {}
  removeEventListener() {}
}

// Mock fetch for API calls
global.fetch = jest.fn()
