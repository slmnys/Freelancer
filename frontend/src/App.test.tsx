import { render, screen } from '@testing-library/react';
import App from './App';

test('renders e-commerce title', () => {
  render(<App />);
  const titleElement = screen.getByText(/E-Ticaret Uygulaması/i);
  expect(titleElement).toBeInTheDocument();
});
