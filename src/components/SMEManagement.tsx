import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Edit2, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SMEListing {
  id: string;
  business_name: string;
  category: string;
  description: string;
  location: string;
  service_type: string;
  rating: number;
  status: string;
  created_at: string;
}

export default function SMEManagement() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<SMEListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_name: "",
    category: "retail",
    description: "",
    location: "",
    service_type: "products",
  });

  // Check if user can list SME services
  const canListSME = profile?.role === "sme" || profile?.role === "admin";

  useEffect(() => {
    if (canListSME && user) {
      fetchListings();
    }
  }, [user, profile]);

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("sme_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setListings(data || []);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load SME listings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.business_name.trim()) {
      alert("Business name is required");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from("sme_listings")
          .update({
            business_name: form.business_name,
            category: form.category,
            description: form.description,
            location: form.location,
            service_type: form.service_type,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (updateError) throw updateError;
        alert("SME listing updated successfully!");
      } else {
        const { error: insertError } = await supabase
          .from("sme_listings")
          .insert([
            {
              business_name: form.business_name,
              category: form.category,
              description: form.description,
              location: form.location,
              service_type: form.service_type,
              user_id: user.id,
              status: "active",
              rating: 4.5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (insertError) throw insertError;
        alert("SME listing created successfully!");
      }

      resetForm();
      fetchListings();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving listing:", err);
      alert(`Failed to save listing: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    if (!user) return;

    setDeleting(id);
    try {
      const { error: deleteError } = await supabase
        .from("sme_listings")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete listing.");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (listing: SMEListing) => {
    setForm({
      business_name: listing.business_name,
      category: listing.category,
      description: listing.description,
      location: listing.location,
      service_type: listing.service_type,
    });
    setEditingId(listing.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      business_name: "",
      category: "retail",
      description: "",
      location: "",
      service_type: "products",
    });
    setEditingId(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  if (!canListSME) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🏪 My SME Services
          {listings.length > 0 && (
            <span className="text-sm bg-orange/20 text-orange px-2 py-0.5 rounded-full">
              {listings.length}
            </span>
          )}
        </h2>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          size="sm"
          className="bg-orange hover:bg-orange/90 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Service
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold">Business Name *</Label>
                <Input
                  placeholder="Your business name"
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Category</Label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="retail">Retail</option>
                  <option value="services">Services</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="trading">Trading</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="technology">Technology</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label className="text-xs font-bold">Service Type</Label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card"
                  value={form.service_type}
                  onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                >
                  <option value="products">Products</option>
                  <option value="services">Services</option>
                  <option value="both">Both Products & Services</option>
                </select>
              </div>
              <div>
                <Label className="text-xs font-bold">Location</Label>
                <Input
                  placeholder="City, Province"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold">Description</Label>
              <textarea
                placeholder="Tell us about your business..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-orange hover:bg-orange/90 text-white" size="sm">
                {editingId ? "Update Service" : "Create Service"}
              </Button>
              <Button
                type="button"
                onClick={handleCloseForm}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-orange" />
          <span className="ml-2 text-muted-foreground">Loading services...</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-3">No services registered yet</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-orange hover:bg-orange/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Service
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div
              key={listing.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-orange/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{listing.business_name}</h3>
                    <span className="text-xs bg-orange/10 text-orange px-2 py-0.5 rounded">
                      {listing.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{listing.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>📍 {listing.location}</span>
                    <span>{listing.service_type}</span>
                    <span>⭐ {listing.rating}</span>
                    <span className={`px-2 py-0.5 rounded ${
                      listing.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 text-gray-700"
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(listing)}
                    className="p-2 hover:bg-orange/10 rounded-lg text-orange transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deleting === listing.id}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === listing.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
