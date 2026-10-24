import { createBrowserRouter, RouterProvider } from "react-router";

import Layout from "./components/layout/Layout";
// import Home from "./pages/Home";
import NewChat from "./pages/NewChat";
import Chat from "./pages/Chat";
import Library from "./pages/Library";
import Settings from "./pages/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: NewChat },
      { path: "chat/new", Component: NewChat },
      { path: "chat/:chatId", Component: Chat },
      { path: "library", Component: Library },
      { path: "settings", Component: Settings },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
