import "@testing-library/jest-dom";

// jsdom does not implement these; several components touch them.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(globalThis as any).IntersectionObserver ??= NoopObserver;
(globalThis as any).ResizeObserver ??= NoopObserver;

// react-hot-toast: record calls instead of rendering anything.
jest.mock("react-hot-toast", () => {
  const toast = Object.assign(jest.fn(), {
    loading: jest.fn(() => "toast-id"),
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
    custom: jest.fn(),
  });
  return { __esModule: true, default: toast, toast, Toaster: () => null };
});

jest.mock("next/navigation", () => {
  const { mockRouter, routerState } = require("test-utils/router");
  return {
    useRouter: () => mockRouter,
    usePathname: () => routerState.pathname,
    useSearchParams: () => routerState.search,
    useParams: () => ({}),
    notFound: jest.fn(),
    redirect: jest.fn(),
  };
});

beforeEach(() => {
  // Modals render into <div id="portal"> (see app/layout.tsx).
  if (!document.querySelector("#portal")) {
    const portal = document.createElement("div");
    portal.id = "portal";
    document.body.appendChild(portal);
  }
  jest.clearAllMocks();
  require("test-utils/router").setLocation("/");
  localStorage.clear();
  // Hooks and server helpers log errors on purpose; keep the output readable.
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});
