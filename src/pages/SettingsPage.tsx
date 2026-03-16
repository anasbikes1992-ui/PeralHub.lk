import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

const SettingsPage = () => {
  const { showToast, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy & Security", icon: "🔒" },
    { id: "billing", label: "Billing", icon: "💳" },
    { id: "terms", label: "Terms & Conditions", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-slate to-obsidian py-10">
        <div className="container">
          <h1 className="text-pearl text-3xl">Settings</h1>
          <p className="text-fog mt-1.5">Manage your account preferences</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8 flex-col md:flex-row">
          {/* Tabs */}
          <div className="md:w-56 flex-shrink-0">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-left whitespace-nowrap transition-all ${
                    activeTab === t.id ? "bg-primary/10 text-gold-dark font-semibold" : "text-muted-foreground hover:bg-background"
                  }`}>{t.icon} {t.label}</button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            {activeTab === "general" && (
              <div>
                <h2 className="text-xl mb-4">General Settings</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div><label className="block text-xs font-semibold mb-1">Display Name</label><input defaultValue="Ashan Perera" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-semibold mb-1">Language</label>
                      <select className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card"><option>English</option><option>සිංහල</option><option>தமிழ்</option></select>
                    </div>
                    <div><label className="block text-xs font-semibold mb-1">Currency</label>
                      <select className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card"><option>LKR (Rs.)</option><option>USD ($)</option></select>
                    </div>
                    <div><label className="block text-xs font-semibold mb-1">Timezone</label>
                      <select className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card"><option>Asia/Colombo (GMT+5:30)</option></select>
                    </div>
                  </div>
                  <button onClick={() => showToast("Settings saved!", "success")} className="bg-primary hover:bg-gold-light text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm transition-all">Save Changes</button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h2 className="text-xl mb-4">Notification Preferences</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  {[
                    { label: "Email Notifications", desc: "Receive booking confirmations and updates via email", default: true },
                    { label: "SMS Notifications", desc: "Get SMS alerts for bookings and important updates", default: true },
                    { label: "Push Notifications", desc: "Browser push notifications for new listings and offers", default: false },
                    { label: "Marketing Emails", desc: "Promotional offers and newsletter", default: false },
                    { label: "Price Drop Alerts", desc: "Get notified when saved property prices change", default: true },
                  ].map((item, i) => (
                    <div key={item.label} className={`flex items-center justify-between py-4 ${i > 0 ? "border-t border-border" : ""}`}>
                      <div><div className="font-semibold text-sm">{item.label}</div><div className="text-xs text-muted-foreground">{item.desc}</div></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                        <div className="w-11 h-6 bg-pearl-dark peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div>
                <h2 className="text-xl mb-4">Privacy & Security</h2>
                <div className="flex flex-col gap-4">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-base mb-3">Change Password</h3>
                    <div className="flex flex-col gap-3">
                      <div><label className="block text-xs font-semibold mb-1">Current Password</label><input type="password" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                      <div><label className="block text-xs font-semibold mb-1">New Password</label><input type="password" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                      <div><label className="block text-xs font-semibold mb-1">Confirm New Password</label><input type="password" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                      <button onClick={() => showToast("Password updated!", "success")} className="bg-primary hover:bg-gold-light text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm self-start transition-all">Update Password</button>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-base mb-3">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-3">Add an extra layer of security to your account.</p>
                    <button className="bg-emerald hover:bg-emerald-light text-pearl px-6 py-2.5 rounded-lg font-bold text-sm transition-all">Enable 2FA</button>
                  </div>
                  <div className="bg-card rounded-xl p-6 border border-border border-ruby/30">
                    <h3 className="text-base mb-2 text-ruby">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-3">Permanently delete your account and all associated data.</p>
                    <button className="bg-ruby hover:bg-ruby-light text-pearl px-6 py-2.5 rounded-lg font-bold text-sm transition-all">Delete Account</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div>
                <h2 className="text-xl mb-4">Billing & Payments</h2>
                <div className="bg-card rounded-xl p-6 border border-border mb-4">
                  <h3 className="text-base mb-3">Payment Methods</h3>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg mb-3">
                    <span className="text-2xl">💳</span>
                    <div className="flex-1"><div className="font-semibold text-sm">Visa ending in 4242</div><div className="text-xs text-muted-foreground">Expires 12/2025</div></div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald/10 text-emerald">Default</span>
                  </div>
                  <button className="text-sm text-primary font-semibold">+ Add Payment Method</button>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="text-base mb-3">Billing History</h3>
                  {[
                    { date: "Feb 1, 2024", desc: "Broker Membership – Monthly", amount: "Rs. 23,000" },
                    { date: "Jan 15, 2024", desc: "Property Listing Fee", amount: "Rs. 1,000" },
                    { date: "Jan 1, 2024", desc: "Broker Membership – Monthly", amount: "Rs. 23,000" },
                  ].map((item, i) => (
                    <div key={i} className={`flex justify-between items-center py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                      <div><div className="text-sm font-medium">{item.desc}</div><div className="text-xs text-muted-foreground">{item.date}</div></div>
                      <div className="font-bold text-sm">{item.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div>
                <h2 className="text-xl mb-4">Terms & Conditions</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <h3 className="text-foreground">Pearl Hub Platform Terms of Service</h3>
                    <p>By using Pearl Hub Platform, you agree to the following terms:</p>
                    <p><strong className="text-foreground">1. Accuracy of Information:</strong> All details submitted must be accurate and truthful. Pearl Hub reserves the right to remove listings with incorrect information.</p>
                    <p><strong className="text-foreground">2. Document Verification:</strong> Pearl Hub requires NIC and deed documentation solely for verification purposes.</p>
                    <p><strong className="text-foreground">3. Commission & Fees:</strong> Owner listings are charged Rs. 1,000 per listing plus 2% commission on confirmed sales. Broker membership is Rs. 23,000/month for 65 listings with no sale commission.</p>
                    <p><strong className="text-foreground">4. Promo Code System:</strong> Owners agree to generate and provide promo codes to verified buyers, enabling the 0.5% buyer discount funded by Pearl Hub.</p>
                    <p><strong className="text-foreground">5. Indemnification:</strong> Users agree to indemnify Pearl Hub from any claims arising from their listings or transactions.</p>
                    <p><strong className="text-foreground">6. Governing Law:</strong> This agreement is governed by the laws of the Democratic Socialist Republic of Sri Lanka.</p>
                    <p><strong className="text-foreground">7. Privacy:</strong> Your data is handled per our Privacy Policy. We do not sell personal information to third parties.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
