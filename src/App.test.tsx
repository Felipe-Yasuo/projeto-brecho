import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RouterProvider } from "react-router-dom";
import { router } from "./App";

describe("App", () => {
    it("deve renderizar o título principal", () => {
        render(<RouterProvider router={router} />);
        expect(
            screen.getByText(/Roupas novas e seminovas em todo o Brasil/i)
        ).toBeInTheDocument();
    });
});
