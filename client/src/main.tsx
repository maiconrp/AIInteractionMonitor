import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { WebSocketProvider } from "./provider/WebSocketProvider";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <WebSocketProvider>
      <App />
      <Toaster />
    </WebSocketProvider>
  </QueryClientProvider>
);
