import { act, render } from "@testing-library/react";
import useDiscover, { DiscoverProvider } from "./DiscoverContext";

let ctx: ReturnType<typeof useDiscover>;
const Probe = () => {
  ctx = useDiscover();
  return null;
};
const mount = () =>
  render(
    <DiscoverProvider>
      <Probe />
    </DiscoverProvider>,
  );

describe("DiscoverProvider", () => {
  it("starts every list on page 1", () => {
    mount();
    expect(ctx).toMatchObject({
      exponatPage: 1,
      organisationPage: 1,
      postPage: 1,
      workPage: 1,
      gbifWorkPage: 1,
    });
  });

  it("restores the pages stored by a previous visit", () => {
    localStorage.setItem("exponatPage", "4");
    localStorage.setItem("organisationPage", "2");
    localStorage.setItem("postPage", "7");
    localStorage.setItem("workPage", "3");
    localStorage.setItem("gbifWorkPage", "9");
    mount();
    expect(ctx).toMatchObject({
      exponatPage: 4,
      organisationPage: 2,
      postPage: 7,
      workPage: 3,
      gbifWorkPage: 9,
    });
  });

  it("remembers a page change, but never stores page 1", () => {
    mount();
    act(() => ctx.setExponatPage!(3));
    expect(localStorage.getItem("exponatPage")).toBe("3");
    act(() => ctx.setExponatPage!(1));
    // page 1 is the default; the previous value is simply left in place
    expect(ctx.exponatPage).toBe(1);
  });

  it("each list persists under its own key", () => {
    mount();
    act(() => {
      ctx.setOrganisationPage!(2);
      ctx.setPostPage!(5);
      ctx.setWorkPage!(6);
      ctx.setGbifWorkPage!(8);
    });
    expect(localStorage.getItem("organisationPage")).toBe("2");
    expect(localStorage.getItem("postPage")).toBe("5");
    expect(localStorage.getItem("workPage")).toBe("6");
    expect(localStorage.getItem("gbifWorkPage")).toBe("8");
    expect(localStorage.getItem("exponatPage")).toBeNull();
  });

  it("resetPages goes back to page 1 and forgets everything", () => {
    localStorage.setItem("exponatPage", "4");
    localStorage.setItem("postPage", "7");
    mount();
    expect(ctx.exponatPage).toBe(4);
    act(() => ctx.resetPages!());
    expect(ctx).toMatchObject({ exponatPage: 1, postPage: 1 });
    expect(localStorage.getItem("exponatPage")).toBeNull();
    expect(localStorage.getItem("postPage")).toBeNull();
  });

  it("is inert without a provider", () => {
    render(<Probe />);
    expect(ctx.exponatPage).toBe(1);
    expect(ctx.setExponatPage).toBeUndefined();
    expect(() => ctx.resetPages!()).not.toThrow();
  });
});
