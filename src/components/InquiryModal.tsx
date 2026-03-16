import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAppContext } from "@/context/AppContext";

interface InquiryModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingType: "property" | "stay" | "vehicle" | "event";
  listingTitle: string;
  ownerId?: string;
}

const InquiryModal = ({ open, onClose, listingId, listingType, listingTitle, ownerId }: InquiryModalProps) => {
  const { showToast } = useAppContext();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      showToast("Please fill in your name and email.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showToast("Please enter a valid email.", "error");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("inquiries").insert({
      listing_id: listingId,
      listing_type: listingType,
      sender_name: form.name.trim(),
      sender_email: form.email.trim(),
      sender_phone: form.phone.trim(),
      message: form.message.trim(),
      owner_id: ownerId || null,
    });
    setLoading(false);
    if (error) {
      showToast("Failed to send enquiry. Please try again.", "error");
      return;
    }
    showToast("📩 Enquiry sent! The owner will contact you shortly.", "success");
    setForm({ name: "", email: "", phone: "", message: "" });
    onClose();
  };

  const colorMap: Record<string, string> = {
    property: "from-emerald to-emerald/70",
    stay: "from-sapphire to-sapphire/70",
    vehicle: "from-ruby to-ruby/70",
    event: "from-indigo to-indigo/70",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-obsidian/75 z-[1100] flex items-center justify-center p-5" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card rounded-2xl max-w-[480px] w-full" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-br ${colorMap[listingType]} px-7 py-5 rounded-t-2xl flex justify-between items-center`}>
              <div>
                <h3 className="text-pearl text-lg font-bold">📩 Enquire Now</h3>
                <p className="text-pearl/70 text-xs mt-0.5">{listingTitle}</p>
              </div>
              <button onClick={onClose} className="bg-white/15 border-none text-pearl w-8 h-8 rounded-full cursor-pointer">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1">Your Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm" maxLength={100} />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1">Email *</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" type="email"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm" maxLength={255} />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+94 7X XXX XXXX"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm" maxLength={20} />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1">Message</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3}
                  placeholder="I'm interested in this listing…" className="w-full rounded-md border border-input px-3 py-2 text-sm resize-y" maxLength={1000} />
              </div>
              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-primary hover:bg-gold-light text-primary-foreground py-3 rounded-lg font-bold transition-all disabled:opacity-50">
                {loading ? "Sending…" : "📩 Send Enquiry"}
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">Your details will be shared with the listing owner only.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InquiryModal;
