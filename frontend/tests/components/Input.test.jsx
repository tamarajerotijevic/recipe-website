import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import Input from "../../src/components/Input";

describe("Input komponenta", () => {
  test("renderuje label i povezuje je sa inputom preko name/id", () => {
    render(
      <Input
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        placeholder="Unesi email"
      />
    );

    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "email");

    const input = screen.getByPlaceholderText("Unesi email");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "email");
    expect(input).toHaveAttribute("name", "email");
  });

  test("ne renderuje label ako label prop nije prosleđen", () => {
    render(<Input name="x" value="" onChange={() => {}} />);
    expect(screen.queryByText("Email")).toBeNull();
  });

  test("prosleđuje type i placeholder", () => {
    render(
      <Input
        label="Lozinka"
        name="pass"
        type="password"
        placeholder="Unesi lozinku"
        value=""
        onChange={() => {}}
      />
    );

    const input = screen.getByPlaceholderText("Unesi lozinku");
    expect(input).toHaveAttribute("type", "password");
  });

  test("disabled i required rade", () => {
    render(
      <Input
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        disabled
        required
      />
    );

    const input = screen.getByLabelText("Email");
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
  });

  test("dodaje dodatni className na input", () => {
    render(
      <Input
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        className="my-custom"
      />
    );

    const input = screen.getByLabelText("Email");
    expect(input.className).toMatch(/input-field/);
    expect(input.className).toMatch(/my-custom/);
  });

  test("poziva onChange i omogućava unos (controlled input preko wrapper-a)", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function Wrapper() {
      const [val, setVal] = useState("");

      return (
        <Input
          label="Email"
          name="email"
          value={val}
          placeholder="Unesi email"
          onChange={(e) => {
            setVal(e.target.value);     // bitno: ažuriramo state
            handleChange(e);            // i beležimo poziv
          }}
        />
      );
    }

    render(<Wrapper />);

    const input = screen.getByPlaceholderText("Unesi email");

    await user.type(input, "test@test.com");

    // Proveri da se unos stvarno upisao (controlled radi)
    expect(input).toHaveValue("test@test.com");

    // Proveri da je handler pozivan
    expect(handleChange).toHaveBeenCalled();

    // Proveri poslednji event ima target podatke
    const lastEvent = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
    expect(lastEvent.target.name).toBe("email");
    expect(lastEvent.target.value).toBe("test@test.com");
  });
});