import { act, render, screen } from "@testing-library/react";
import useCreateButton, { CreateButtonProvider } from "./CreateButtonContext";
import useSideMenu, { SideMenuProvider } from "./SideMenuContext";

describe("SideMenuContext", () => {
  const Probe = () => {
    const { active, toggleActive } = useSideMenu();
    return <button onClick={toggleActive}>{active ? "open" : "closed"}</button>;
  };

  it("is closed by default and toggles", () => {
    render(
      <SideMenuProvider>
        <Probe />
      </SideMenuProvider>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("closed");
    act(() => button.click());
    expect(button).toHaveTextContent("open");
    act(() => button.click());
    expect(button).toHaveTextContent("closed");
  });

  it("works as a no-op without a provider", () => {
    render(<Probe />);
    act(() => screen.getByRole("button").click());
    expect(screen.getByRole("button")).toHaveTextContent("closed");
  });
});

describe("CreateButtonContext", () => {
  let ctx: ReturnType<typeof useCreateButton>;
  const Probe = () => {
    ctx = useCreateButton();
    return (
      <p>
        {String(ctx.isVisibleButton)}/{String(ctx.isVisibleModal)}
      </p>
    );
  };
  const mount = () =>
    render(
      <CreateButtonProvider>
        <Probe />
      </CreateButtonProvider>,
    );

  it("starts hidden", () => {
    mount();
    expect(screen.getByText("false/false")).toBeInTheDocument();
  });

  it("shows and hides the button and the modal independently", () => {
    mount();
    act(() => ctx.showButton!());
    expect(screen.getByText("true/false")).toBeInTheDocument();
    act(() => ctx.showModal!());
    expect(screen.getByText("true/true")).toBeInTheDocument();
    act(() => ctx.hideButton!());
    expect(screen.getByText("false/true")).toBeInTheDocument();
    act(() => ctx.hideModal!());
    expect(screen.getByText("false/false")).toBeInTheDocument();
  });
});
