import { act, render, screen, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import useNotification, { NotificationsProvider } from "./NotificationContext";

const mocks = {
  user: undefined as any,
  query: { data: undefined as any, refetch: jest.fn(), isSuccess: false },
};

jest.mock("./UserContext", () => ({
  __esModule: true,
  default: () => ({ user: mocks.user }),
}));
jest.mock("@/api/useGetNotifications", () => ({
  useGetNotifications: () => mocks.query,
}));
jest.mock("@/api/shared", () => ({ baseURL: "http://api.test" }));
jest.mock("components/NotificationModal/NotificationModal", () => ({
  NotificationModal: () => <div data-testid="modal" />,
}));

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onopen?: () => void;
  onmessage?: (e: { data: string }) => void;
  close = jest.fn();
  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }
}

let ctx: ReturnType<typeof useNotification>;
const Probe = () => {
  ctx = useNotification();
  return (
    <ul>
      {ctx.notifications.map((n) => (
        <li key={n.id}>
          {n.title}:{String(n.read)}
        </li>
      ))}
    </ul>
  );
};
const mount = () =>
  render(
    <NotificationsProvider>
      <Probe />
    </NotificationsProvider>,
  );

const note = (id: string, read = false) =>
  ({ id, title: `T${id}`, read }) as any;

beforeEach(() => {
  FakeEventSource.instances = [];
  (global as any).EventSource = FakeEventSource;
  mocks.user = undefined;
  mocks.query = { data: undefined, refetch: jest.fn(), isSuccess: false };
});

describe("NotificationsProvider", () => {
  it("renders the notification modal next to its children", () => {
    mount();
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("starts with the notifications that were fetched", () => {
    mocks.query.data = [note("1"), note("2", true)];
    mount();
    expect(screen.getByText("T1:false")).toBeInTheDocument();
    expect(screen.getByText("T2:true")).toBeInTheDocument();
  });

  it("opens and closes the modal state", () => {
    mount();
    expect(ctx.isVisibleModal).toBe(false);
    act(() => ctx.showModal());
    expect(ctx.isVisibleModal).toBe(true);
    act(() => ctx.hideModal());
    expect(ctx.isVisibleModal).toBe(false);
  });

  it("marks one notification as read", () => {
    mocks.query.data = [note("1"), note("2")];
    mount();
    act(() => ctx.markAsRead("1"));
    expect(screen.getByText("T1:true")).toBeInTheDocument();
    expect(screen.getByText("T2:false")).toBeInTheDocument();
  });

  it("ignores unknown ids and marks all as read", () => {
    mocks.query.data = [note("1"), note("2")];
    mount();
    act(() => ctx.markAsRead("nope"));
    act(() => ctx.markAllAsRead());
    expect(screen.getByText("T1:true")).toBeInTheDocument();
    expect(screen.getByText("T2:true")).toBeInTheDocument();
  });

  describe("live updates", () => {
    it("does not subscribe without a user or before the first fetch succeeded", () => {
      mount();
      expect(FakeEventSource.instances).toHaveLength(0);
      mocks.user = { id: "u1" };
      mount();
      expect(FakeEventSource.instances).toHaveLength(0);
    });

    it("subscribes to the user's stream and refetches once logged in", () => {
      mocks.user = { id: "u1" };
      mocks.query.isSuccess = true;
      mount();
      expect(FakeEventSource.instances).toHaveLength(1);
      expect(FakeEventSource.instances[0].url).toBe(
        "http://api.test/notification-users/subscribe/u1",
      );
      expect(mocks.query.refetch).toHaveBeenCalled();
    });

    it("prepends a pushed notification and tells the user", async () => {
      mocks.user = { id: "u1" };
      mocks.query.isSuccess = true;
      mocks.query.data = [note("1")];
      mount();
      act(() =>
        FakeEventSource.instances[0].onmessage!({
          data: JSON.stringify(note("2")),
        }),
      );
      await waitFor(() =>
        expect(screen.getAllByRole("listitem")).toHaveLength(2),
      );
      expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("T2");
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("T2"),
        expect.anything(),
      );
    });

    it("closes the stream on unmount", () => {
      mocks.user = { id: "u1" };
      mocks.query.isSuccess = true;
      const { unmount } = mount();
      unmount();
      expect(FakeEventSource.instances[0].close).toHaveBeenCalled();
    });
  });
});
