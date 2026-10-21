/** Controllable replacement for next/navigation (mocked in jest.setup.ts). */
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

export const routerState = {
  pathname: "/",
  search: new URLSearchParams(),
};

/** Set the current URL, e.g. setLocation("/discover", "tab=Posts"). */
export const setLocation = (pathname: string, search = "") => {
  routerState.pathname = pathname;
  routerState.search = new URLSearchParams(search);
};
