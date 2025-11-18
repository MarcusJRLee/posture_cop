import { describe, it, expect, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import CopMascot from "./cop_mascot";

describe("CopMascot", () => {
  it("should render the image", () => {
    const { container } = render(<CopMascot />);
    const img = container.querySelector("img");

    expect(img).not.toBeNull();
    expect(img?.getAttribute("srcset")).toContain("simon_cop.png");
  });

  it("should not apply horizontal reflection when reflect is false", () => {
    const { container } = render(<CopMascot reflect={false} />);
    const img = container.querySelector("img");

    expect(img?.className).not.toContain("scale-x-[-1]");
  });

  it("should apply horizontal reflection when reflect is true", () => {
    const { container } = render(<CopMascot reflect={true} />);
    const img = container.querySelector("img");

    expect(img?.className).toContain("scale-x-[-1]");
  });

  it("should default to not reflecting when reflect prop is not provided", () => {
    const { container } = render(<CopMascot />);
    const img = container.querySelector("img");

    expect(img?.className).not.toContain("scale-x-[-1]");
  });
});
