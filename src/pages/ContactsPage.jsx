"use cli ent";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Search, Mail, Phone, Building, UserPlus, ChevronDown } from "lucide-react";
import ContactTile from "../components/ContactTile";



export default function ContactsPage() {

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      const token = localStorage.getItem("token")?.replace(/"/g, "");
      if (!token) {
        setLoading(false);
        // Set dummy data for UI development if not logged in
        setContacts([
          { id: 1, name: 'John Doe (Sample)', email: 'john.doe@example.com', phone: '0845727526', company: 'Example Inc.' },
          { id: 2, name: 'Jane Smith (Sample)', email: 'jane.smith@work.co', phone: '0987654321', company: 'Work Co.' },
        ]);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch contacts: ${res.statusText}`);
        }

        const data = await res.json();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        // In case of an API error, you might want to show an error message
        setContacts([]); // Clear contacts on error
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) =>
    (contact.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (contact.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (contact.company?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Pick a background color from a preset list for consistency
  const avatarColors = [
    "bg-blue-500", "bg-green-500", "bg-pink-500",
    "bg-purple-500", "bg-indigo-500", "bg-yellow-500", "bg-red-500"
  ];
  const getRandomColor = (seed) => {
    // hash seed to always return the same color for same name
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatarColors.length;
    return avatarColors[index];
  };




  return (
    <div className="min-h-[100dvh] font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
      <Navbar />
      <div className="flex flex-col md:flex-row pt-24">
        <Sidebar activePage="Contacts" />
        <main className="w-4/5 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#0b2447]">My REO Contacts</h1>

          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          {/* Contacts Grid */}
          {loading ? (
            <div className="text-center text-gray-500">Loading contacts...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContacts.map((contact) => (
                <ContactTile
                  key={contact.id}
                  contact={contact}
                  getRandomColor={getRandomColor}
                  onCopyLink={(c) => {
                    navigator.clipboard.writeText(`${window.location.origin}/card/${c.id}`);
                    alert("Link copied to clipboard!");
                  }}
                  onDelete={async (c) => {
                    const token = localStorage.getItem("token")?.replace(/"/g, "");
                    if (!token) return;
                    if (!window.confirm("Are you sure you want to delete this contact?")) return;

                    try {
                      const res = await fetch(`${API_URL}/api/contacts/${c.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) {
                        setContacts((prev) => prev.filter((x) => x.id !== c.id));
                      }
                    } catch (err) {
                      console.error("Delete failed:", err);
                    }
                  }}
                />
              ))}

              {filteredContacts.length === 0 && !loading && (
                <div className="md:col-span-2 lg:col-span-3 text-center py-10">
                  <p className="text-gray-500">No contacts found.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

