import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Edit2, Loader2 } from "lucide-react";

interface ListStayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface StayListing {
  id?: string;
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  amenities: string[];
  images: string[];
  stayType: "star_hotel" | "villa" | "guest_house" | "hostel" | "lodge";
  rooms: number;
  maxGuests: number;
  rating: number;
}

const amenitiesList = [
  "WiFi", "Air Conditioning", "Swimming Pool", "Parking", "Gym",
  "Restaurant", "Bar", "Spa", "Gaming", "Library", "Laundry", "Room Service"
];

export default function ListStayModal({ open, onOpenChange, onSuccess }: ListStayModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<StayListing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StayListing>({
    title: "",
    description: "",
    pricePerNight: 0,
    location: "",
    amenities: [],
    images: [],
    stayType: "star_hotel",
    rooms: 1,
    maxGuests: 2,
    rating: 4.5,
  });

  // Check if user can list stays
  const canListStays = profile?.role === "stay_provider" || profile?.role === "admin";

  useEffect(() => {
    if (open && user) {
      fetchListings();
    }
  }, [open, user]);

  const fetchListings = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("stay_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) {
        setListings(data as StayListing[]);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canListStays) return;

    // Validate required fields
    if (!form.title?.trim()) {
      alert("Title is required");
      return;
    }
    if (!form.description?.trim()) {
      alert("Description is required");
      return;
    }
    if (form.pricePerNight <= 0) {
      alert("Price must be greater than 0");
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
      if (editingId) {
        // Update existing listing
        const { error } = await supabase
          .from("stay_listings")
          .update({
            title: form.title,
            description: form.description,
            price_per_night: form.pricePerNight,
            location: form.location,
            amenities: form.amenities,
            images: form.images,
            stay_type: form.stayType,
            rooms: form.rooms,
            max_guests: form.maxGuests,
            rating: form.rating,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (error) throw error;
        alert("Listing updated successfully!");
      } else {
        // Create new listing
        const { error } = await supabase
          .from("stay_listings")
          .insert([
            {
              title: form.title,
              description: form.description,
              price_per_night: form.pricePerNight,
              location: form.location,
              amenities: form.amenities,
              images: form.images,
              stay_type: form.stayType,
              rooms: form.rooms,
              max_guests: form.maxGuests,
              rating: form.rating,
              user_id: user.id,
              provider_name: profile?.full_name || "Anonymous",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (error) throw error;
        alert("Listing created successfully!");
      }

      // Reset form
      resetForm();
      fetchListings();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving listing:", error);
      alert(`Failed to save listing: ${error.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this listing?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("stay_listings")
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

  const handleEdit = (listing: StayListing) => {
    setForm(listing);
    setEditingId(listing.id || null);
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      pricePerNight: 0,
      location: "",
      amenities: [],
      images: [],
      stayType: "star_hotel",
      rooms: 1,
      maxGuests: 2,
      rating: 4.5,
    });
    setEditingId(null);
  };

  const toggleAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  if (!canListStays) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Stay Listing" : "List Your Stay"}</DialogTitle>
          <DialogDescription>
            Complete the form to list your accommodation on Pearl Hub
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">Title *</Label>
              <Input
                placeholder="e.g., Luxury Villa with Pool"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Stay Type *</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card"
                value={form.stayType}
                onChange={(e) => setForm({ ...form, stayType: e.target.value as any })}
              >
                <option value="star_hotel">⭐ Star Hotel</option>
                <option value="villa">🏡 Villa</option>
                <option value="guest_house">🏠 Guest House</option>
                <option value="hostel">🏢 Hostel</option>
                <option value="lodge">🏔️ Lodge</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-bold">Description *</Label>
            <textarea
              placeholder="Tell guests about your property..."
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card min-h-24"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">Location *</Label>
              <Input
                placeholder="e.g., Colombo, Kandy"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Price Per Night (Rs.) *</Label>
              <Input
                type="number"
                placeholder="5000"
                value={form.pricePerNight || ""}
                onChange={(e) => setForm({ ...form, pricePerNight: parseFloat(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Rooms *</Label>
              <Input
                type="number"
                value={form.rooms || 1}
                onChange={(e) => setForm({ ...form, rooms: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Max Guests *</Label>
              <Input
                type="number"
                value={form.maxGuests || 2}
                onChange={(e) => setForm({ ...form, maxGuests: parseInt(e.target.value) || 2 })}
                min="1"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <Label className="text-xs font-bold mb-2 block">Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                    form.amenities.includes(amenity)
                      ? "bg-sapphire text-pearl border-sapphire"
                      : "bg-card border-input hover:border-sapphire"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-xs font-bold mb-2 block">Images *</Label>
            <ImageUpload
              bucket="listings"
              onUpload={(urls) => setForm({ ...form, images: urls })}
              maxFiles={5}
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
              disabled={loading || !form.title || !form.description}
              className="bg-sapphire hover:bg-sapphire/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? "Update Listing" : "List Stay"}
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
                  className="p-3 bg-card border border-border rounded-lg flex justify-between items-start hover:border-sapphire transition-all"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{listing.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {listing.location} • Rs. {listing.pricePerNight.toLocaleString()}/night
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(listing)}
                      className="p-1.5 hover:bg-sapphire/10 rounded transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-sapphire" />
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
