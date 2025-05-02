import { Switch, Route } from "wouter";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/dashboard";
import Conversations from "@/pages/conversations";
import Settings from "@/pages/settings";
import Reports from "@/pages/reports";
import Teams from "@/pages/teams";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <div className="min-h-screen dark">
      <DashboardLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/conversations" component={Conversations} />
          <Route path="/reports" component={Reports} />
          <Route path="/teams" component={Teams} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    </div>
  );
}

export default App;
