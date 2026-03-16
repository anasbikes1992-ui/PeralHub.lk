import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Edit2, Loader2 } from "lucide-react";

interface ListEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface EventListing {
  id?: string;
  title: string;
  category: "cinema" | "concert" | "sports" | "theater" | "conference";
  date: string;
  time: string;
  venue: string;
  location: string;
  description: string;
  images: string[];
  capacity: number;
  standardPrice: number;
  premiumPrice: number;
  vipPrice: number;
}

export default function ListEventModal({ open, onOpenChange, onSuccess }: ListEventModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<EventListing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventListing>({
    title: "",
    category: "cinema",
    date: "",
    time: "18:00",
    venue: "",
    location: "",
    description: "",
    images: [],
    capacity: 500,
    standardPrice: 500,
    premiumPrice: 1000,
    vipPrice: 2000,
  });

  // Check if user can list events
  const canListEvents = profile?.role === "event_organizer" || profile?.role === "admin";

  useEffect(() => {
    if (open && user) {
      fetchListings();
    }
  }, [open, user]);

  const fetchListings = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("event_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) {
        setListings(data as EventListing[]);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canListEvents) return;

    // Validate required fields
    if (!form.title?.trim()) {
      alert("Event title is required");
      return;
    }
    if (!form.date) {
      alert("Event date is required");
      return;
    }
    if (!form.venue?.trim()) {
      alert("Venue is required");
      return;
    }
    if (!form.location?.trim()) {
      alert("Location is required");
      return;
    }
    if (form.capacity <= 0) {
      alert("Capacity must be greater than 0");
      return;
    }
    if (form.standardPrice <= 0) {
      alert("Standard price must be greater than 0");
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
          .from("event_listings")
          .update({
            title: form.title,
            category: form.category,
            event_date: form.date,
            event_time: form.time,
            venue: form.venue,
            location: form.location,
            description: form.description,
            images: form.images,
            capacity: form.capacity,
            standard_price: form.standardPrice,
            premium_price: form.premiumPrice,
            vip_price: form.vipPrice,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (error) throw error;
        alert("Event updated successfully!");
      } else {
        // Create new listing
        const { error } = await supabase
          .from("event_listings")
          .insert([
            {
              title: form.title,
              category: form.category,
              event_date: form.date,
              event_time: form.time,
              venue: form.venue,
              location: form.location,
              description: form.description,
              images: form.images,
              capacity: form.capacity,
              standard_price: form.standardPrice,
              premium_price: form.premiumPrice,
              vip_price: form.vipPrice,
              user_id: user.id,
              organizer_name: profile?.full_name || "Anonymous",
              booked_seats: JSON.stringify([]),
              rating: 4.8,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (error) throw error;
        alert("Event created successfully!");
      }

      // Reset form
      resetForm();
      fetchListings();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving event:", error);
      alert(`Failed to save event: ${error.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this event?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("event_listings")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      fetchListings();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing: EventListing) => {
    setForm(listing);
    setEditingId(listing.id || null);
  };

  const resetForm = () => {
    setForm({
      title: "",
      category: "cinema",
      date: "",
      time: "18:00",
      venue: "",
      location: "",
      description: "",
      images: [],
      capacity: 500,
      standardPrice: 500,
      premiumPrice: 1000,
      vipPrice: 2000,
    });
    setEditingId(null);
  };

  if (!canListEvents) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            Complete the form to list your event on Pearl Hub
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">Event Title *</Label>
              <Input
                placeholder="e.g., Avengers Endgame"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Category *</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
              >
                <option value="cinema">🎬 Cinema</option>
                <option value="concert">🎵 Concert</option>
                <option value="sports">🏏 Sports</option>
                <option value="theater">🎭 Theater</option>
                <option value="conference">🎤 Conference</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Start Time *</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Venue Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">Venue Name *</Label>
              <Input
                placeholder="e.g., Cineplex Colombo"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Location/City *</Label>
              <Input
                placeholder="e.g., Colombo"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <Label className="text-xs font-bold">Total Capacity *</Label>
            <Input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 500 })}
              min="50"
              required
            />
          </div>

          {/* Ticket Pricing */}
          <div>
            <Label className="text-xs font-bold mb-2 block">Ticket Prices (Rs.)</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px]">Standard</Label>
                <Input
                  type="number"
                  value={form.standardPrice || ""}
                  onChange={(e) => setForm({ ...form, standardPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="500"
                  min="0"
                />
              </div>
              <div>
                <Label className="text-[11px]">Premium</Label>
                <Input
                  type="number"
                  value={form.premiumPrice || ""}
                  onChange={(e) => setForm({ ...form, premiumPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="1000"
                  min="0"
                />
              </div>
              <div>
                <Label className="text-[11px]">VIP</Label>
                <Input
                  type="number"
                  value={form.vipPrice || ""}
                  onChange={(e) => setForm({ ...form, vipPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="2000"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-bold">Description *</Label>
            <textarea
              placeholder="Describe the event, plot, performers, etc..."
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card min-h-20"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-xs font-bold mb-2 block">Event Poster/Images *</Label>
            <ImageUpload
              bucket="listings"
              onUpload={(urls) => setForm({ ...form, images: urls })}
              maxFiles={3}
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
              disabled={loading || !form.title || !form.date}
              className="bg-indigo hover:bg-indigo/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>

        {/* Existing Events */}
        {listings.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-bold mb-3">Your Events ({listings.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="p-3 bg-card border border-border rounded-lg flex justify-between items-start hover:border-indigo transition-all"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{listing.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {listing.date} • {listing.venue} • {listing.location}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Standard: Rs. {listing.standardPrice} | Premium: Rs. {listing.premiumPrice}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(listing)}
                      className="p-1.5 hover:bg-indigo/10 rounded transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-indigo" />
                    </button>
                    <button
                      onClick={() => listing.id && handleDelete(listing.id)}
                      className="p-1.5 hover:bg-indigo/10 rounded transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-indigo" />
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
