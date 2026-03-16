import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

const ContactPage = () => {
  const { showToast } = useAppContext();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-emerald to-emerald/70 py-16">
        <div className="container text-center">
          <h1 className="text-pearl text-4xl font-display font-bold mb-4">Contact Us</h1>
          <p className="text-pearl/75 text-lg">Get in touch with the Pearl Hub team</p>
        </div>
      </div>
      <div className="container py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl mb-6">Send us a Message</h2>
            <div className="flex flex-col gap-3">
              <div><label className="block text-xs font-semibold mb-1">Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold mb-1">Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold mb-1">Subject</label><input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold mb-1">Message</label><textarea rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full rounded-md border border-input px-3 py-2 text-sm resize-y" /></div>
              <button onClick={() => { showToast("Message sent! We'll get back to you soon.", "success"); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className="bg-emerald hover:bg-emerald-light text-accent-foreground py-3 rounded-lg font-bold transition-all">Send Message</button>
            </div>
          </div>
          <div>
            <h2 className="text-2xl mb-6">Get in Touch</h2>
            <div className="flex flex-col gap-4">
              {[
                { icon: "📍", label: "Address", value: "42 Galle Face Centre Road, Colombo 03, Sri Lanka" },
                { icon: "📞", label: "Phone", value: "+94 11 234 5678" },
                { icon: "📧", label: "Email", value: "support@pearlhub.lk" },
                { icon: "🕐", label: "Hours", value: "Mon–Sat: 8:00 AM – 6:00 PM" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                  <span className="text-2xl">{item.icon}</span>
                  <div><div className="font-bold text-sm">{item.label}</div><div className="text-sm text-muted-foreground">{item.value}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
