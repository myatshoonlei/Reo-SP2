"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Search, Mail, Phone, Building, UserPlus, ChevronDown } from "lucide-react";


export default function ContactsPage() {
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
        const res = await fetch("http://localhost:5000/api/contacts", {
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
  
  

  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
      <Navbar />
      <div className="flex pt-24">
        <Sidebar activePage="Contacts" />
        <main className="w-4/5 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#0b2447]">My REO Contacts</h1>
            
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
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
                <div key={contact.id} className="bg-white p-4 rounded-xl border shadow-md flex flex-col space-y-3 transition-all hover:shadow-lg hover:border-blue-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <h3 className="font-bold text-lg text-gray-800 truncate">{contact.name}</h3>
                    </div>
                    {/* Placeholder for link/edit icons */}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 pl-1 pt-2 border-t">
                    <p className="flex items-center truncate"><Mail size={14} className="mr-2 opacity-60 flex-shrink-0" /> {contact.email || "No email"}</p>
                    <p className="flex items-center"><Phone size={14} className="mr-2 opacity-60 flex-shrink-0" /> {contact.phone || "No phone"}</p>
                    <p className="flex items-center"><Building size={14} className="mr-2 opacity-60 flex-shrink-0" /> {contact.company || "No company"}</p>
                  </div>
                </div>
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

