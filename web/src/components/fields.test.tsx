/** Component tests: field error states and accessible wiring. */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { CurrencyInput, RateInput, Select } from "./fields";

describe("field components", () => {
  it("associates the label with the input", () => {
    render(<CurrencyInput label="Starting balance" defaultValue={100} />);
    expect(screen.getByLabelText("Starting balance")).toBeInTheDocument();
  });

  it("announces validation errors via role=alert and aria-invalid", () => {
    render(<RateInput label="Rate" error="Rate cannot be negative." defaultValue={-1} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Rate cannot be negative.");
    expect(screen.getByLabelText("Rate")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows the hint when there is no error", () => {
    render(
      <Select
        label="Rate type"
        hint="APY is the advertised number."
        options={[{ value: "APY", label: "APY" }]}
      />,
    );
    expect(screen.getByText("APY is the advertised number.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
