import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, FileText, DollarSign, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlatformStats {
  totalUsers: number;
  totalListings: number;
  totalRevenue: number;
  averageRating: number;
  usersByRole: Record<string, number>;
  listingsByType: Record<string, number>;
  listingsByStatus: Record<string, number>;
}

export default function AdminAnalyticsDashboard() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalListings: 0,
    totalRevenue: 0,
    averageRating: 0,
    usersByRole: {},
    listingsByType: {},
    listingsByStatus: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("role");
      if (usersError) throw usersError;

      // Fetch stays
      const { data: staysData, error: staysError } = await supabase
        .from("stay_listings")
        .select("id, status, rating, price_per_night");
      if (staysError) throw staysError;

      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicle_listings")
        .select("id, status, rating, daily_rate");
      if (vehiclesError) throw vehiclesError;

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from("event_listings")
        .select("id, status, rating, standard_price");
      if (eventsError) throw eventsError;

      // Calculate stats
      const usersByRole: Record<string, number> = {};
      if (usersData) {
        usersData.forEach(user => {
          const role = user.role || "customer";
          usersByRole[role] = (usersByRole[role] || 0) + 1;
        });
      }

      const listingsByStatus: Record<string, number> = {
        active: 0,
        inactive: 0,
        paused: 0,
      };

      let totalRevenue = 0;
      let totalRatings = 0;
      let ratingCount = 0;

      const allListings = [...(staysData || []), ...(vehiclesData || []), ...(eventsData || [])];

      allListings.forEach(listing => {
        listingsByStatus[listing.status || "inactive"]++;
        if (listing.rating) {
          totalRatings += listing.rating;
          ratingCount++;
        }
      });

      // Estimate revenue (simplified - in production would use payment records)
      staysData?.forEach(s => {
        if (s.price_per_night) totalRevenue += s.price_per_night * 30; // Assume 30 bookings/month
      });
      vehiclesData?.forEach(v => {
        if (v.daily_rate) totalRevenue += v.daily_rate * 20; // Assume 20 rentals/month
      });
      eventsData?.forEach(e => {
        if (e.standard_price) totalRevenue += e.standard_price * 10; // Assume 10 bookings/month
      });

      setStats({
        totalUsers: usersData?.length || 0,
        totalListings: allListings.length,
        totalRevenue: Math.round(totalRevenue),
        averageRating: ratingCount > 0 ? (totalRatings / ratingCount).toFixed(2) : 0,
        usersByRole,
        listingsByType: {
          stays: staysData?.length || 0,
          vehicles: vehiclesData?.length || 0,
          events: eventsData?.length || 0,
        },
        listingsByStatus,
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-ruby" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">📊 Platform Analytics</h2>
        <Button onClick={fetchAnalytics} size="sm" variant="outline">
          🔄 Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-sapphire/10 to-sapphire/5 border border-sapphire/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground text-sm font-medium">Total Users</p>
            <Users className="w-5 h-5 text-sapphire" />
          </div>
          <p className="text-3xl font-bold text-sapphire">{stats.totalUsers}</p>
          <p className="text-xs text-muted-foreground mt-1">Registered on platform</p>
        </div>

        <div className="bg-gradient-to-br from-emerald/10 to-emerald/5 border border-emerald/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground text-sm font-medium">Total Listings</p>
            <FileText className="w-5 h-5 text-emerald" />
          </div>
          <p className="text-3xl font-bold text-emerald">{stats.totalListings}</p>
          <p className="text-xs text-muted-foreground mt-1">Active & inactive</p>
        </div>

        <div className="bg-gradient-to-br from-amber/10 to-amber/5 border border-amber/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground text-sm font-medium">Est. Revenue</p>
            <DollarSign className="w-5 h-5 text-amber" />
          </div>
          <p className="text-3xl font-bold text-amber">Rs.{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-muted-foreground mt-1">Monthly estimate</p>
        </div>

        <div className="bg-gradient-to-br from-ruby/10 to-ruby/5 border border-ruby/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground text-sm font-medium">Avg Rating</p>
            <TrendingUp className="w-5 h-5 text-ruby" />
          </div>
          <p className="text-3xl font-bold text-ruby">⭐ {typeof stats.averageRating === 'string' ? stats.averageRating : stats.averageRating.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Platform quality</p>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Type */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Listings by Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.listingsByType).map(([type, count]) => {
              const emojis: Record<string, string> = {
                stays: "🏨",
                vehicles: "🚗",
                events: "🎭",
              };
              const percentages: Record<string, number> = {
                stays: (count / stats.totalListings) * 100,
                vehicles: (count / stats.totalListings) * 100,
                events: (count / stats.totalListings) * 100,
              };
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize">{emojis[type]} {type}</span>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-sapphire to-indigo h-2 rounded-full"
                      style={{ width: `${percentages[type] || 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Listings by Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.listingsByStatus).map(([status, count]) => {
              const colors: Record<string, string> = {
                active: "from-green-500 to-emerald-500",
                inactive: "from-gray-500 to-gray-600",
                paused: "from-amber-500 to-orange-500",
              };
              const percentages: Record<string, number> = {
                active: (count / stats.totalListings) * 100,
                inactive: (count / stats.totalListings) * 100,
                paused: (count / stats.totalListings) * 100,
              };
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize">{status}</span>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${colors[status] || "from-gray-500 to-gray-600"} h-2 rounded-full`}
                      style={{ width: `${percentages[status] || 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Role */}
        <div className="bg-card border border-border rounded-lg p-6 md:col-span-2">
          <h3 className="font-semibold mb-4">Users by Role</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {Object.entries(stats.usersByRole).map(([role, count]) => {
              const roleEmojis: Record<string, string> = {
                admin: "👑",
                customer: "👤",
                owner: "🏠",
                broker: "📊",
                stay_provider: "🏨",
                vehicle_provider: "🚗",
                event_organizer: "🎭",
                sme: "🏪",
              };
              return (
                <div key={role} className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-3 text-center">
                  <p className="text-lg">{roleEmojis[role] || "👤"}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{role.replace("_", " ")}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
