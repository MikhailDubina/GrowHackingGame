import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TelegramProvider } from "./contexts/TelegramContext";
import Home from "./pages/Home";

import Shop from "./pages/Shop";
import Transparency from "./pages/Transparency";
import TreasureHunt from "./pages/TreasureHuntNew";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import MatchThree from "./pages/MatchThree";
import DemoLoginPage from "./pages/DemoLoginPage";
import Challenges from "./pages/Challenges";
import Achievements from './pages/Achievements';
import Divisions from './pages/Divisions';
import Reviews from './pages/Reviews';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import AmlPolicy from './pages/legal/AmlPolicy';
import KycPolicy from './pages/legal/KycPolicy';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import ResponsibleGaming from './pages/legal/ResponsibleGaming';
import SelfExclusionPolicy from './pages/legal/SelfExclusionPolicy';
import Slots from './pages/Slots';
import Referral from './pages/Referral';
import Register from './pages/Register';
import Login from './pages/Login';
import Welcome from './pages/Welcome';

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Welcome} />
      <Route path={"/home"} component={Home} />
      <Route path={"/register"} component={Register} />
      <Route path={"/login"} component={Login} />

      <Route path={"/shop"} component={Shop} />
      <Route path={"/transparency"} component={Transparency} />
      <Route path={"/treasure-hunt"} component={TreasureHunt} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/match-three"} component={MatchThree} />
      <Route path={"/demo-login"} component={DemoLoginPage} />
      <Route path={"/challenges"} component={Challenges} />
      <Route path={"/achievements"} component={Achievements} />      <Route path={"/divisions"} component={Divisions} />
      <Route path={"/reviews"} component={Reviews} />
      <Route path={"/legal/privacy"} component={PrivacyPolicy} />
      <Route path={"/legal/aml"} component={AmlPolicy} />
      <Route path={"/legal/kyc"} component={KycPolicy} />
      <Route path={"/legal/terms"} component={TermsAndConditions} />
      <Route path={"/legal/responsible-gaming"} component={ResponsibleGaming} />
      <Route path={"/legal/self-exclusion"} component={SelfExclusionPolicy} />
      <Route path={"/slots"} component={Slots} />
      <Route path={"/referral"} component={Referral} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <TelegramProvider>
        <ThemeProvider
          defaultTheme="dark"
          // switchable
        >
          <TooltipProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
                className: 'hidden md:flex',
                style: {
                  display: 'none',
                },
              }}
              className="hidden md:block"
            />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </TelegramProvider>
    </ErrorBoundary>
  );
}

export default App;
