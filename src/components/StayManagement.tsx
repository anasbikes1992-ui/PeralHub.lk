import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Edit2, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import ListStayModal from "./ListStayModal";
import { Button } from "@/components/ui/button";

interface StayListing {
  id: string;
  title: string;
  description: string;
  price_per_night: number;
  location: string;
  stay_type: string;
  rating: number;
  images: string[];
  rooms: number;
  max_guests: number;
  status: string;
}

export default function StayManagement() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<StayListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user can list stays
  const canListStays = profile?.role === "stay_provider" || profile?.role === "admin";

  useEffect(() => {
    if (canListStays && user) {
      fetchListings();
    }
  }, [user, profile]);

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("stay_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setListings(data || []);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings");
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
        .from("stay_listings")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete listing");
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

  if (!canListStays) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🏨 My Stays
          {listings.length > 0 && (
            <span className="text-sm bg-sapphire/20 text-sapphire px-2 py-0.5 rounded-full">
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
          className="bg-sapphire hover:bg-sapphire/90 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Stay
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
          <Loader2 className="w-5 h-5 animate-spin text-sapphire" />
          <span className="ml-2 text-muted-foreground">Loading stays...</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-3">No stays listed yet</p>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-sapphire hover:bg-sapphire/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            List Your First Stay
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div
              key={listing.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-sapphire/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{listing.title}</h3>
                    <span className="text-xs bg-sapphire/10 text-sapphire px-2 py-0.5 rounded">
                      {listing.stay_type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{listing.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>📍 {listing.location}</span>
                    <span>Rs. {Number(listing.price_per_night).toLocaleString()}/night</span>
                    <span>{listing.rooms} rooms • {listing.max_guests} guests</span>
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
                    className="p-2 hover:bg-sapphire/10 rounded-lg text-sapphire transition-colors"
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

      <ListStayModal
        open={showModal}
        onOpenChange={handleModalClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
