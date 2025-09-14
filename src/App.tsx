import { createHashRouter } from "react-router-dom";
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Dashboard } from "./pages/dashboard";
import { New } from "./pages/dashboard/new";
import { ClothingDetail } from "./pages/clothing";

import { Layout } from "./components/layout";
import { Private } from "./routes/Private";


const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/clothing/:id", element: <ClothingDetail /> },
      { path: "/dashboard", element: <Private><Dashboard /></Private> },
      { path: "/dashboard/new", element: <Private><New /></Private> },
    ]
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> }
]);

export { router };
