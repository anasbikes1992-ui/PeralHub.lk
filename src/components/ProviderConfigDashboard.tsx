import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Settings, AlertCircle } from "lucide-react";

interface ProviderConfig {
  id?: string;
  user_id: string;
  provider_type: "stay_provider" | "vehicle_provider" | "event_organizer" | "sme";
  business_name: string;
  registration_number: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  commission_rate: number;
  payment_partner: "lankaPay" | "manual" | "bank_transfer";
  status: "active" | "inactive" | "pending";
  verified: boolean;
  documents: string[];
  settings: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

const defaultConfig: Omit<ProviderConfig, "user_id"> = {
  provider_type: "stay_provider",
  business_name: "",
  registration_number: "",
  contact_person: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  city: "",
  country: "Sri Lanka",
  postal_code: "",
  commission_rate: 8.5,
  payment_partner: "lankaPay",
  status: "pending",
  verified: false,
  documents: [],
  settings: {}
};

const providerTypes = [
  { id: "stay_provider", label: "🏨 Stay Provider", description: "Accommodation/Hotel listings" },
  { id: "vehicle_provider", label: "🚗 Vehicle Provider", description: "Vehicle rental listings" },
  { id: "event_organizer", label: "🎭 Event Organizer", description: "Event & ticketing management" },
  { id: "sme", label: "🏪 SME Business", description: "Products & services marketplace" }
];

const commissionRates: Record<string, number> = {
  stay_provider: 8.5,
  vehicle_provider: 6.5,
  event_organizer: 8.5,
  sme: 5.0
};

export default function ProviderConfigDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeConfig, setActiveConfig] = useState<ProviderConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (user) {
      fetchProviderConfigs();
    }
  }, [user]);

  const fetchProviderConfigs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("provider_configs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
      
      // Set first config as active if exists
      if (data && data.length > 0) {
        setActiveConfig(data[0]);
        setSelectedType(data[0].provider_type);
      }
    } catch (error: any) {
      console.error("Error fetching configs:", error);
      setMessage(`Error loading configs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = (type: string) => {
    const newConfig: ProviderConfig = {
      ...defaultConfig,
      provider_type: type as any,
      user_id: user?.id || "",
      commission_rate: commissionRates[type] || 8.5,
      contact_email: profile?.email || "",
    };
    setActiveConfig(newConfig);
    setSelectedType(type);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user || !activeConfig) return;

    // Validate required fields
    if (!activeConfig.business_name?.trim()) {
      setMessage("Business name is required");
      return;
    }
    if (!activeConfig.contact_person?.trim()) {
      setMessage("Contact person is required");
      return;
    }
    if (!activeConfig.contact_phone?.trim()) {
      setMessage("Contact phone is required");
      return;
    }
    if (!activeConfig.address?.trim()) {
      setMessage("Address is required");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      if (activeConfig.id) {
        // Update existing
        const { error } = await supabase
          .from("provider_configs")
          .update({
            ...activeConfig,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activeConfig.id)
          .eq("user_id", user.id);

        if (error) throw error;
        setMessage("✅ Configuration updated successfully!");
      } else {
        // Create new
        const { data, error } = await supabase
          .from("provider_configs")
          .insert([
            {
              ...activeConfig,
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) throw error;
        setMessage("✅ Configuration created successfully!");
        if (data) {
          setActiveConfig(data[0]);
        }
      }

      fetchProviderConfigs();
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      console.error("Error saving config:", error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeConfig?.id || !confirm("Delete this provider configuration?")) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("provider_configs")
        .delete()
        .eq("id", activeConfig.id)
        .eq("user_id", user?.id);

      if (error) throw error;
      setMessage("✅ Configuration deleted!");
      fetchProviderConfigs();
      setActiveConfig(null);
      setSelectedType(null);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5" />
        <h2 className="text-2xl font-bold">Provider Configuration</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border flex gap-2 ${
          message.includes("✅") 
            ? "bg-emerald/10 border-emerald text-emerald" 
            : "bg-ruby/10 border-ruby text-ruby"
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Provider Type Selection */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-bold mb-4">Select Provider Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {providerTypes.map((type) => (
            <div key={type.id}>
              <button
                onClick={() => {
                  const config = configs.find(c => c.provider_type === type.id);
                  if (config) {
                    setActiveConfig(config);
                    setSelectedType(type.id);
                    setIsEditing(false);
                  } else if (isEditing || selectedType === type.id) {
                    handleCreateNew(type.id);
                  } else {
                    setSelectedType(type.id);
                    setIsEditing(true);
                  }
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedType === type.id
                    ? "border-sapphire bg-sapphire/5"
                    : "border-border hover:border-sapphire/50"
                }`}
              >
                <div className="font-semibold text-sm mb-1">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.description}</div>
                {configs.find(c => c.provider_type === type.id) && (
                  <div className="text-xs text-emerald mt-2">✓ Configured</div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Form */}
      {selectedType && (activeConfig || isEditing) && (
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">
              {activeConfig?.id ? "Edit" : "Add New"} {providerTypes.find(t => t.id === selectedType)?.label}
            </h3>
            {activeConfig?.status && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                activeConfig.status === "active" ? "bg-emerald/10 text-emerald" :
                activeConfig.status === "pending" ? "bg-sapphire/10 text-sapphire" :
                "bg-muted text-muted-foreground"
              }`}>
                {activeConfig.status.toUpperCase()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Information */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-sm mb-3 text-primary">Business Information</h4>
            </div>

            <div>
              <Label className="text-xs font-bold">Business Name *</Label>
              <Input
                placeholder="Enter business name"
                value={activeConfig?.business_name || ""}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, business_name: e.target.value } : null)}
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Registration Number</Label>
              <Input
                placeholder="Business/Company registration"
                value={activeConfig?.registration_number || ""}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, registration_number: e.target.value } : null)}
              />
            </div>

            {/* Contact Information */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-sm mb-3 text-primary mt-4">Contact Information</h4>
            </div>

            <div>
              <Label className="text-xs font-bold">Contact Person *</Label>
              <Input
                placeholder="Full name"
                value={activeConfig?.contact_person || ""}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, contact_person: e.target.value } : null)}
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Email</Label>
              <Input
                type="email"
                placeholder={profile?.email || "email@example.com"}
                value={activeConfig?.contact_email || ""}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, contact_email: e.target.value } : null)}
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Phone *</Label>
              <Input
                placeholder="+94XXXXXXXXX"
                value={activeConfig?.contact_phone || ""}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, contact_phone: e.target.value } : null)}
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Country</Label>
              <Input
                placeholder="Sri Lanka"
                value={activeConfig?.country || ""}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, country: e.target.value } : null)}
              />
            </div>

            {/* Address Information */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-sm mb-3 text-primary mt-4">Address Information</h4>
            </div>

            <div className="md:col-span-2">
              <Label className="text-xs font-bold">Address *</Label>
              <Input
                placeholder="Street address"
                value={activeConfig?.address || ""}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, address: e.target.value } : null)}
              />
            </div>

            <div>
              <Label className="text-xs font-bold">City</Label>
              <Input
                placeholder="City"
                value={activeConfig?.city || ""}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, city: e.target.value } : null)}
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Postal Code</Label>
              <Input
                placeholder="00000"
                value={activeConfig?.postal_code || ""}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, postal_code: e.target.value } : null)}
              />
            </div>

            {/* Commission & Payment */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-sm mb-3 text-primary mt-4">Commission & Payment</h4>
            </div>

            <div>
              <Label className="text-xs font-bold">Commission Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={activeConfig?.commission_rate || 8.5}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, commission_rate: parseFloat(e.target.value) } : null)}
              />
              <div className="text-xs text-muted-foreground mt-1">Default: {commissionRates[selectedType] || 8.5}%</div>
            </div>

            <div>
              <Label className="text-xs font-bold">Payment Partner</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card"
                value={activeConfig?.payment_partner || "lankaPay"}
                onChange={(e) => setActiveConfig(prev => prev ? { ...prev, payment_partner: e.target.value as any } : null)}
              >
                <option value="lankaPay">LankaPay</option>
                <option value="manual">Manual Transfer</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Verification Status (Admin Only) */}
            {isAdmin && (
              <>
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-sm mb-3 text-primary mt-4">Admin Settings</h4>
                </div>

                <div>
                  <Label className="text-xs font-bold">Status</Label>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card"
                    value={activeConfig?.status || "pending"}
                    onChange={(e) => setActiveConfig(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={activeConfig?.verified || false}
                    onChange={(e) => setActiveConfig(prev => prev ? { ...prev, verified: e.target.checked } : null)}
                  />
                  <Label htmlFor="verified" className="text-xs font-bold cursor-pointer">
                    Verified Provider
                  </Label>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            {activeConfig?.id && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-muted-foreground text-muted-foreground"
              >
                Cancel Edit
              </Button>
            )}
            {activeConfig?.id && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={saving}
                className="border-ruby text-ruby"
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-sapphire hover:bg-sapphire/90 text-pearl"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {activeConfig?.id ? "Update Configuration" : "Create Configuration"}
            </Button>
          </div>
        </div>
      )}

      {/* Existing Configurations List */}
      {configs.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-bold mb-4">Your Provider Configurations ({configs.length})</h3>
          <div className="space-y-3">
            {configs.map((config) => (
              <button
                key={config.id}
                onClick={() => {
                  setActiveConfig(config);
                  setSelectedType(config.provider_type);
                  setIsEditing(false);
                }}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  activeConfig?.id === config.id
                    ? "border-sapphire bg-sapphire/5"
                    : "border-border hover:border-sapphire/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-sm">
                      {providerTypes.find(t => t.id === config.provider_type)?.label}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {config.business_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {config.contact_person} • {config.contact_phone}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      config.status === "active" ? "bg-emerald/10 text-emerald" :
                      config.status === "pending" ? "bg-sapphire/10 text-sapphire" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {config.status}
                    </span>
                    {config.verified && <span className="text-xs font-bold text-emerald">✓ Verified</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
