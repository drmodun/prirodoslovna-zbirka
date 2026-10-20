import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import { FormHarness } from "test-utils/formHarness";
import { setUserContext } from "test-utils/userContext";

jest.mock("components/SpeechToText", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/utility/context/UserContext", () => ({
  __esModule: true,
  default: () => require("test-utils/userContext").mockUserContext,
}));

import { Dropdown } from "../Dropdown/Drodown";
import FileUpload from "../FileUpload/FileUpload";
import { ListInput } from "../ListInput/ListInput";
import { Tabs, Variant } from "../Tabs/Tabs";
import { AdminCheckingWrapper } from "@/utility/wrappers/adminCheckWrapper";
import { RightCheckingWrapper } from "@/utility/wrappers/rightCheckingWrapper";
import { useCardPermissions } from "../CardCollection/useCardPermissions";
import { renderHook } from "@testing-library/react";

describe("Tabs", () => {
  it("renders every tab and highlights the active one", () => {
    render(
      <Tabs
        tabs={["Objave", "Eksponati"]}
        activeTab="Eksponati"
        onSelect={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Objave" }).className,
    ).not.toMatch(/active/);
    expect(screen.getByRole("button", { name: "Eksponati" }).className).toMatch(
      /active/,
    );
  });

  it("reports the selected tab", async () => {
    const onSelect = jest.fn();
    render(<Tabs tabs={["A", "B"]} activeTab="A" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onSelect).toHaveBeenCalledWith("B");
  });

  it("applies the variant class", () => {
    render(
      <Tabs
        tabs={["A"]}
        activeTab="A"
        variant={Variant.SUB}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByRole("button").className).toMatch(/sub/);
  });
});

describe("Dropdown", () => {
  const options = [
    { label: "Zagreb", value: "zg" },
    { label: "Zadar", value: "zd" },
    { label: "Split", value: "st" },
  ];
  let form: any;
  const mount = (props: Record<string, unknown> = {}) =>
    render(
      <FormHarness onForm={(f) => (form = f)}>
        {(f) => (
          <Dropdown options={options} attribute="city" form={f} {...props} />
        )}
      </FormHarness>,
    );

  it("starts closed with its placeholder", () => {
    mount({ initPlaceholder: "Grad" });
    expect(screen.getByPlaceholderText("Grad")).toBeInTheDocument();
    expect(screen.getByText("Zagreb").closest("div")!.className).toMatch(
      /hidden/,
    );
  });

  it("opens on focus and filters the options while typing", async () => {
    mount();
    await userEvent.click(screen.getByRole("textbox"));
    expect(screen.getByText("Zagreb").closest("div")!.className).toMatch(
      /menu/,
    );
    await userEvent.type(screen.getByRole("textbox"), "za");
    expect(screen.getByText("Zagreb")).toBeInTheDocument();
    expect(screen.getByText("Zadar")).toBeInTheDocument();
    expect(screen.queryByText("Split")).toBeNull();
  });

  it("selecting an option stores its value in the form and notifies the parent", async () => {
    const onSelect = jest.fn();
    mount({ onSelect });
    await userEvent.click(screen.getByRole("textbox"));
    await userEvent.click(screen.getByText("Split"));
    expect(onSelect).toHaveBeenCalledWith("st");
    await waitFor(() => expect(form.getValues("city")).toBe("st"));
    expect(screen.getByRole("textbox")).toHaveValue("Split");
  });

  it("typing free text also writes it into the form", async () => {
    mount();
    await userEvent.type(screen.getByRole("textbox"), "Rijeka");
    expect(form.getValues("city")).toBe("Rijeka");
  });

  it("the empty entry resets the selection", async () => {
    const onSelect = jest.fn();
    mount({ onSelect, initSelected: "zg", initPlaceholder: "Grad" });
    await userEvent.click(screen.getByRole("textbox"));
    const empty = screen.getAllByRole("listitem")[0];
    await userEvent.click(empty);
    expect(onSelect).toHaveBeenLastCalledWith("");
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByPlaceholderText("Grad")).toBeInTheDocument();
  });

  it("shows at most ten matches", async () => {
    const many = Array.from({ length: 25 }, (_, i) => ({
      label: `Grad ${i}`,
      value: `${i}`,
    }));
    render(
      <FormHarness>
        {(f) => <Dropdown options={many} attribute="city" form={f} />}
      </FormHarness>,
    );
    await userEvent.click(screen.getByRole("textbox"));
    // 10 matches plus the empty "reset" entry
    expect(screen.getAllByRole("listitem")).toHaveLength(11);
  });

  it("closes itself when `cancel` changes", async () => {
    const { rerender } = render(
      <FormHarness>
        {(f) => (
          <Dropdown options={options} attribute="c" form={f} cancel={false} />
        )}
      </FormHarness>,
    );
    await userEvent.click(screen.getByRole("textbox"));
    expect(screen.getByText("Zagreb").closest("div")!.className).toMatch(
      /menu/,
    );
    rerender(
      <FormHarness>
        {(f) => <Dropdown options={options} attribute="c" form={f} cancel />}
      </FormHarness>,
    );
    await waitFor(() =>
      expect(screen.getByText("Zagreb").closest("div")!.className).toMatch(
        /hidden/,
      ),
    );
  });
});

describe("ListInput", () => {
  let form: any;
  const mount = (props: Record<string, unknown> = {}) =>
    render(
      <FormHarness onForm={(f) => (form = f)}>
        {(f) => (
          <ListInput
            question="Zanimljivosti"
            attribute="facts"
            form={f}
            {...props}
          />
        )}
      </FormHarness>,
    );

  it("adds typed values to the list and to the form", async () => {
    mount();
    await userEvent.type(
      screen.getByPlaceholderText("Upišite vrijednost"),
      "Brza",
    );
    await userEvent.click(screen.getByTitle("add"));
    expect(screen.getByText("Brza")).toBeInTheDocument();
    await waitFor(() => expect(form.getValues("facts")).toEqual(["Brza"]));
    expect(screen.getByPlaceholderText("Upišite vrijednost")).toHaveValue("");
  });

  it("ignores empty values and duplicates", async () => {
    mount();
    await userEvent.click(screen.getByTitle("add"));
    for (let i = 0; i < 2; i++) {
      await userEvent.type(
        screen.getByPlaceholderText("Upišite vrijednost"),
        "Brza",
      );
      await userEvent.click(screen.getByTitle("add"));
    }
    expect(screen.getAllByText("Brza")).toHaveLength(1);
    expect(form.getValues("facts")).toEqual(["Brza"]);
  });

  it("removes entries", async () => {
    mount();
    for (const value of ["a", "b"]) {
      await userEvent.type(
        screen.getByPlaceholderText("Upišite vrijednost"),
        value,
      );
      await userEvent.click(screen.getByTitle("add"));
    }
    await userEvent.click(screen.getAllByTitle("remove")[0]);
    expect(screen.queryByText("a")).toBeNull();
    expect(screen.getByText("b")).toBeInTheDocument();
    await waitFor(() => expect(form.getValues("facts")).toEqual(["b"]));
  });

  it("starts with the initial values", () => {
    mount({ initValue: ["a", "b"] });
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("can pick from a list of options instead of typing", async () => {
    mount({
      isSelect: true,
      options: [
        { label: "Prva", value: "one" },
        { label: "Druga", value: "two" },
      ],
    });
    await userEvent.selectOptions(
      screen.getByTitle("Odabir vrijednosti"),
      "two",
    );
    await userEvent.click(screen.getByTitle("add"));
    await waitFor(() => expect(form.getValues("facts")).toEqual(["two"]));
  });

  it("shows an error message", () => {
    mount({ error: "Obavezno polje" });
    expect(screen.getByText("Obavezno polje")).toBeInTheDocument();
  });
});

describe("FileUpload", () => {
  const png = (name = "a.png", size = 1024) =>
    new File([new Uint8Array(size)], name, { type: "image/png" });
  const input = (container: HTMLElement) =>
    container.querySelector('input[type="file"]') as HTMLInputElement;

  it("lists accepted files with their size and reports them", async () => {
    const onChange = jest.fn();
    const { container } = render(
      <FileUpload name="Slika" onChange={onChange} />,
    );
    await userEvent.upload(input(container), png("fox.png", 2 * 1024 * 1024));
    expect(await screen.findByText("fox.png")).toBeInTheDocument();
    expect(screen.getByText("2.000 MB")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalled();
    // the first call is the (empty) mount effect, the last one the upload
    const updater = onChange.mock.calls.at(-1)[0];
    expect(updater([])).toHaveLength(1); // appended to the parent's list
  });

  it("locks itself once the maximum number of files is reached", async () => {
    const { container } = render(<FileUpload name="Slika" maxFiles={1} />);
    await userEvent.upload(input(container), png());
    await screen.findByText("a.png");
    expect(input(container)).toBeDisabled();
    expect(
      screen.getByText("Maskimalni broj datoteka je stavljen"),
    ).toBeInTheDocument();
  });

  it("refuses more files than allowed", async () => {
    const { container } = render(<FileUpload name="Slike" maxFiles={1} />);
    await userEvent.upload(input(container), [png("a.png"), png("b.png")]);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Previše datoteka"),
    );
    expect(screen.queryByText("a.png")).toBeNull();
  });

  it("removing a file frees the slot and informs the parent", async () => {
    const onChange = jest.fn();
    const { container } = render(
      <FileUpload name="Slika" maxFiles={1} onChange={onChange} />,
    );
    await userEvent.upload(input(container), png());
    await screen.findByText("a.png");
    await userEvent.click(screen.getByTitle("remove"));
    expect(screen.queryByText("a.png")).toBeNull();
    expect(input(container)).not.toBeDisabled();
    // mount, upload, removal
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls.at(-1)[0]([{ name: "other" }])).toEqual([
      { name: "other" },
    ]);
  });

  it("rejects unsupported file types", async () => {
    const { container } = render(<FileUpload name="Slika" />);
    const exe = new File(["x"], "virus.exe", {
      type: "application/x-msdownload",
    });
    fireEvent.drop(
      container.querySelector('input[type="file"]')!.parentElement!,
      {
        dataTransfer: { files: [exe], items: [], types: ["Files"] },
      },
    );
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText("virus.exe")).toBeNull();
  });
});

describe("permission wrappers", () => {
  describe("AdminCheckingWrapper", () => {
    const mount = (id = "o1") =>
      render(
        <AdminCheckingWrapper id={id}>
          <span>secret</span>
        </AdminCheckingWrapper>,
      );

    it.each([
      ["ADMIN", true],
      ["OWNER", true],
      ["MEMBER", false],
      ["REQUESTED", false],
    ])("an organisation %s %s see the content", (role, visible) => {
      setUserContext({ memberships: [{ id: "o1", role }] });
      mount();
      expect(!!screen.queryByText("secret")).toBe(visible);
    });

    it("super users always see it", () => {
      setUserContext({ user: { role: "SUPER" } });
      mount();
      expect(screen.getByText("secret")).toBeInTheDocument();
    });

    it("membership of another organisation does not count", () => {
      setUserContext({ memberships: [{ id: "other", role: "OWNER" }] });
      mount("o1");
      expect(screen.queryByText("secret")).toBeNull();
    });

    it("logged out visitors see nothing", () => {
      setUserContext();
      mount();
      expect(screen.queryByText("secret")).toBeNull();
    });
  });

  describe("RightCheckingWrapper", () => {
    const mount = () =>
      render(
        <RightCheckingWrapper author="u1">
          <span>edit</span>
        </RightCheckingWrapper>,
      );

    it("shows the content to the author and to super users only", () => {
      setUserContext({ user: { id: "u1", role: "USER" } });
      const { unmount } = mount();
      expect(screen.getByText("edit")).toBeInTheDocument();
      unmount();

      setUserContext({ user: { id: "u2", role: "SUPER" } });
      const second = mount();
      expect(screen.getByText("edit")).toBeInTheDocument();
      second.unmount();

      setUserContext({ user: { id: "u2", role: "USER" } });
      mount();
      expect(screen.queryByText("edit")).toBeNull();
    });
  });

  describe("useCardPermissions", () => {
    const permissions = () =>
      renderHook(() => useCardPermissions()).result.current;

    it("super users administer everything", () => {
      setUserContext({ user: { id: "u1", role: "super" } });
      const p = permissions();
      expect(p.isSuper).toBe(true);
      expect(p.isOrganisationAdmin("anything")).toBe(true);
    });

    it("admins and owners administer only their organisations", () => {
      setUserContext({
        user: { id: "u1", role: "USER" },
        memberships: [
          { id: "o1", role: "ADMIN" },
          { id: "o2", role: "OWNER" },
          { id: "o3", role: "MEMBER" },
        ],
      });
      const p = permissions();
      expect(p.isOrganisationAdmin("o1")).toBe(true);
      expect(p.isOrganisationAdmin("o2")).toBe(true);
      expect(p.isOrganisationAdmin("o3")).toBe(false);
      expect(p.isOrganisationAdmin("o9")).toBe(false);
      expect(p.isOrganisationAdmin(undefined)).toBe(false);
    });

    it("recognises the current user", () => {
      setUserContext({ user: { id: "u1", role: "USER" } });
      const p = permissions();
      expect(p.isCurrentUser("u1")).toBe(true);
      expect(p.isCurrentUser("u2")).toBe(false);
    });

    it("nobody is the current user when logged out", () => {
      setUserContext();
      expect(permissions().isCurrentUser(undefined)).toBe(false);
    });
  });
});
