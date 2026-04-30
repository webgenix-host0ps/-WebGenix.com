import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Save, 
  Loader2, 
  Check,
  Shield,
  CreditCard,
  Bell,
  Lock
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      const user = response.data?.user || response.data;
      
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          company: user.clientProfile?.company || '',
          gstin: user.clientProfile?.gstin || '',
          address: user.clientProfile?.billingAddress?.line1 || '',
          city: user.clientProfile?.billingAddress?.city || '',
          state: user.clientProfile?.billingAddress?.state || '',
          pincode: user.clientProfile?.billingAddress?.pincode || '',
          country: user.clientProfile?.billingAddress?.country || 'India'
        });
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      // Fallback to stored user
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setFormData({
          name: storedUser.name || '',
          email: storedUser.email || '',
          phone: storedUser.phone || '',
          company: storedUser.clientProfile?.company || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const profileData = {
        name: formData.name,
        phone: formData.phone,
        clientProfile: {
          company: formData.company,
          gstin: formData.gstin,
          billingAddress: {
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: formData.country
          }
        }
      };

      await authService.updateProfile(profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-text-primary py-8">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'text-text-secondary hover:bg-dark-800'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </button>
              
              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'billing' 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'text-text-secondary hover:bg-dark-800'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Billing</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'security' 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'text-text-secondary hover:bg-dark-800'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Security</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'notifications' 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'text-text-secondary hover:bg-dark-800'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Profile Information</h2>
                    <p className="text-text-secondary text-sm">Update your personal and business details</p>
                  </div>
                </div>

                {message.text && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${
                    message.type === 'success' 
                      ? 'bg-success/10 border border-success/30 text-success' 
                      : 'bg-error/10 border border-error/30 text-error'
                  }`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full pl-10 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-text-muted cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="space-y-4 pt-4 border-t border-dark-700">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Business Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Company Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Your Company Ltd"
                            className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-text-secondary mb-2">GSTIN</label>
                        <input
                          type="text"
                          name="gstin"
                          value={formData.gstin}
                          onChange={handleChange}
                          placeholder="22AAAAA0000A1Z5"
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="space-y-4 pt-4 border-t border-dark-700">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Billing Address</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Street Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Business Street, Sector 5"
                            className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm text-text-secondary mb-2">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Mumbai"
                            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-text-secondary mb-2">State</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Maharashtra"
                            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-text-secondary mb-2">Pincode</label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="400001"
                            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-text-secondary mb-2">Country</label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-dark-700">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Billing Settings</h2>
                    <p className="text-text-secondary text-sm">Manage your payment methods and billing preferences</p>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <p className="text-text-secondary">Billing settings coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Security Settings</h2>
                    <p className="text-text-secondary text-sm">Manage your password and security preferences</p>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <p className="text-text-secondary">Security settings coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Notification Preferences</h2>
                    <p className="text-text-secondary text-sm">Choose how you want to be notified</p>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <p className="text-text-secondary">Notification settings coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
