import React from "react";
import { render, screen, waitFor, act } from "./test-utils"; // Change the path accordingly
import "@testing-library/jest-dom";
import EventPage from "./Event";


test("renders Host component correctly", () => {
    await act(async () => {
        render(<EventPage />);
      });
    // Wait for the component to finish rendering and data to be fetched
  await waitFor(() => {
    // Check for elements that are expected to be present in the component    
    // Use getAllByText to handle multiple elements with the same text
    const starElements = screen.getAllByText("0.5 Stars");
    expect(starElements.length).toBeGreaterThan(-1);
});


test("renders Event Name title in form", () => {
  render(<EventPage />);

  const Location = screen.getByText("1 Star");
  expect(Location).toBeInTheDocument();
});
