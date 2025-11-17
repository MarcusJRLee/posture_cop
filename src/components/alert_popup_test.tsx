import { describe, it, expect, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import AlertPopup from "./alert_popup";

describe("AlertPopup", () => {
  it("should render message", () => {
    const onClose = jest.fn();
    render(
      <AlertPopup
        message="Test alert"
        countdown={null}
        isAlarmActive={false}
        onClose={onClose}
      />
    );
    expect(screen.getByText("Test alert")).not.toBeNull();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(
      <AlertPopup
        message="Test alert"
        countdown={null}
        isAlarmActive={false}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose when popup content is clicked", () => {
    const onClose = jest.fn();
    render(
      <AlertPopup
        message="Test alert"
        countdown={null}
        isAlarmActive={false}
        onClose={onClose}
      />
    );

    const popupContent = screen.getByText("Test alert").closest("div");
    if (popupContent) {
      fireEvent.click(popupContent);
      expect(onClose).not.toHaveBeenCalled();
    }
  });

  it("should show yellow background during countdown", () => {
    const onClose = jest.fn();
    const { container } = render(
      <AlertPopup
        message="Test alert"
        countdown={5}
        isAlarmActive={false}
        onClose={onClose}
      />
    );

    const popup = container.firstChild as HTMLElement;
    expect(popup.className).toContain("bg-yellow-600");
  });

  it("should show red background and pulse when alarm is active", () => {
    const onClose = jest.fn();
    const { container } = render(
      <AlertPopup
        message="Test alert"
        countdown={null}
        isAlarmActive={true}
        onClose={onClose}
      />
    );

    const popup = container.firstChild as HTMLElement;
    expect(popup.className).toContain("bg-red-600");
    expect(popup.className).toContain("animate-pulse");
  });
});
