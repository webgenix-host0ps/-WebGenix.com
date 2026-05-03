import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ClientDashboard from './pages/dashboards/ClientDashboard.jsx';
import TicketsList from './pages/TicketsList.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import CreateTicket from './pages/CreateTicket.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminTicketList from './pages/admin/AdminTicketList.jsx';
import AdminInvoiceList from './pages/admin/AdminInvoiceList.jsx';
import AdminLeadManagement from './pages/admin/LeadManagement.jsx';
import AdminUserManagement from './pages/admin/UserManagement.jsx';

import SupportDashboard from './pages/support/SupportDashboard.jsx';
import SupportTicketList from './pages/support/SupportTicketList.jsx';

import BillingDashboard from './pages/billing/BillingDashboard.jsx';
import BillingInvoiceList from './pages/billing/BillingInvoiceList.jsx';
import BillingTicketList from './pages/billing/BillingTicketList.jsx';

import LeadDashboard from './pages/leads/LeadDashboard.jsx';
import LeadManagement from './pages/leads/LeadManagement.jsx';

import Checkout from './pages/billing/Checkout.jsx';
import OrdersList from './pages/billing/OrdersList.jsx';
import InvoicesList from './pages/billing/InvoicesList.jsx';
import InvoiceDetail from './pages/billing/InvoiceDetail.jsx';
import ServicesList from './pages/billing/ServicesList.jsx';
import MyServices from './pages/services/MyServices.jsx';
import ServiceDetail from './pages/services/ServiceDetail.jsx';
import Settings from './pages/Settings.jsx';
import OrderSuccess from './pages/billing/OrderSuccess.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';

// Layout wrapper to conditionally show Navbar/Footer
function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].some(path =>
    location.pathname.startsWith(path)
  );
  const isDashboardRoute = [
    '/dashboard', '/admin', '/support', '/billing', '/leads', '/store', '/marketplace', '/checkout', '/orders', '/invoices', '/services', '/settings', '/order-success'
  ].some(path => location.pathname.startsWith(path));

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <main className={isDashboardRoute ? '' : 'main-webgenix'}>
        {children}
      </main>
      {!isAuthPage && !isDashboardRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Public Marketplace routes */}
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/store" element={<MarketplacePage />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

            {/* Client Billing routes */}
            <Route path="/orders" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><InvoicesList /></ProtectedRoute>} />
            <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><MyServices /></ProtectedRoute>} />
            <Route path="/services/:id" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
            <Route path="/my-services" element={<ProtectedRoute><MyServices /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/marketplace"
              element={
                <ProtectedRoute>
                  <MarketplacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <TicketsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/new"
              element={
                <ProtectedRoute>
                  <CreateTicket />
                </ProtectedRoute>
              }
            />
            <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />

            {/* Role-based Dashboards */}
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={['admin']}><AdminTicketList /></ProtectedRoute>} />
            <Route path="/admin/invoices" element={<ProtectedRoute allowedRoles={['admin']}><AdminInvoiceList /></ProtectedRoute>} />
            <Route path="/admin/leads" element={<ProtectedRoute allowedRoles={['admin']}><AdminLeadManagement /></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserManagement /></ProtectedRoute>} />
            
            {/* Support Routes */}
            <Route path="/support" element={<ProtectedRoute allowedRoles={['admin', 'support']}><SupportDashboard /></ProtectedRoute>} />
            <Route path="/support/tickets" element={<ProtectedRoute allowedRoles={['admin', 'support']}><SupportTicketList /></ProtectedRoute>} />
            
            {/* Billing Routes */}
            <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin', 'billing']}><BillingDashboard /></ProtectedRoute>} />
            <Route path="/billing/invoices" element={<ProtectedRoute allowedRoles={['admin', 'billing']}><BillingInvoiceList /></ProtectedRoute>} />
            <Route path="/billing/tickets" element={<ProtectedRoute allowedRoles={['admin', 'billing']}><BillingTicketList /></ProtectedRoute>} />
            
            {/* Lead Routes */}
            <Route path="/leads" element={<ProtectedRoute allowedRoles={['admin', 'lead']}><LeadDashboard /></ProtectedRoute>} />
            <Route path="/leads/pipeline" element={<ProtectedRoute allowedRoles={['admin', 'lead']}><LeadManagement /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}
