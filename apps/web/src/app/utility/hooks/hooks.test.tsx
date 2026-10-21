import { act, renderHook } from "@testing-library/react";
import { useGetCurrentScreenSize } from "./useGetCurrentScreenSize";
import { useIsInView } from "./useIsInView";
import { useOnScrollToBottom } from "./useOnScrollToBottom";

describe("useGetCurrentScreenSize", () => {
  const resizeTo = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: width,
    });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  it("starts from the window width", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1200,
    });
    const { result } = renderHook(() => useGetCurrentScreenSize());
    expect(result.current).toEqual({ screenSize: 1200, isMobile: false });
  });

  it.each([
    [767, true],
    [768, false],
    [320, true],
  ])("width %i -> isMobile=%s", (width, isMobile) => {
    const { result } = renderHook(() => useGetCurrentScreenSize());
    resizeTo(width);
    expect(result.current).toEqual({ screenSize: width, isMobile });
  });

  it("stops listening when unmounted", () => {
    const remove = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useGetCurrentScreenSize());
    unmount();
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});

describe("useIsInView", () => {
  let callback: (entries: Partial<IntersectionObserverEntry>[]) => void;
  const observe = jest.fn();
  const disconnect = jest.fn();

  beforeEach(() => {
    (global as any).IntersectionObserver = jest.fn((cb) => {
      callback = cb;
      return { observe, disconnect };
    });
  });

  const element = (y: number) => {
    const div = document.createElement("div");
    div.getBoundingClientRect = () => ({ y }) as DOMRect;
    return { current: div };
  };

  it("does nothing without an element", () => {
    const { result } = renderHook(() => useIsInView({ current: null }));
    expect(result.current).toBe(false);
    expect(observe).not.toHaveBeenCalled();
  });

  it("is true while the element intersects", () => {
    const { result } = renderHook(() => useIsInView(element(-100)));
    expect(observe).toHaveBeenCalled();
    act(() => callback([{ isIntersecting: true }]));
    expect(result.current).toBe(true);
    act(() => callback([{ isIntersecting: false }]));
    expect(result.current).toBe(false);
  });

  it("stays true once the element is below the top of the viewport", () => {
    const { result } = renderHook(() => useIsInView(element(300)));
    act(() => callback([{ isIntersecting: false }]));
    expect(result.current).toBe(true);
  });

  it("disconnects on unmount", () => {
    const { unmount } = renderHook(() => useIsInView(element(0)));
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});

describe("useOnScrollToBottom", () => {
  const setPosition = (
    scrollTop: number,
    clientHeight: number,
    scrollHeight: number,
  ) => {
    const root = document.documentElement;
    Object.defineProperty(root, "scrollTop", {
      configurable: true,
      value: scrollTop,
    });
    Object.defineProperty(root, "clientHeight", {
      configurable: true,
      value: clientHeight,
    });
    Object.defineProperty(root, "scrollHeight", {
      configurable: true,
      value: scrollHeight,
    });
    window.dispatchEvent(new Event("scroll"));
  };

  it("fires within 20px of the bottom", () => {
    const onBottom = jest.fn();
    renderHook(() => useOnScrollToBottom(onBottom));
    setPosition(0, 500, 2000);
    expect(onBottom).not.toHaveBeenCalled();
    setPosition(1485, 500, 2000);
    expect(onBottom).toHaveBeenCalledTimes(1);
  });

  it("always calls the latest handler", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(({ cb }) => useOnScrollToBottom(cb), {
      initialProps: { cb: first },
    });
    rerender({ cb: second });
    setPosition(1500, 500, 2000);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });

  it("removes the listener on unmount", () => {
    const onBottom = jest.fn();
    const { unmount } = renderHook(() => useOnScrollToBottom(onBottom));
    unmount();
    setPosition(1500, 500, 2000);
    expect(onBottom).not.toHaveBeenCalled();
  });
});
