import '@testing-library/jest-dom';

// Mock canvas context for Konva.js tests
if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({ data: new Array(4) })),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  }),
  });
}

// Mock DeviceOrientationEvent
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'DeviceOrientationEvent', {
  value: class MockDeviceOrientationEvent extends Event {
    constructor(type, eventInitDict) {
      super(type, eventInitDict)
      this.alpha = eventInitDict?.alpha || 0
      this.beta = eventInitDict?.beta || 0
      this.gamma = eventInitDict?.gamma || 0
      this.absolute = eventInitDict?.absolute || false
    }
  },
  });
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0)
}

global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}