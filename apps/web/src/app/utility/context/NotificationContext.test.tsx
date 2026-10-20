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

// Each subscription made through fetch-event-source.
const streams: {
  url: string;
  init: any;
  push: (data: string) => void;
}[] = [];
jest.mock("@microsoft/fetch-event-source", () => ({
  fetchEventSource: (url: string, init: any) => {
    streams.push({ url, init, push: (data) => init.onmessage({ data }) });
    return new Promise(() => {});
  },
}));

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
  streams.length = 0;
  localStorage.setItem("access_token", "token");
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
      expect(streams).toHaveLength(0);
      mocks.user = { id: "u1" };
      mount();
      expect(streams).toHaveLength(0);
    });

    it("does not subscribe without a stored token", () => {
      localStorage.removeItem("access_token");
      mocks.user = { id: "u1" };
      mocks.query.isSuccess = true;
      mount();
      expect(streams).toHaveLength(0);
    });

    it("subscribes to the user's stream and refetches once logged in", () => {
      mocks.user = { id: "u1" };
      mocks.query.isSuccess = true;
      mount();
      expect(streams).toHaveLength(1);
      expect(streams[0].url).toBe(
        "http://api.test/notification-users/subscribe/u1",
      );
      expect(streams[0].init.headers).toEqual({
        Authorization: "Bearer token",
      });
      expect(mocks.query.refetch).toHaveBeenCalled();
    });

    it("prepends a pushed notification and tells the user", async () => {
      mocks.user = { id: "u1" };
      mocks.query.isSuccess = true;
      mocks.query.data = [note("1")];
      mount();
      act(() => streams[0].push(JSON.stringify(note("2"))));
      await waitFor(() =>
        expect(screen.getAllByRole("listitem")).toHaveLength(2),
      );
      expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("T2");
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("T2"),
        expect.anything(),
      );
    });

    it("aborts the stream on unmount", () => {
      mocks.user = { id: "u1" };
      mocks.query.isSuccess = true;
      const { unmount } = mount();
      unmount();
      expect(streams[0].init.signal.aborted).toBe(true);
    });
  });
});
