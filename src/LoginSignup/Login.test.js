import React from "react";
import { render, screen } from "./test-utils"; // Change the path accordingly
import "@testing-library/jest-dom";
import LoginPage from "./Login";


test("renders Host component correctly", () => {
    render(<LoginPage />);
    expect(screen.getByText("Get Started Now")).toBeInTheDocument();
});

test("renders Host component correctly", () => {
    render(<LoginPage />);
    expect(screen.getByText("Email")).toBeInTheDocument();
});
test("renders Host component correctly", () => {
    render(<LoginPage />);
    expect(screen.getByText("Password")).toBeInTheDocument();
});


test("renders text entry space after 'One-liner' label", () => {
    render(<LoginPage />);

    // Assuming you have an input field associated with the "One-liner" label
    const oneLinerInput = screen.getByPlaceholderText("Email");
    expect(oneLinerInput).toBeInTheDocument();
    expect(oneLinerInput).toHaveAttribute("type", "email");
});

test("renders text entry space after 'One-liner' label", () => {
    render(<LoginPage />);

    // Assuming you have an input field associated with the "One-liner" label
    const oneLinerInput = screen.getByPlaceholderText("Password");
    expect(oneLinerInput).toBeInTheDocument();
    expect(oneLinerInput).toHaveAttribute("type", "password");
});

test("renders Host component correctly", () => {
    render(<LoginPage />);
    expect(screen.getByText("LOGIN")).toBeInTheDocument();
});

test("renders Host component correctly", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sign up here")).toBeInTheDocument();
});
