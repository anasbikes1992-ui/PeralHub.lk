import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Edit2, Loader2 } from "lucide-react";

interface ListVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface VehicleListing {
  id?: string;
  make: string;
  model: string;
  year: number;
  type: "car" | "van" | "jeep" | "bus" | "luxury_coach";
  dailyRate: number;
  seats: number;
  fuel: "petrol" | "diesel" | "hybrid" | "electric";
  transmission: "manual" | "automatic";
  location: string;
  description: string;
  images: string[];
  ac: boolean;
  driver: "included" | "optional";
  kmIncluded: number;
  excessKmRate: number;
}

export default function ListVehicleModal({ open, onOpenChange, onSuccess }: ListVehicleModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleListing>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    type: "car",
    dailyRate: 0,
    seats: 5,
    fuel: "petrol",
    transmission: "automatic",
    location: "",
    description: "",
    images: [],
    ac: true,
    driver: "optional",
    kmIncluded: 100,
    excessKmRate: 0,
  });

  // Check if user can list vehicles
  const canListVehicles = profile?.role === "vehicle_provider" || profile?.role === "admin";

  useEffect(() => {
    if (open && user) {
      fetchListings();
    }
  }, [open, user]);

  const fetchListings = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("vehicle_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) {
        setListings(data as VehicleListing[]);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canListVehicles) return;

    // Validate required fields
    if (!form.make?.trim()) {
      alert("Make is required");
      return;
    }
    if (!form.model?.trim()) {
      alert("Model is required");
      return;
    }
    if (form.year < 1900 || form.year > new Date().getFullYear() + 1) {
      alert("Year is invalid");
      return;
    }
    if (form.dailyRate <= 0) {
      alert("Daily rate must be greater than 0");
      return;
    }
    if (!form.location?.trim()) {
      alert("Location is required");
      return;
    }
    if (form.images.length === 0) {
      alert("At least one image is required");
      return;
    }

    setLoading(true);
    try {
      // Calculate excess KM rate if not provided
      const excessRate = form.excessKmRate || Math.round(form.dailyRate * 0.05);

      if (editingId) {
        // Update existing listing
        const { error } = await supabase
          .from("vehicle_listings")
          .update({
            make: form.make,
            model: form.model,
            year: form.year,
            vehicle_type: form.type,
            daily_rate: form.dailyRate,
            seats: form.seats,
            fuel: form.fuel,
            transmission: form.transmission,
            location: form.location,
            description: form.description,
            images: form.images,
            ac: form.ac,
            driver_availability: form.driver,
            km_included: form.kmIncluded,
            excess_km_rate: excessRate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (error) throw error;
        alert("Vehicle listing updated successfully!");
      } else {
        // Create new listing
        const { error } = await supabase
          .from("vehicle_listings")
          .insert([
            {
              make: form.make,
              model: form.model,
              year: form.year,
              vehicle_type: form.type,
              daily_rate: form.dailyRate,
              seats: form.seats,
              fuel: form.fuel,
              transmission: form.transmission,
              location: form.location,
              description: form.description,
              images: form.images,
              ac: form.ac,
              driver_availability: form.driver,
              km_included: form.kmIncluded,
              excess_km_rate: excessRate,
              user_id: user.id,
              provider_name: profile?.full_name || "Anonymous",
              rating: 4.8,
              trips: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (error) throw error;
        alert("Vehicle listing created successfully!");
      }

      // Reset form
      resetForm();
      fetchListings();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving vehicle listing:", error);
      alert(`Failed to save vehicle listing: ${error.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this vehicle listing?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("vehicle_listings")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      fetchListings();
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing: VehicleListing) => {
    setForm(listing);
    setEditingId(listing.id || null);
  };

  const resetForm = () => {
    setForm({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      type: "car",
      dailyRate: 0,
      seats: 5,
      fuel: "petrol",
      transmission: "automatic",
      location: "",
      description: "",
      images: [],
      ac: true,
      driver: "optional",
      kmIncluded: 100,
      excessKmRate: 0,
    });
    setEditingId(null);
  };

  if (!canListVehicles) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Vehicle Listing" : "List Your Vehicle"}</DialogTitle>
          <DialogDescription>
            Complete the form to list your vehicle on Pearl Hub
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">Make *</Label>
              <Input
                placeholder="e.g., Toyota"
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Model *</Label>
              <Input
                placeholder="e.g., Fortuner"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Year *</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                min="2000"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Vehicle Type *</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              >
                <option value="car">🚗 Car</option>
                <option value="van">🚐 Van</option>
                <option value="jeep">🚙 Jeep</option>
                <option value="bus">🚌 Bus</option>
                <option value="luxury_coach">🎖️ Luxury Coach</option>
              </select>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">Seats *</Label>
              <Input
                type="number"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Fuel Type *</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card"
                value={form.fuel}
                onChange={(e) => setForm({ ...form, fuel: e.target.value as any })}
              >
                <option value="petrol">⛽ Petrol</option>
                <option value="diesel">🛢️ Diesel</option>
                <option value="hybrid">♻️ Hybrid</option>
                <option value="electric">⚡ Electric</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-bold">Transmission *</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card"
                value={form.transmission}
                onChange={(e) => setForm({ ...form, transmission: e.target.value as any })}
              >
                <option value="automatic">⚙️ Automatic</option>
                <option value="manual">🔧 Manual</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-bold">
                <input
                  type="checkbox"
                  checked={form.ac}
                  onChange={(e) => setForm({ ...form, ac: e.target.checked })}
                  className="mr-2"
                />
                Air Conditioning
              </Label>
            </div>
          </div>

          {/* Pricing & Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">Daily Rate (Rs.) *</Label>
              <Input
                type="number"
                placeholder="5000"
                value={form.dailyRate || ""}
                onChange={(e) => setForm({ ...form, dailyRate: parseFloat(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">KM Included Per Day</Label>
              <Input
                type="number"
                value={form.kmIncluded}
                onChange={(e) => setForm({ ...form, kmIncluded: parseInt(e.target.value) || 100 })}
                min="0"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Driver Availability</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card"
                value={form.driver}
                onChange={(e) => setForm({ ...form, driver: e.target.value as any })}
              >
                <option value="included">👤 Included</option>
                <option value="optional">👥 Optional</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-bold">Location *</Label>
              <Input
                placeholder="e.g., Colombo"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-bold">Description *</Label>
            <textarea
              placeholder="Describe the condition, accessories, and special features..."
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card min-h-20"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-xs font-bold mb-2 block">Images *</Label>
            <ImageUpload
              bucket="listings"
              onUpload={(urls) => setForm({ ...form, images: urls })}
              maxFiles={6}
              existingUrls={form.images}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 justify-end">
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => resetForm()}
              >
                Cancel Edit
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={loading || !form.make || !form.model}
              className="bg-ruby hover:bg-ruby/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? "Update Listing" : "List Vehicle"}
            </Button>
          </div>
        </form>

        {/* Existing Listings */}
        {listings.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-bold mb-3">Your Listings ({listings.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="p-3 bg-card border border-border rounded-lg flex justify-between items-start hover:border-ruby transition-all"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {listing.year} {listing.make} {listing.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {listing.location} • Rs. {listing.dailyRate.toLocaleString()}/day
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(listing)}
                      className="p-1.5 hover:bg-ruby/10 rounded transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-ruby" />
                    </button>
                    <button
                      onClick={() => listing.id && handleDelete(listing.id)}
                      className="p-1.5 hover:bg-ruby/10 rounded transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-ruby" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
