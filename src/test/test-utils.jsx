import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

export function renderWithRouter(ui, { route = "/", path = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>
  );
}
