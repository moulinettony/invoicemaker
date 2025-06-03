"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, ReceiptText, ChartNoAxesCombined, Plus } from "lucide-react";

type UserInfo = {
  name: string;
  email: string;
  created_at: string;
};

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [businessInfo, setBusinessInfo] = useState<any[]>([]);
  const [clientsInfo, setClientsInfo] = useState<any[]>([]);
  const [invoicesInfo, setInvoicesInfo] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    console.log("fetchData called");
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session:", sessionError.message);
      setUserInfo(null);
      return;
    }
    console.log("Session Data:", sessionData);

    const user = sessionData.session?.user;
    console.log("User Object:", user);

    if (user) {
      console.log("User ID:", user.id);
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("name, email, created_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user profile:", userError.message);
        setUserInfo(null);
        return;
      }
      console.log("User Profile Data (from 'user' table):", userData);
      setUserInfo(userData || null);

      if (userData) {
        setUserInfo(userData);
      }
      const { data: businessData } = await supabase
        .from("business")
        .select("*")
        .eq("user_id", user.id);

      setBusinessInfo(businessData || []);

      if (businessData && businessData.length > 0) {
        const businessIds = businessData.map((b) => b.id);

        const { data: clientsData } = await supabase
          .from("client")
          .select("*")
          .in("business_id", businessIds);

        setClientsInfo(clientsData || []);

        const { data: invoicesData } = await supabase
          .from("invoice")
          .select("*")
          .in("business_id", businessIds);

        setInvoicesInfo(invoicesData || []);
      }
    } else {
      console.log("No active user session found after getSession.");
      setUserInfo(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!userInfo) return <p className="text-gray-500">Loading your info...</p>;

  return (
    <div className="space-y-4 p-3 mt-16 h-[calc(100vh-64px)]">
      <div className="bg-white p-6 rounded h-full">
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <User className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <p className="text-neutral-600 text-sm">Invoices</p>
            <p className="text-black text-lg font-bold my-2">
              {invoicesInfo.length}
            </p>
            <p className="text-neutral-600 text-sm">
              {invoicesInfo.length > 0 ? (
                <span className="">
                  {new Date(
                    [...invoicesInfo].sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )[0].created_at
                  ).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              ) : (
                "-"
              )}
            </p>
          </div>
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <ReceiptText className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <p className="text-neutral-600 text-sm">Clients</p>
            <p className="text-black text-lg font-bold my-2">
              {clientsInfo.length}
            </p>
            <p className="text-neutral-600 text-sm">
              {clientsInfo.length > 0 ? (
                <span className="">
                  {new Date(
                    [...clientsInfo].sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )[0].created_at
                  ).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              ) : (
                "-"
              )}
            </p>
          </div>
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <ChartNoAxesCombined className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <p className="text-neutral-600 text-sm">Business</p>
            <p className="text-black text-lg font-bold my-2">
              {businessInfo.length}
            </p>
            <p className="text-neutral-600 text-sm">
              {businessInfo.length > 0 ? (
                <span className="">
                  {new Date(
                    [...businessInfo].sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )[0].created_at
                  ).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              ) : (
                "-"
              )}
            </p>
          </div>
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <Plus className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <h2 className="text-sm font-semibold">Add New Businesse</h2>
            <button
              onClick={() => setShowModal(true)}
              className="mt-8 cursor-pointer px-4 py-2 w-full mt-3 font-semibold text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-700"
            >
              Add Business
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
              <h2 className="text-xl font-bold">Create Your Business</h2>

              {/* Form */}
              <form
                className="grid grid-cols-2 gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();

                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);

                  const { data: userData } = await supabase.auth.getUser();
                  const user = userData?.user;

                  if (user) {
                    const { error } = await supabase.from("business").insert({
                      user_id: user.id,
                      country: formData.get("country"),
                      business_phone: formData.get("business_phone"),
                      business_name: formData.get("business_name"),
                      business_ice: formData.get("business_ice"),
                      business_address: formData.get("business_address"),
                      postal_code: formData.get("postal_code"),
                      rc: formData.get("rc"),
                      tp: formData.get("tp"),
                      capital: formData.get("capital"),
                      user_wants: formData.get("user_wants"),
                      if: formData.get("if"),
                      tax_rate: parseFloat(formData.get("tax_rate") as string),
                      charging_tax: formData.get("charging_tax") === "on",
                      business_email: formData.get("business_email"),
                      city: formData.get("city"),
                    });

                    if (!error) {
                      form.reset(); // ✅ Reset form inputs
                      setShowModal(false); // ✅ Close modal
                      fetchData(); // ✅ Refresh data in the table
                    } else {
                      console.log(error.message);
                    }
                  }
                }}
              >
                <input
                  name="business_name"
                  placeholder="Business Name"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="business_email"
                  type="email"
                  placeholder="Email"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="business_phone"
                  placeholder="Phone"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="business_ice"
                  placeholder="ICE"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="tp"
                  placeholder="TP"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="capital"
                  placeholder="Capital"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="rc"
                  placeholder="RC"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="country"
                  placeholder="Country"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="city"
                  placeholder="City"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="postal_code"
                  placeholder="Postal Code"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="business_address"
                  placeholder="Address"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="if"
                  placeholder="IF"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="tax_rate"
                  placeholder="Tax Rate (%)"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <input
                  name="user_wants"
                  placeholder="User Wants"
                  className="p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />
                <label className="col-span-2 flex items-center space-x-2">
                  <input
                    name="charging_tax"
                    type="checkbox"
                    className="accent-blue-600"
                  />
                  <span>Charging Tax?</span>
                </label>
                <button
                  type="submit"
                  className="col-span-2 cursor-pointer border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50"
                >
                  Save Business
                </button>
              </form>
            </div>
          </div>
        )}

        {businessInfo.length > 0 ? (
          <div className="mt-6 border border-neutral-300 border-dashed rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Your Businesses</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 rounded">
                  <tr className="h-14">
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tl-lg">
                      Name
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">ICE</th>
                    <th className="px-4 font-light text-gray-500 py-2">RC</th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Phone
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Email
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Taxed
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">City</th>
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tr-lg">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="">
                  {businessInfo.map((biz) => (
                    <tr
                      key={biz.id}
                      className="h-14 border-b border-neutral-200"
                    >
                      <td className="px-4 py-2">{biz.business_name}</td>
                      <td className="px-4 py-2">{biz.business_ice}</td>
                      <td className="px-4 py-2">{biz.rc}</td>
                      <td className="px-4 py-2">{biz.business_phone}</td>
                      <td className="px-4 py-2">{biz.business_email}</td>
                      <td className="px-4 py-2">
                        {biz.charging_tax ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2">{biz.city}</td>
                      <td className="px-4 py-2">
                        {new Date(biz.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="font-light text-gray-500 mt-6">
            No business found for your account.
          </p>
        )}
      </div>
    </div>
  );
}
