import React from "react";
import { render, screen } from "./test-utils"; // Change the path accordingly
import "@testing-library/jest-dom";
import RegisterPage from "./Register";


test("renders Host component correctly", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Register Here")).toBeInTheDocument();
});

test("renders Host component correctly", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Email")).toBeInTheDocument();
});
test("renders Host component correctly", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Password")).toBeInTheDocument();
});
test("renders Host component correctly", () => {
    render(<RegisterPage />);
    expect(screen.getByText("First Name")).toBeInTheDocument();
});
test("renders Host component correctly", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Last Name")).toBeInTheDocument();
});
test("renders Host component correctly", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Phone Number")).toBeInTheDocument();
});



test("renders text entry space after 'One-liner' label", () => {
    render(<RegisterPage />);
  
    // Assuming you have an input field associated with the "One-liner" label
    const oneLinerInput = screen.getByPlaceholderText("Email");
    expect(oneLinerInput).toBeInTheDocument();
    expect(oneLinerInput).toHaveAttribute("type", "email");
  });

test("renders text entry space after 'One-liner' label", () => {
    render(<RegisterPage />);
  
    // Assuming you have an input field associated with the "One-liner" label
    const oneLinerInput = screen.getByPlaceholderText("Password");
    expect(oneLinerInput).toBeInTheDocument();
    expect(oneLinerInput).toHaveAttribute("type", "password");
  });

