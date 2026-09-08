import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement ResizeObserver; recharts' ResponsiveContainer and
// some framer-motion layout animations expect it to exist.
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
