import { Switch, Route } from "wouter";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/dashboard";
import Conversations from "@/pages/conversations";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <div className="min-h-screen dark">
      <DashboardLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/conversations" component={Conversations} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    </div>
  );
}

export default App;
