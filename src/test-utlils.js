// __tests__/test-utils.js
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const customRender = (ui, options) =>
  render(ui, { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>, ...options });

export * from "@testing-library/react";
export { customRender as render };
