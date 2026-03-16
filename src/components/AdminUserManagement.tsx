import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Edit2, Trash2, ShieldAlert, CheckCircle, XCircle, Search, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserAccount {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: "active" | "suspended" | "banned";
  created_at: string;
  last_login?: string;
  listings_count?: number;
  total_revenue?: number;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      const transformedUsers: UserAccount[] = data?.map(profile => ({
        id: profile.id,
        email: profile.email || "N/A",
        full_name: profile.full_name || "Unknown",
        role: profile.role || "customer",
        status: profile.status || "active",
        created_at: profile.created_at,
        last_login: profile.last_sign_in_at,
      })) || [];

      setUsers(transformedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSearching(true);
  };

  const handleStatusChange = async (userId: string, newStatus: "active" | "suspended" | "banned") => {
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (updateError) throw updateError;
      
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      alert(`User status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure? This will delete the user account and all associated data.")) return;
    
    try {
      // Delete user from auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) throw deleteError;
      
      setUsers(users.filter(u => u.id !== userId));
      alert("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleColors: Record<string, string> = {
    admin: "bg-ruby/10 text-ruby",
    customer: "bg-emerald/10 text-emerald",
    owner: "bg-sapphire/10 text-sapphire",
    broker: "bg-primary/10 text-primary",
    stay_provider: "bg-teal/10 text-teal",
    vehicle_provider: "bg-amber/10 text-amber",
    event_organizer: "bg-indigo/10 text-indigo",
    sme: "bg-orange/10 text-orange",
  };

  const statusColors: Record<string, string> = {
    active: "text-green-700 bg-green-50",
    suspended: "text-amber-700 bg-amber-50",
    banned: "text-red-700 bg-red-50",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          👥 User Management
          <span className="text-sm bg-ruby/20 text-ruby px-2 py-0.5 rounded-full">
            {users.length} users
          </span>
        </h2>
        <Button onClick={fetchUsers} size="sm" variant="outline">
          🔄 Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-input rounded-md text-sm bg-card"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="owner">Owner</option>
          <option value="broker">Broker</option>
          <option value="stay_provider">Stay Provider</option>
          <option value="vehicle_provider">Vehicle Provider</option>
          <option value="event_organizer">Event Organizer</option>
          <option value="sme">SME</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-input rounded-md text-sm bg-card"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-ruby" />
          <span className="ml-2 text-muted-foreground">Loading users...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-ruby/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ruby to-ruby/50 flex items-center justify-center text-white font-bold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{user.full_name}</h3>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${roleColors[user.role] || "bg-gray-100"}`}>
                      {user.role}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[user.status]}`}>
                      {user.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      📅 {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    {user.last_login && (
                      <span className="text-xs text-muted-foreground">
                        🕐 {new Date(user.last_login).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {user.status === "active" ? (
                    <>
                      <button
                        onClick={() => handleStatusChange(user.id, "suspended")}
                        className="p-2 hover:bg-amber-100 rounded-lg text-amber-600 transition-colors text-xs font-medium"
                        title="Suspend User"
                      >
                        ⏸️ Suspend
                      </button>
                      <button
                        onClick={() => handleStatusChange(user.id, "banned")}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors text-xs font-medium"
                        title="Ban User"
                      >
                        🚫 Ban
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(user.id, "active")}
                      className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors text-xs font-medium"
                      title="Activate User"
                    >
                      ✅ Activate
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
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
