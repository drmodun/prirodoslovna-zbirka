import React from "react";

/**
 * A stand-in component that renders its simple props, e.g.
 * <span data-testid="approval">entity=posts;isApproved=true</span>.
 * Functions and objects are left out. Use inside jest.mock factories:
 *
 *   jest.mock("components/LikeButton", () => ({
 *     __esModule: true,
 *     default: require("test-utils/stubs").stub("like"),
 *   }));
 */
export const stub = (name: string) => {
  const Stub = (props: Record<string, unknown>) => (
    <span data-testid={name}>
      {Object.entries(props)
        .filter(([, v]) => typeof v !== "function" && typeof v !== "object")
        .map(([k, v]) => `${k}=${String(v)}`)
        .join(";")}
    </span>
  );
  Stub.displayName = `Stub(${name})`;
  return Stub;
};
