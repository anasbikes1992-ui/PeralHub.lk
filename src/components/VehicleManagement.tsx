import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Edit2, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import ListVehicleModal from "./ListVehicleModal";
import { Button } from "@/components/ui/button";

interface VehicleListing {
  id: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  daily_rate: number;
  location: string;
  rating: number;
  seats: number;
  ac: boolean;
  fuel: string;
  transmission: string;
  status: string;
}

export default function VehicleManagement() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user can list vehicles
  const canListVehicles = profile?.role === "vehicle_provider" || profile?.role === "admin";

  useEffect(() => {
    if (canListVehicles && user) {
      fetchListings();
    }
  }, [user, profile]);

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("vehicle_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setListings(data || []);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load vehicle listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    if (!user) return;

    setDeleting(id);
    try {
      const { error: deleteError } = await supabase
        .from("vehicle_listings")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete vehicle");
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

  if (!canListVehicles) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🚗 My Vehicles
          {listings.length > 0 && (
            <span className="text-sm bg-ruby/20 text-ruby px-2 py-0.5 rounded-full">
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
          className="bg-ruby hover:bg-ruby/90 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Vehicle
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
          <Loader2 className="w-5 h-5 animate-spin text-ruby" />
          <span className="ml-2 text-muted-foreground">Loading vehicles...</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-3">No vehicles listed yet</p>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-ruby hover:bg-ruby/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            List Your First Vehicle
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div
              key={listing.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-ruby/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">
                      {listing.year} {listing.make} {listing.model}
                    </h3>
                    <span className="text-xs bg-ruby/10 text-ruby px-2 py-0.5 rounded">
                      {listing.vehicle_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>📍 {listing.location}</span>
                    <span>Rs. {Number(listing.daily_rate).toLocaleString()}/day</span>
                    <span>{listing.seats} seats • {listing.fuel}</span>
                    <span>{listing.transmission === "automatic" ? "🔄 Auto" : "⚙️ Manual"}</span>
                    {listing.ac && <span>❄️ AC</span>}
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
                    className="p-2 hover:bg-ruby/10 rounded-lg text-ruby transition-colors"
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

      <ListVehicleModal
        open={showModal}
        onOpenChange={handleModalClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
