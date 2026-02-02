import { Navigate } from "react-router-dom";

// Settings has been merged with My Account
// Redirect any old Settings links to the unified page
const Settings = () => {
  return <Navigate to="/my-account" replace />;
};

export default Settings;
