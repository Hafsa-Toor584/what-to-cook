import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Browse from './pages/Browse';
import ForgotPassword from './pages/ForgotPassword';
import GroceryList from './pages/GroceryList';
import GuestPlan from './pages/GuestPlan';
import Home from './pages/Home';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import PlanBuilder from './pages/PlanBuilder';
import Plans from './pages/Plans';
import Profile from './pages/Profile';
import RecipeDetail from './pages/RecipeDetail';
import Register from './pages/Register';
import Wizard from './pages/Wizard';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/new/guest" element={<GuestPlan />} />
          <Route path="/plans/new/:type" element={<PlanBuilder />} />
          <Route path="/plans/:id" element={<PlanBuilder />} />
          <Route path="/plans/:id/groceries" element={<GroceryList />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
