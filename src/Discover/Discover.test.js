import React from "react";
import { render, screen } from "./test-utils"; // Change the path accordingly
import "@testing-library/jest-dom";
import DiscoverPage from "./Discover";


test("renders Host component correctly", () => {
  render(<DiscoverPage />);
  expect(screen.getByText("Your Next Adventure Starts Here...")).toBeInTheDocument();
});



test("renders text entry space after 'One-liner' label", () => {
  render(<DiscoverPage />);

  // Assuming you have an input field associated with the "One-liner" label
  const oneLinerInput = screen.getByPlaceholderText("Start typing your search..");
  expect(oneLinerInput).toBeInTheDocument();
  expect(oneLinerInput).toHaveAttribute("type", "text");
});

describe('DiscoverPage', () => {
  it('renders search filters correctly', async () => {
    render(<DiscoverPage />);

    // Check if each filter checkbox is rendered
    const filters = ['Academic', 'Sports', 'Science', 'Math', 'Technology', 'Engineering', 'Students', 'Arts', 'Music', 'Games', 'Career', 'Food']; // Replace with your actual filter names
    for (const filter of filters) {
      const filterCheckbox = screen.getByLabelText(filter);
      expect(filterCheckbox).toBeInTheDocument();
    }
  });
});
describe('DiscoverPage', () => {
  it('renders next and prev buttons correctly', async () => {
    render(<DiscoverPage />);

    // Check if the next and prev buttons are rendered
    const nextButton = screen.getByText('Next');
    const prevButton = screen.getByText('Previous');

    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
  });
});

describe('DiscoverPage', () => {
  it('renders the dropdown select component correctly', async () => {
    render(<DiscoverPage />);

    // Replace 'Sort by' with the actual label or content of your dropdown select
    const selectDropdown = screen.getByText('Sort by');

    // Check if the select dropdown is rendered
    expect(selectDropdown).toBeInTheDocument();
  });
});

describe('DiscoverPage', () => {
  it('renders the organizer button correctly', async () => {
    render(<DiscoverPage />);

    // Replace 'Organizer' with the actual label or content of your organizer button
    const organizerButton = screen.getByLabelText('Search by organizer');

    // Check if the organizer button is rendered
    expect(organizerButton).toBeInTheDocument();
  });
});

