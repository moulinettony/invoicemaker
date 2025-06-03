"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  ice: string;
  created_at: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);

  const fetchClients = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (user) {
      const { data: businessData } = await supabase
        .from("business")
        .select("id, business_name")
        .eq("user_id", user.id);

      setBusinesses(businessData || []);

      const businessIds = (businessData || []).map((b) => b.id);

      const { data: clientData } = await supabase
        .from("client")
        .select("*")
        .in("business_id", businessIds);

      setClients(clientData || []);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="space-y-4 p-3 mt-16 h-[calc(100vh-64px)]">
      <div className="bg-white p-6 rounded h-full">
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <Plus className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <h2 className="text-sm font-semibold">Add New Client</h2>
            <button
              onClick={() => setShowModal(true)}
              className="mt-8 cursor-pointer px-4 py-2 w-full mt-3 font-semibold text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-700"
            >
              Add Client
            </button>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-[#000000aa] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 space-y-4 relative">
              <button
                className="absolute cursor-pointer top-2 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <h2 className="text-xl font-bold">Create New Client</h2>
              <form
                className="grid grid-cols-2 gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();

                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);

                  const businessId = formData.get("business_id");
                  const { error } = await supabase.from("client").insert({
                    name: formData.get("name"),
                    email: formData.get("email"),
                    mobile: formData.get("mobile"),
                    address: formData.get("address"),
                    ice: formData.get("ice"),
                    business_id: businessId,
                  });

                  if (!error) {
                    form.reset();
                    setShowModal(false);
                    fetchClients();
                  } else {
                    console.log(error.message);
                  }
                }}
              >
                {businesses.length === 0 ? (
                  <p>Loading businesses...</p>
                ) : (
                  <select
                    name="business_id"
                    className="p-2 rounded-lg h-10 border text-sm col-span-2"
                  >
                    <option value="">Select Business</option>
                    {businesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.business_name || "Unnamed Business"}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  name="name"
                  placeholder="Client Name"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="mobile"
                  placeholder="Mobile"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="ice"
                  placeholder="ICE"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="address"
                  placeholder="Address"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm col-span-2"
                />
                <button
                  type="submit"
                  className="col-span-2 cursor-pointer border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50"
                >
                  Save Client
                </button>
              </form>
            </div>
          </div>
        )}

        {clients.length > 0 ? (
          <div className="mt-6 border border-neutral-300 border-dashed rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Your Clients</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 rounded">
                  <tr className="h-14">
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tl-lg">
                      Name
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Email
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Mobile
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Address
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">ICE</th>
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tr-lg">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="h-14 border-b border-neutral-200"
                    >
                      <td className="px-4 py-2">{client.name}</td>
                      <td className="px-4 py-2">{client.email}</td>
                      <td className="px-4 py-2">{client.mobile}</td>
                      <td className="px-4 py-2">{client.address}</td>
                      <td className="px-4 py-2">{client.ice}</td>
                      <td className="px-4 py-2">
                        {new Date(client.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="font-light text-gray-500 mt-6">
            No clients found for your account.
          </p>
        )}
      </div>
    </div>
  );
}
