import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Edit2, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import ListEventModal from "./ListEventModal";
import { Button } from "@/components/ui/button";

interface EventListing {
  id: string;
  title: string;
  category: string;
  event_date: string;
  event_time: string;
  venue: string;
  location: string;
  capacity: number;
  standard_price: number;
  premium_price: number;
  vip_price: number;
  rating: number;
  status: string;
}

export default function EventManagement() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<EventListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user can list events
  const canListEvents = profile?.role === "event_organizer" || profile?.role === "admin";

  useEffect(() => {
    if (canListEvents && user) {
      fetchListings();
    }
  }, [user, profile]);

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("event_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("event_date", { ascending: true });

      if (fetchError) throw fetchError;
      setListings(data || []);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load event listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    if (!user) return;

    setDeleting(id);
    try {
      const { error: deleteError } = await supabase
        .from("event_listings")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete event");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSuccess = () => {
    fetchListings();
    handleModalClose();
  };

  if (!canListEvents) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🎭 My Events
          {listings.length > 0 && (
            <span className="text-sm bg-indigo/20 text-indigo px-2 py-0.5 rounded-full">
              {listings.length}
            </span>
          )}
        </h2>
        <Button
          onClick={() => {
            setEditingId(null);
            setShowModal(true);
          }}
          size="sm"
          className="bg-indigo hover:bg-indigo/90 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Event
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-indigo" />
          <span className="ml-2 text-muted-foreground">Loading events...</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-3">No events listed yet</p>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-indigo hover:bg-indigo/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Event
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div
              key={listing.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-indigo/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{listing.title}</h3>
                    <span className="text-xs bg-indigo/10 text-indigo px-2 py-0.5 rounded">
                      {listing.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>📅 {new Date(listing.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span>🕐 {listing.event_time}</span>
                    <span>📍 {listing.venue}, {listing.location}</span>
                    <span>👥 {listing.capacity} capacity</span>
                    <span className="font-medium text-foreground">
                      Rs.{Number(listing.standard_price).toLocaleString()} - {Number(listing.vip_price).toLocaleString()}
                    </span>
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
                    onClick={() => handleEdit(listing.id)}
                    className="p-2 hover:bg-indigo/10 rounded-lg text-indigo transition-colors"
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

      <ListEventModal
        open={showModal}
        onOpenChange={handleModalClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
