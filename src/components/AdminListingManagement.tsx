import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Eye, Search, Filter, Loader2, AlertCircle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminListing {
  id: string;
  title: string;
  type: "stay" | "vehicle" | "event";
  provider_name?: string;
  organizer_name?: string;
  user_id: string;
  price?: number;
  daily_rate?: number;
  standard_price?: number;
  location: string;
  status: string;
  created_at: string;
  rating: number;
}

export default function AdminListingManagement() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAllListings();
  }, []);

  const fetchAllListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staysData, vehiclesData, eventsData] = await Promise.all([
        supabase.from("stay_listings").select("*").order("created_at", { ascending: false }),
        supabase.from("vehicle_listings").select("*").order("created_at", { ascending: false }),
        supabase.from("event_listings").select("*").order("created_at", { ascending: false }),
      ]);

      const stayListings: AdminListing[] = (staysData.data || []).map(s => ({
        id: s.id,
        title: s.title,
        type: "stay" as const,
        provider_name: s.provider_name,
        user_id: s.user_id,
        price: s.price_per_night,
        location: s.location,
        status: s.status,
        created_at: s.created_at,
        rating: s.rating,
      }));

      const vehicleListings: AdminListing[] = (vehiclesData.data || []).map(v => ({
        id: v.id,
        title: `${v.year} ${v.make} ${v.model}`,
        type: "vehicle" as const,
        provider_name: v.provider_name,
        user_id: v.user_id,
        daily_rate: v.daily_rate,
        location: v.location,
        status: v.status,
        created_at: v.created_at,
        rating: v.rating,
      }));

      const eventListings: AdminListing[] = (eventsData.data || []).map(e => ({
        id: e.id,
        title: e.title,
        type: "event" as const,
        organizer_name: e.organizer_name,
        user_id: e.user_id,
        standard_price: e.standard_price,
        location: e.location,
        status: e.status,
        created_at: e.created_at,
        rating: e.rating,
      }));

      const allListings = [...stayListings, ...vehicleListings, ...eventListings];
      setListings(allListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id: string, type: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    setDeleting(id);
    try {
      let tableName = "";
      if (type === "stay") tableName = "stay_listings";
      else if (type === "vehicle") tableName = "vehicle_listings";
      else if (type === "event") tableName = "event_listings";

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      setListings(listings.filter(l => l.id !== id));
      alert("Listing deleted successfully");
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete listing");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (id: string, type: string, newStatus: string) => {
    try {
      let tableName = "";
      if (type === "stay") tableName = "stay_listings";
      else if (type === "vehicle") tableName = "vehicle_listings";
      else if (type === "event") tableName = "event_listings";

      const { error: updateError } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) throw updateError;
      setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));
      alert(`Listing status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error("Error updating listing status:", err);
      alert("Failed to update listing status");
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (listing.provider_name || listing.organizer_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || listing.type === filterType;
    const matchesStatus = filterStatus === "all" || listing.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const typeColors: Record<string, string> = {
    stay: "bg-sapphire/10 text-sapphire",
    vehicle: "bg-ruby/10 text-ruby",
    event: "bg-indigo/10 text-indigo",
  };

  const typeEmojis: Record<string, string> = {
    stay: "🏨",
    vehicle: "🚗",
    event: "🎭",
  };

  const statusColors: Record<string, string> = {
    active: "text-green-700 bg-green-50",
    inactive: "text-gray-700 bg-gray-50",
    paused: "text-amber-700 bg-amber-50",
  };

  const stats = {
    total: listings.length,
    stays: listings.filter(l => l.type === "stay").length,
    vehicles: listings.filter(l => l.type === "vehicle").length,
    events: listings.filter(l => l.type === "event").length,
    active: listings.filter(l => l.status === "active").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          📋 All Platform Listings
          <span className="text-sm bg-ruby/20 text-ruby px-2 py-0.5 rounded-full">
            {stats.total} listings
          </span>
        </h2>
        <Button onClick={fetchAllListings} size="sm" variant="outline">
          🔄 Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-ruby/10 to-ruby/5 border border-ruby/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-ruby">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-sapphire/10 to-sapphire/5 border border-sapphire/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Stays</p>
          <p className="text-2xl font-bold text-sapphire">{stats.stays}</p>
        </div>
        <div className="bg-gradient-to-br from-amber/10 to-amber/5 border border-amber/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Vehicles</p>
          <p className="text-2xl font-bold text-amber">{stats.vehicles}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo/10 to-indigo/5 border border-indigo/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Events</p>
          <p className="text-2xl font-bold text-indigo">{stats.events}</p>
        </div>
        <div className="bg-gradient-to-br from-green/10 to-green/5 border border-green/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, location, or provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-input rounded-md text-sm bg-card"
        >
          <option value="all">All Types</option>
          <option value="stay">Stays 🏨</option>
          <option value="vehicle">Vehicles 🚗</option>
          <option value="event">Events 🎭</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-input rounded-md text-sm bg-card"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-ruby" />
          <span className="ml-2 text-muted-foreground">Loading listings...</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No listings found</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredListings.map(listing => (
            <div
              key={listing.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-ruby/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{typeEmojis[listing.type]}</span>
                    <h3 className="font-semibold text-sm">{listing.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[listing.type]}`}>
                      {listing.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span>👤 {listing.provider_name || listing.organizer_name || "Unknown"}</span>
                    <span>📍 {listing.location}</span>
                    {listing.price && <span>Rs. {Number(listing.price).toLocaleString()}/night</span>}
                    {listing.daily_rate && <span>Rs. {Number(listing.daily_rate).toLocaleString()}/day</span>}
                    {listing.standard_price && <span>Rs. {Number(listing.standard_price).toLocaleString()}+</span>}
                    <span>⭐ {listing.rating}</span>
                    <span className={`px-2 py-0.5 rounded ${statusColors[listing.status]}`}>
                      {listing.status.toUpperCase()}
                    </span>
                    <span>📅 {new Date(listing.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {listing.status === "active" ? (
                    <button
                      onClick={() => handleStatusChange(listing.id, listing.type, "paused")}
                      className="p-2 hover:bg-amber-100 rounded-lg text-amber-600 transition-colors"
                      title="Pause Listing"
                    >
                      ⏸️
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(listing.id, listing.type, "active")}
                      className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                      title="Activate Listing"
                    >
                      ✅
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteListing(listing.id, listing.type)}
                    disabled={deleting === listing.id}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors disabled:opacity-50"
                    title="Delete Listing"
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
