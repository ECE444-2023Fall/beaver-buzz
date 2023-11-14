import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserContext from '../UserContext';

const AllTheProviders = ({ children }) => {
  // You can customize the user ID here for testing purposes
  const userId = 'mockedUserId';

  return (
    <MemoryRouter>
      <UserContext.Provider value={{ userId }}>
        {children}
      </UserContext.Provider>
    </MemoryRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
