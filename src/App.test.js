import { render, screen } from '@testing-library/react';
import App from './App';

test('renders beaverbuzz on navbar', () => {
  render(<App />);
  const linkElement = screen.getByText("BeaverBuzz");
  expect(linkElement).toBeInTheDocument();
});




