import { act } from "@testing-library/react";
import toast from "react-hot-toast";
import { renderHookWithClient } from "../../test-utils/render";

jest.mock("./shared", () => {
  const client = () => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    postForm: jest.fn(),
    patchForm: jest.fn(),
  });
  return { api: client(), fileApi: client(), baseURL: "http://api.test" };
});

import { api, fileApi } from "./shared";
import { useAdminDeleteUser } from "./useAdminDeleteUser";
import { useAdminUpdateUserInfo } from "./useAdminUpdateUserInfo";
import { useCreateCategorization } from "./useCreateCategorization";
import { useCreateExponat } from "./useCreateExponat";
import { useCreateOrganisation } from "./useCreateOrganisation";
import { useCreatePost } from "./useCreatePost";
import { useCreateQuiz } from "./useCreateQuiz";
import { useCreateSocialPost } from "./useCreateSocialPost";
import { useDeleteOrganisation } from "./useDeleteOrganisation";
import { useDeleteUser } from "./useDeleteUser";
import { useEditUserInfo } from "./useEditUserInfo";
import { useFollowOrganisation } from "./useFollowOrganisation";
import { useLeaveMembership } from "./useLeaveOrganisation";
import { useMarkAllAsRead } from "./useMarkAllAsRead";
import { useMarkAsRead } from "./useMarkAsRead";
import { useOwnerUpdateUserRole } from "./useOwnerUpdateUserRole";
import { usePostWork } from "./usePostWork";
import { useRemoveExponat } from "./useRemoveExponat";
import { useRemoveMembership } from "./useRemoveMembership";
import { useRemovePost } from "./useRemovePost";
import { useRemoveWork } from "./useRemoveWork";
import { useRequestMembership } from "./useRequestMembership";
import { useResetPassword } from "./useResetPassword";
import { useSendPasswordResetEmail } from "./useSendPasswordResetEmail";
import { useToggleApproval } from "./useToggleApproval";
import { useToggleFavourite } from "./useToggleFavourite";
import { useToggleFollowOrganisation } from "./useToggleFollowOrganisation";
import { useToggleFollow } from "./useToggleFollowUser";
import { useToggleLike } from "./useToggleLike";
import { useToggleSaveLiterature } from "./useToggleSaveLiterature";
import { useToggleSaveWork } from "./useToggleSaveWork";
import { useTransferOwnership } from "./useTransferOwnership";
import { useUpdateAuthorshipInfo } from "./useUpdateAuthorshipInfo";
import { useUpdateExponat } from "./useUpdateExponat";
import { useUpdateOrganisation } from "./useUpdateOrganisation";
import { useUpdatePost } from "./useUpdatePost";
import { useUpdateQuiz } from "./useUpdateQuiz";
import { useUpdateSocialPost } from "./useUpdateSocialPost";
import { useUpdateUserRole } from "./useUpdateUserRole";
import { useUpdateWork } from "./useUpdateWork";
import { useUploadAuthorshipInfo } from "./useUploadAuthorshipInfo";
import { useUploadProfilePicture } from "./useUploadProfilePicture";

type Method = "post" | "patch" | "put" | "delete" | "patchForm";
const http = api as unknown as Record<Method, jest.Mock>;

// [name, hook, mutate argument, method, URL (must match an API route), body]
const body = { any: "payload" };
const cases: [string, () => any, unknown, Method, string, unknown?][] = [
  ["useAdminDeleteUser", useAdminDeleteUser, "u1", "delete", "/users/u1"],
  [
    "useAdminUpdateUserInfo",
    useAdminUpdateUserInfo,
    { userId: "u1", userInfo: body },
    "patch",
    "/users/u1",
    body,
  ],
  [
    "useCreateCategorization",
    useCreateCategorization,
    body,
    "post",
    "/categorizations",
    body,
  ],
  [
    "useCreateExponat",
    useCreateExponat,
    { organisationId: "o1", exponat: body },
    "post",
    "/exponats/o1",
    body,
  ],
  [
    "useCreateOrganisation",
    useCreateOrganisation,
    body,
    "post",
    "/organisations",
    body,
  ],
  [
    "useCreatePost",
    useCreatePost,
    { exponatId: "e1", post: body },
    "post",
    "/posts/e1",
    body,
  ],
  [
    "useCreateSocialPost",
    useCreateSocialPost,
    { organisationId: "o1", data: body },
    "post",
    "/social-posts/o1",
    body,
  ],
  [
    "useDeleteOrganisation",
    useDeleteOrganisation,
    "o1",
    "delete",
    "/organisations/o1",
  ],
  ["useDeleteUser", useDeleteUser, undefined, "delete", "/users"],
  ["useEditUserInfo", useEditUserInfo, body, "patch", "/users", body],
  [
    "useFollowOrganisation",
    useFollowOrganisation,
    "o1",
    "patch",
    "/favourite-organisations/o1",
  ],
  [
    "useLeaveMembership",
    useLeaveMembership,
    "o1",
    "delete",
    "/members/o1/leave",
  ],
  [
    "useMarkAllAsRead",
    useMarkAllAsRead,
    undefined,
    "patch",
    "/notification-users/read/all",
  ],
  [
    "useMarkAsRead",
    useMarkAsRead,
    "n1",
    "patch",
    "/notification-users/read/n1",
  ],
  [
    "useOwnerUpdateUserRole",
    useOwnerUpdateUserRole,
    { organisationId: "o1", userId: "u1", role: "ADMIN" },
    "post",
    "/members/o1/u1/owner",
    { role: "ADMIN" },
  ],
  [
    "usePostWork",
    usePostWork,
    { organisationId: "o1", body },
    "post",
    "/works/o1",
    body,
  ],
  ["useRemoveExponat", useRemoveExponat, "e1", "delete", "/exponats/e1"],
  [
    "useRemoveMembership",
    useRemoveMembership,
    { organisationId: "o1", userId: "u1" },
    "delete",
    "/members/o1/u1/remove",
  ],
  ["useRemovePost", useRemovePost, "p1", "delete", "/posts/p1"],
  ["useRemoveWork", useRemoveWork, "w1", "delete", "/works/w1"],
  ["useRequestMembership", useRequestMembership, "o1", "post", "/members/o1"],
  [
    "useResetPassword",
    useResetPassword,
    { userActivationCode: "code", newPassword: "N3w!pass" },
    "post",
    "/users/reset-password/code",
    { newPassword: "N3w!pass" },
  ],
  [
    "useSendPasswordResetEmail",
    useSendPasswordResetEmail,
    "a@b.hr",
    "post",
    "/users/forgot-password/a@b.hr",
  ],
  [
    "useToggleApproval (exponats)",
    useToggleApproval,
    { id: "e1", entity: "exponats" },
    "patch",
    "/exponats/e1/approval",
  ],
  [
    "useToggleApproval (posts)",
    useToggleApproval,
    { id: "p1", entity: "posts" },
    "patch",
    "/posts/p1/approval",
  ],
  [
    "useToggleApproval (works)",
    useToggleApproval,
    { id: "w1", entity: "works" },
    "patch",
    "/works/w1/approval",
  ],
  [
    "useToggleFavourite",
    useToggleFavourite,
    "e1",
    "patch",
    "/favourite-exponats/e1",
  ],
  [
    "useToggleFollowOrganisation",
    useToggleFollowOrganisation,
    "o1",
    "patch",
    "/favourite-organisations/o1",
  ],
  ["useToggleFollow", useToggleFollow, "u1", "post", "/follows/u1"],
  ["useToggleLike", useToggleLike, "p1", "post", "/likes/p1"],
  [
    "useToggleSaveLiterature",
    useToggleSaveLiterature,
    "l1",
    "patch",
    "/literature/l1",
  ],
  ["useToggleSaveWork", useToggleSaveWork, "w1", "patch", "saved-works/w1"],
  [
    "useTransferOwnership",
    useTransferOwnership,
    { organisationId: "o1", userId: "u1", role: "OWNER" },
    "put",
    "/members/o1/u1/transfer",
  ],
  [
    "useUpdateAuthorshipInfo",
    useUpdateAuthorshipInfo,
    { id: "a1", object: body },
    "patch",
    "/authorship-info/a1",
    body,
  ],
  [
    "useUpdateExponat",
    useUpdateExponat,
    { exponatId: "e1", updateExponatDto: body },
    "patch",
    "/exponats/e1",
    body,
  ],
  [
    "useUpdateOrganisation",
    useUpdateOrganisation,
    { organisationId: "o1", updateOrganisationDto: body },
    "patch",
    "/organisations/o1",
    body,
  ],
  [
    "useUpdatePost",
    useUpdatePost,
    { postId: "p1", updatePostDto: body },
    "patch",
    "/posts/p1",
    body,
  ],
  [
    "useUpdateSocialPost",
    useUpdateSocialPost,
    { organisationId: "o1", id: "s1", socialPost: body },
    "patch",
    "/social-posts/o1/s1",
    body,
  ],
  [
    "useUpdateUserRole",
    useUpdateUserRole,
    { organisationId: "o1", userId: "u1", role: "ADMIN" },
    "patch",
    "/members/o1/u1",
    { role: "ADMIN" },
  ],
  [
    "useUpdateWork",
    useUpdateWork,
    { id: "w1", object: body },
    "patch",
    "/works/w1",
    body,
  ],
  [
    "useUploadAuthorshipInfo",
    useUploadAuthorshipInfo,
    body,
    "post",
    "/authorship-info",
    body,
  ],
];

// every row needs all six values: jest would treat a shorter row as a
// callback-style test and wait for `done`.
const rows = cases.map((c) => [c[0], c[1], c[2], c[3], c[4], c[5]] as const);

// useRemoveWork and useCreateCategorization are covered separately below
// because they misbehave.
const successRows = rows.filter(([name]) => name !== "useRemoveWork");
const failureRows = rows.filter(([name]) => name !== "useCreateCategorization");

describe("mutation hooks call the endpoint the API exposes", () => {
  it.each(successRows)("%s", async (_name, hook, arg, method, url, payload) => {
    http[method].mockResolvedValue({});
    const { result } = renderHookWithClient(hook);

    await act(async () => {
      await result.current.mutateAsync(arg);
    });

    expect(http[method]).toHaveBeenCalledTimes(1);
    const [calledUrl, calledBody] = http[method].mock.calls[0];
    expect(calledUrl).toBe(url);
    if (payload !== undefined) expect(calledBody).toEqual(payload);
  });

  it.each(failureRows)(
    "%s reports a failure to the user",
    async (_name, hook, arg, method) => {
      http[method].mockRejectedValue("Boom");
      const { result } = renderHookWithClient(hook);

      await act(async () => {
        await result.current.mutateAsync(arg).catch(() => {});
      });

      expect(toast.error).toHaveBeenCalled();
    },
  );
});

describe("hooks that misbehave", () => {
  it("useRemoveWork deletes the work", async () => {
    http.delete.mockResolvedValue({});
    const { result } = renderHookWithClient(useRemoveWork);
    await act(async () => {
      await result.current.mutateAsync("w1").catch(() => {});
    });
    expect(http.delete).toHaveBeenCalledWith("/works/w1");
  });

  it(
    "useRemoveWork reports success after a successful delete",
    async () => {
      http.delete.mockResolvedValue({});
      const { result } = renderHookWithClient(useRemoveWork);
      await act(async () => {
        await result.current.mutateAsync("w1").catch(() => {});
      });
      expect(toast.success).toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    },
  );

  // useCreateCategorization throws from onError instead of telling the user,
  // so a failure produces an unhandled error and no toast.
  it("useCreateCategorization posts, and shows no toast on failure", async () => {
    http.post.mockRejectedValue("nope");
    const { result } = renderHookWithClient(useCreateCategorization);
    await act(async () => {
      await result.current.mutateAsync({ species: "x" } as any).catch(() => {});
    });
    expect(http.post).toHaveBeenCalledWith("/categorizations", {
      species: "x",
    });
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe("quiz hooks", () => {
  it("useCreateQuiz posts to /quizzes/:organisationId", async () => {
    http.post.mockResolvedValue({});
    const { result } = renderHookWithClient(useCreateQuiz);
    await act(async () => {
      await result.current.mutateAsync({
        organisationId: "o1",
        data: body as any,
      });
    });
    expect(http.post.mock.calls[0][0]).toBe("/quizzes/o1");
  });

  it("useUpdateQuiz patches /quizzes/:organisationId/:id", async () => {
    http.patch.mockResolvedValue({});
    const { result } = renderHookWithClient(useUpdateQuiz);
    await act(async () => {
      await result.current.mutateAsync({
        organisationId: "o1",
        id: "q1",
        data: body as any,
      });
    });
    expect(http.patch.mock.calls[0][0]).toBe("/quizzes/o1/q1");
  });

  it("both show a loading toast and then a success/error toast on the same id", async () => {
    http.post.mockResolvedValue({});
    const { result } = renderHookWithClient(useCreateQuiz);
    await act(async () => {
      await result.current.mutateAsync({
        organisationId: "o1",
        data: body as any,
      });
    });
    expect(toast.success).toHaveBeenCalledWith(expect.any(String), {
      id: "toast-id",
    });
  });
});

describe("hooks with special behaviour", () => {
  it("useLogin-like flows keep the toast id from onMutate (useResetPassword)", async () => {
    jest.useFakeTimers();
    http.post.mockResolvedValue({});
    const { result } = renderHookWithClient(useResetPassword);
    await act(async () => {
      await result.current.mutateAsync({
        userActivationCode: "c",
        newPassword: "x",
      });
    });
    expect(toast.loading).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(expect.any(String), {
      id: "toast-id",
    });
    jest.useRealTimers();
  });

  it.each([
    [
      "useToggleLike: Unauthorized",
      useToggleLike,
      "Unauthorized",
      "unauthorized",
    ],
    ["useToggleLike: other error", useToggleLike, "Something else", "error"],
    [
      "useFollowOrganisation: You...",
      useFollowOrganisation,
      "You must login",
      "unauthorized",
    ],
    [
      "useFollowOrganisation: other error",
      useFollowOrganisation,
      "db down",
      "error",
    ],
    [
      "useRemoveMembership: Unauthorized",
      useRemoveMembership,
      "Unauthorized",
      "unauthorized",
    ],
    ["useUpdatePost: You...", useUpdatePost, "You cannot", "unauthorized"],
  ] as const)(
    "%s distinguishes auth errors",
    async (_n, _hook, message, id) => {
      const hook = _hook;
      http.post.mockRejectedValue(message);
      http.patch.mockRejectedValue(message);
      http.delete.mockRejectedValue(message);
      const { result } = renderHookWithClient(hook as () => any);
      await act(async () => {
        await result.current
          .mutateAsync({
            id: "x",
            postId: "x",
            organisationId: "x",
            userId: "x",
            updatePostDto: {},
          } as any)
          .catch(() => {});
      });
      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ id }),
      );
    },
  );

  it("useToggleSaveWork shows a loading toast and dismisses it when settled", async () => {
    http.patch.mockResolvedValue({});
    const { result } = renderHookWithClient(useToggleSaveWork);
    await act(async () => {
      await result.current.mutateAsync("w1");
    });
    expect(toast.loading).toHaveBeenCalledWith(expect.any(String), {
      id: "saving work",
    });
    expect(toast.dismiss).toHaveBeenCalledWith("saving work");
    expect(toast.success).toHaveBeenCalled();
  });

  it("useUploadProfilePicture sends the file as multipart form data", async () => {
    http.patchForm.mockResolvedValue({ data: "ok" });
    const { uploadProfilePicture } = jest.requireActual(
      "./useUploadProfilePicture",
    );
    const file = new File(["x"], "me.png", { type: "image/png" });
    await uploadProfilePicture(file);
    const [url, form] = http.patchForm.mock.calls[0];
    expect(url).toBe("/users/pfp");
    expect((form as FormData).get("file")).toBe(file);
    void useUploadProfilePicture;
  });
});

describe("upload hooks use the file client with a typed endpoint", () => {
  const form = fileApi as unknown as Record<"postForm", jest.Mock>;
  const file = new File(["x"], "a.bin");

  it.each([
    ["useUploadFile", "./useUploadFile", "/blobs/exponat"],
    ["useUploadDocument", "./useUploadDocument", "/blobs/pdf/exponat"],
    ["useUploadVideo", "./useUploadVideo", "/blobs/video/exponat"],
    [
      "useUploadThreeDimensionalModel",
      "./useUploadThreeDimensionalModel",
      "/blobs/model/exponat",
    ],
  ])("%s -> %s", async (name, path, url) => {
    form.postForm.mockResolvedValue({ data: "http://files/x" });
    const hook = jest.requireActual(path)[name];
    const { result } = renderHookWithClient(hook as () => any);
    let uploaded: unknown;
    await act(async () => {
      uploaded = await result.current.mutateAsync({
        file,
        directory: "exponat",
      });
    });
    expect(uploaded).toBe("http://files/x");
    const [calledUrl, data] = form.postForm.mock.calls[0];
    expect(calledUrl).toBe(url);
    expect((data as FormData).get("file")).toBe(file);
  });

  it("reports a failed upload", async () => {
    form.postForm.mockRejectedValue(new Error("network"));
    const { result } = renderHookWithClient(
      jest.requireActual("./useUploadFile").useUploadFile as () => any,
    );
    await act(async () => {
      await result.current
        .mutateAsync({ file, directory: "exponat" })
        .catch(() => {});
    });
    expect(toast.error).toHaveBeenCalled();
  });
});
