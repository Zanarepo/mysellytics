import React, { createContext, useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import HomePage from "./component/HomePage";
import Navbar from "./component/Navbar";
import LandingFooterLayout from "./component/LandingFooterLayout";
import Registration from "./component/Auth/Registration";
import Login from "./component/Auth/Login";
import Forgotpassword from "./component/Auth/Forgotpassword";
import ResetPassword from "./component/Auth/ResetPassword";
import TeamSignup from "./component/Auth/TeamSignup";
import AdminRegistration from "./component/Auth/AdminRegistration";
import Admins from "./component/AdminAuth/Admins";
import AdminHome from "./component/AdminDashboard/AdminHome";
import UserHomepage from "./component/UserDashboard/UserHomepage";
import StoreUsersHome from "./component/UserDashboard/StoreUsersHome";
import SalesMetrics from "./component/UserDashboard/SalesMetrics";
import PoductPurchaseCost from "./component/UserDashboard/ProductsPurchaseCost";
import MainDashboard from "./component/UserDashboard/Simplex";
import SalesTracker from "./component/UserDashboard/SalesTracker";
import StoresAdmin from "./component/Ops/StoresAdmin";
import Profile from "./component/UserDashboard/Profile";
import SellyticsPayment from "./component/Payments/SellyticsPayment";
import PremiumHomepage from "./component/Premiums/PremiumHomepage";
import SignaturePad from "./component/VariexContents/SignaturePad";
import Tools from "./component/Tools";
import Test from "./component/UserDashboard/Test";

// Theme Context
export const ThemeContext = createContext();

function LandingLayout() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const themeValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className={`flex flex-col min-h-screen ${theme === "dark" ? "dark" : ""}`}>
        <Navbar />
        <div className="flex-grow bg-white dark:bg-gray-900 dark:text-white">
          <div className="container mx-auto px-4">
            <Outlet />
          </div>
        </div>
        <LandingFooterLayout />
      </div>
    </ThemeContext.Provider>
  );
}

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            {/* Routes with LandingLayout (Navbar, LandingFooterLayout, and Theme) */}
            <Route element={<LandingLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<Forgotpassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/team-signup" element={<TeamSignup />} />
              <Route path="/adminregister" element={<AdminRegistration />} />
            </Route>

            {/* Standalone routes without layouts or navbars */}
            <Route path="/admin" element={<Admins />} />
            <Route path="/dashboard" element={<UserHomepage />} />
            <Route path="/admin-dashboard" element={<AdminHome />} />
            <Route path="/team-dashboard" element={<StoreUsersHome />} />
            <Route path="/sales-metrics" element={<SalesMetrics />} />
            <Route path="/product-cost" element={<PoductPurchaseCost />} />
            <Route path="/main" element={<MainDashboard />} />
            <Route path="/salestrack" element={<SalesTracker />} />
            <Route path="/owner-dashboard" element={<StoresAdmin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment" element={<SellyticsPayment />} />
            <Route path="/premiumdashboard" element={<PremiumHomepage />} />
            <Route path="/signaturepad" element={<SignaturePad />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/test" element={<Test />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;