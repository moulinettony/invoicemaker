"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, MoreVertical, X } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  ice: string;
  created_at: string;
  business_id: string; // Ensure business_id is part of the Client type
};

type Business = {
  id: string;
  business_name: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  // --- State for Form Inputs ---
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientMobile, setClientMobile] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientIce, setClientIce] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");

  // --- State for Editing ---
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // --- State for Dropdown and Delete Confirmation ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const fetchClientsAndBusinesses = async () => {
    setIsLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (user) {
      const { data: businessData, error: businessError } = await supabase
        .from("business")
        .select("id, business_name")
        .eq("user_id", user.id);

      if (businessError) console.error("Error fetching businesses:", businessError);
      setBusinesses(businessData || []);

      if (businessData && businessData.length > 0) {
        const businessIds = businessData.map((b) => b.id);
        const { data: clientData, error: clientError } = await supabase
          .from("client")
          .select("*")
          .in("business_id", businessIds)
          .order("created_at", { ascending: false });

        if (clientError) console.error("Error fetching clients:", clientError);
        setClients(clientData || []);
      } else {
        setClients([]);
      }
    } else {
      setBusinesses([]);
      setClients([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClientsAndBusinesses();
  }, []);

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setClientMobile("");
    setClientAddress("");
    setClientIce("");
    setSelectedBusinessId(businesses.length > 0 ? businesses[0].id : "");
    setEditingClient(null);
  };

  const handleOpenModalForCreate = () => {
    resetForm();
     if (businesses.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(businesses[0].id);
    }
    setShowModal(true);
  };

  const handleOpenModalForEdit = (client: Client) => {
    setEditingClient(client);
    setClientName(client.name);
    setClientEmail(client.email || "");
    setClientMobile(client.mobile || "");
    setClientAddress(client.address || "");
    setClientIce(client.ice || "");
    setSelectedBusinessId(client.business_id);
    setShowModal(true);
    setActiveDropdown(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedBusinessId) {
      alert("Please select a business for the client.");
      return;
    }
    if (!clientName.trim()) {
        alert("Client name is required.");
        return;
    }

    const clientDataPayload = {
      name: clientName,
      email: clientEmail,
      mobile: clientMobile,
      address: clientAddress,
      ice: clientIce,
      business_id: selectedBusinessId,
    };

    let Dberror = null;

    if (editingClient) {
      const { error } = await supabase
        .from("client")
        .update(clientDataPayload)
        .eq("id", editingClient.id);
      Dberror = error;
    } else {
      const { error } = await supabase
        .from("client")
        .insert(clientDataPayload);
      Dberror = error;
    }

    if (!Dberror) {
      closeModal();
      fetchClientsAndBusinesses();
    } else {
      console.error("Error saving client:", Dberror.message);
      alert(`Error saving client: ${Dberror.message}`);
    }
  };

  // --- Delete Logic ---
  const handleDeleteClient = async (clientId: string) => {
    if (!clientId) return;

    const { error } = await supabase
      .from("client")
      .delete()
      .eq("id", clientId);

    if (error) {
      console.error("Error deleting client:", error.message);
      alert(`Error deleting client: ${error.message}`);
    } else {
      fetchClientsAndBusinesses();
      setShowDeleteConfirmModal(false);
      setClientToDelete(null);
    }
  };

  const openDeleteConfirmation = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteConfirmModal(true);
    setActiveDropdown(null);
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteConfirmModal(false);
    setClientToDelete(null);
  };

  const toggleDropdown = (clientId: string) => {
    setActiveDropdown(activeDropdown === clientId ? null : clientId);
  };


  return (
    <div className="space-y-4 p-3 mt-16 h-[calc(100vh-64px)]">
      <div className="bg-white p-6 rounded h-full overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <Plus className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <h2 className="text-sm font-semibold">Add New Client</h2>
            <button
              onClick={handleOpenModalForCreate}
              className="mt-8 cursor-pointer px-4 py-2 w-full font-semibold text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800"
            >
              Add Client
            </button>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-[#000000aa] bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 space-y-4 relative">
              <button
                className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                <X size={20}/>
              </button>
              <h2 className="text-xl font-bold">
                {editingClient ? "Edit Client" : "Create New Client"}
              </h2>
              <form
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                onSubmit={handleSubmit}
              >
                <div className="sm:col-span-2">
                  <label htmlFor="business_id_client" className="block text-sm font-medium text-gray-700 mb-1">Assign to Business</label>
                  <select
                    id="business_id_client"
                    name="business_id"
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="p-2 rounded-lg h-10 border text-sm w-full"
                    required
                  >
                    <option value="">Select Business</option>
                    {businesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.business_name || "Unnamed Business"}
                      </option>
                    ))}
                  </select>
                  {businesses.length === 0 && !isLoading && (
                     <p className="text-xs text-gray-500 mt-1">No businesses found. Please add a business first to assign clients.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    id="client_name"
                    name="name"
                    placeholder="e.g., John Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="client_email" className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    id="client_email"
                    name="email"
                    type="email"
                    placeholder="e.g., john.doe@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full"
                  />
                </div>
                <div>
                  <label htmlFor="client_mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile (Optional)</label>
                  <input
                    id="client_mobile"
                    name="mobile"
                    placeholder="e.g., +1234567890"
                    value={clientMobile}
                    onChange={(e) => setClientMobile(e.target.value)}
                    className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full"
                  />
                </div>
                <div>
                  <label htmlFor="client_ice" className="block text-sm font-medium text-gray-700 mb-1">ICE (Optional)</label>
                  <input
                    id="client_ice"
                    name="ice"
                    placeholder="Client's ICE number"
                    value={clientIce}
                    onChange={(e) => setClientIce(e.target.value)}
                    className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="client_address" className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                  <textarea
                    id="client_address"
                    name="address"
                    placeholder="Client's full address"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="p-2 rounded-lg bg-blue-50 text-sm w-full min-h-[60px]"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  className="sm:col-span-2 mt-2 cursor-pointer border border-blue-600 text-blue-600 py-2.5 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  {editingClient ? "Update Client" : "Save Client"}
                </button>
              </form>
            </div>
          </div>
        )}

        {isLoading ? (
            <p className="font-light text-gray-500 mt-6 text-center">Loading clients...</p>
        ): clients.length > 0 ? (
          <div className="mt-6 border border-neutral-300 border-dashed rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Your Clients</h2>
            <div className="">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 rounded">
                  <tr className="h-14">
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tl-lg">Name</th>
                    <th className="px-4 font-light text-gray-500 py-2">Email</th>
                    <th className="px-4 font-light text-gray-500 py-2">Mobile</th>
                    <th className="px-4 font-light text-gray-500 py-2">ICE</th>
                    <th className="px-4 font-light text-gray-500 py-2">Business</th>
                    <th className="px-4 font-light text-gray-500 py-2">Date</th>
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tr-lg text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                     const businessName = businesses.find(b => b.id === client.business_id)?.business_name || "N/A";
                     return (
                    <tr
                      key={client.id}
                      className="h-14 border-b border-neutral-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium text-gray-800">{client.name}</td>
                      <td className="px-4 py-2">{client.email || "-"}</td>
                      <td className="px-4 py-2">{client.mobile || "-"}</td>
                      <td className="px-4 py-2">{client.ice || "-"}</td>
                      <td className="px-4 py-2">{businessName}</td>
                      <td className="px-4 py-2">
                        {new Date(client.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-2 relative text-right">
                        <button
                          onClick={() => toggleDropdown(client.id)}
                          className="p-1 cursor-pointer rounded hover:bg-gray-200 text-gray-600"
                          aria-haspopup="true"
                          aria-expanded={activeDropdown === client.id}
                        >
                          <MoreVertical size={18} />
                        </button>
                        {activeDropdown === client.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-20 border border-gray-200 text-left">
                            <ul className="py-1">
                              <li>
                                <button
                                  onClick={() => handleOpenModalForEdit(client)}
                                  className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Edit
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => openDeleteConfirmation(client)}
                                  className="w-full cursor-pointer text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="font-light text-gray-500 mt-6 text-center">
            No clients found for your account. Add a client to get started.
          </p>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && clientToDelete && (
          <div className="fixed inset-0 bg-[#000000aa] bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 space-y-4 w-full max-w-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
              </div>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the client: <strong>{clientToDelete.name}</strong>?
              </p>
              <p className="text-sm text-red-500">This action cannot be undone.</p>
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  onClick={closeDeleteConfirmation}
                  className="px-4 cursor-pointer py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteClient(clientToDelete.id)}
                  className="px-4 cursor-pointer py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}