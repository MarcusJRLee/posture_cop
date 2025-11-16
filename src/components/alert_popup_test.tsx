import { describe, it, expect, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import AlertPopup from "./alert_popup";

describe("AlertPopup", () => {
  it("should render message", () => {
    const onClose = jest.fn();
    render(<AlertPopup message="Test alert" onClose={onClose} />);
    expect(screen.getByText("Test alert")).not.toBeNull();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(<AlertPopup message="Test alert" onClose={onClose} />);

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", () => {
    const onClose = jest.fn();
    const { container } = render(
      <AlertPopup message="Test alert" onClose={onClose} />
    );

    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose when popup content is clicked", () => {
    const onClose = jest.fn();
    render(<AlertPopup message="Test alert" onClose={onClose} />);

    const popupContent = screen.getByText("Test alert").closest("div");
    if (popupContent) {
      fireEvent.click(popupContent);
      expect(onClose).not.toHaveBeenCalled();
    }
  });
});
