import { describe, expect, it, mock } from "bun:test";

mock.module("@react-email/render", () => ({
  render: (_component: unknown, options?: { plainText?: boolean }) => {
    if (options?.plainText) {
      return Promise.resolve("Plain text version");
    }
    return Promise.resolve("<html>Rendered HTML</html>");
  },
}));

import { renderReactEmail } from "./render";

describe("renderReactEmail", () => {
  it("should render both HTML and text", async () => {
    // Pass a simple string as a stand-in for a React element
    const result = await renderReactEmail(
      "TestComponent" as unknown as Parameters<typeof renderReactEmail>[0],
    );

    expect(result.html).toBe("<html>Rendered HTML</html>");
    expect(result.text).toBe("Plain text version");
  });

  it("should return object with html and text keys", async () => {
    const result = await renderReactEmail(
      "TestComponent" as unknown as Parameters<typeof renderReactEmail>[0],
    );

    expect(result).toHaveProperty("html");
    expect(result).toHaveProperty("text");
    expect(typeof result.html).toBe("string");
    expect(typeof result.text).toBe("string");
  });
});
