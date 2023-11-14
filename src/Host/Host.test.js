import React from "react";
import { render, screen } from "./test-utils"; // Change the path accordingly
import "@testing-library/jest-dom";
import HostPage from "./Host";


test("renders Host component correctly", () => {
    render(<HostPage />);
    expect(screen.getByText("Want to post an event?")).toBeInTheDocument();
});


test("renders Event Name title in form", () => {
  render(<HostPage />);

  const EventName = screen.getByText("Event Name");
  expect(EventName).toBeInTheDocument();
});

test("renders One-Liner title in form", () => {
    render(<HostPage />);
  
    const EventName = screen.getByText("One-liner");
    expect(EventName).toBeInTheDocument();
  });

test("renders Date title in form", () => {
render(<HostPage />);

const EventName = screen.getByText("Date");
expect(EventName).toBeInTheDocument();
});


test("renders text entry space after 'One-liner' label", () => {
  render(<HostPage />);

  const oneLinerLabel = screen.getByText("One-liner");
  expect(oneLinerLabel).toBeInTheDocument();

  // Assuming you have an input field associated with the "One-liner" label
  const oneLinerInput = screen.getByPlaceholderText("Enter one-liner");
  expect(oneLinerInput).toBeInTheDocument();
  expect(oneLinerInput).toHaveAttribute("type", "text");
});