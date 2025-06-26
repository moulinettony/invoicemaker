"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { User, ReceiptText, ChartNoAxesCombined, Plus, MoreVertical, X } from "lucide-react";

type UserInfo = {
  name: string;
  email: string;
  created_at: string;
};

// Define a more specific type for Business
type Business = {
  id: string;
  user_id: string;
  country: string | null;
  business_phone: string | null;
  business_name: string;
  business_ice: string | null;
  business_address: string | null;
  postal_code: string | null;
  rc: string | null;
  tp: string | null;
  capital: string | null;
  user_wants: string | null;
  if: string | null; // 'if' is a reserved keyword, consider renaming in DB if possible (e.g., to 'fiscal_identifier')
  tax_rate: number | null;
  charging_tax: boolean;
  business_email: string | null;
  city: string | null;
  created_at: string;
};

// Initial state for a new/editing business form
const initialBusinessFormState: Omit<Business, "id" | "user_id" | "created_at"> = {
  business_name: "",
  country: "",
  business_phone: "",
  business_ice: "",
  business_address: "",
  postal_code: "",
  rc: "",
  tp: "",
  capital: "",
  user_wants: "",
  if: "",
  tax_rate: 0,
  charging_tax: false,
  business_email: "",
  city: "",
};


export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]); // Use typed Business
  const [clientsInfo, setClientsInfo] = useState<any[]>([]); // Keep as any if only for count
  const [invoicesInfo, setInvoicesInfo] = useState<any[]>([]); // Keep as any if only for count
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // --- State for Business Form Inputs ---
  const [businessFormData, setBusinessFormData] = useState(initialBusinessFormState);

  // --- State for Editing Business ---
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  // --- State for Dropdown and Delete Confirmation (for Businesses) ---
  const [activeBusinessDropdown, setActiveBusinessDropdown] = useState<string | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session:", sessionError.message);
      setUserInfo(null); setIsLoading(false); return;
    }

    const user = sessionData.session?.user;

    if (user) {
      // Fetch user profile (your existing logic)
      const { data: userData, error: userError } = await supabase
        .from("user") // Assuming your custom user table is named 'user'
        .select("name, email, created_at")
        .eq("user_id", user.id) // Assuming 'user_id' in your 'user' table matches auth.users.id
        .maybeSingle();

      if (userError) console.error("Error fetching user profile:", userError.message);
      setUserInfo(userData || null);

      // Fetch Businesses
      const { data: businessData, error: businessFetchError } = await supabase
        .from("business")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (businessFetchError) console.error("Error fetching businesses:", businessFetchError.message);
      setBusinesses(businessData || []);

      // Fetch counts for clients and invoices (your existing logic)
      if (businessData && businessData.length > 0) {
        const businessIds = businessData.map((b) => b.id);
        const { data: clientsData } = await supabase.from("client").select("id, created_at").in("business_id", businessIds);
        setClientsInfo(clientsData || []);
        const { data: invoicesData } = await supabase.from("invoice").select("id, created_at").in("business_id", businessIds);
        setInvoicesInfo(invoicesData || []);
      } else {
        setClientsInfo([]);
        setInvoicesInfo([]);
      }
    } else {
      setUserInfo(null);
      setBusinesses([]);
      setClientsInfo([]);
      setInvoicesInfo([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; // For checkbox

    setBusinessFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };


  const resetBusinessForm = () => {
    setBusinessFormData(initialBusinessFormState);
    setEditingBusiness(null);
  };

  const handleOpenModalForCreateBusiness = () => {
    resetBusinessForm();
    setShowModal(true);
  };

  const handleOpenModalForEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    // Map existing business data to form state
    // Ensure all fields from Business type are handled
    setBusinessFormData({
        business_name: business.business_name || "",
        country: business.country || "",
        business_phone: business.business_phone || "",
        business_ice: business.business_ice || "",
        business_address: business.business_address || "",
        postal_code: business.postal_code || "",
        rc: business.rc || "",
        tp: business.tp || "",
        capital: business.capital || "",
        user_wants: business.user_wants || "",
        if: business.if || "", // or 'fiscal_identifier'
        tax_rate: business.tax_rate || 0,
        charging_tax: business.charging_tax || false,
        business_email: business.business_email || "",
        city: business.city || "",
    });
    setShowModal(true);
    setActiveBusinessDropdown(null);
  };

  const closeBusinessModal = () => {
    setShowModal(false);
    resetBusinessForm();
  };

  const handleBusinessSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
     const { data: sessionData } = await supabase.auth.getSession();
     const user = sessionData.session?.user;

    if (!user) {
        alert("You must be logged in to save a business.");
        return;
    }
    if (!businessFormData.business_name.trim()) {
        alert("Business name is required.");
        return;
    }

    const payload = {
        ...businessFormData,
        tax_rate: Number(businessFormData.tax_rate) || 0, // Ensure tax_rate is a number
    };

    let Dberror = null;

    if (editingBusiness) {
      const { error } = await supabase
        .from("business")
        .update(payload)
        .eq("id", editingBusiness.id)
        .eq("user_id", user.id); // Important for RLS and security
      Dberror = error;
    } else {
      const { error } = await supabase
        .from("business")
        .insert({ ...payload, user_id: user.id });
      Dberror = error;
    }

    if (!Dberror) {
      closeBusinessModal();
      fetchData(); // Refetch all data including businesses
    } else {
      console.error("Error saving business:", Dberror.message);
      alert(`Error saving business: ${Dberror.message}`);
    }
  };

  // --- Delete Logic for Business ---
  const handleDeleteBusiness = async (businessId: string) => {
    if (!businessId) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) { alert("User not authenticated."); return; }


    const { error } = await supabase
      .from("business")
      .delete()
      .eq("id", businessId)
      .eq("user_id", user.id); // Ensure user can only delete their own

    if (error) {
      console.error("Error deleting business:", error.message);
      alert(`Error deleting business: ${error.message}. Make sure there are no associated invoices or clients.`);
    } else {
      fetchData();
      setShowDeleteConfirmModal(false);
      setBusinessToDelete(null);
    }
  };

  const openDeleteBusinessConfirmation = (business: Business) => {
    setBusinessToDelete(business);
    setShowDeleteConfirmModal(true);
    setActiveBusinessDropdown(null);
  };

  const closeDeleteBusinessConfirmation = () => {
    setShowDeleteConfirmModal(false);
    setBusinessToDelete(null);
  };

  const toggleBusinessDropdown = (businessId: string) => {
    setActiveBusinessDropdown(activeBusinessDropdown === businessId ? null : businessId);
  };


  if (isLoading && !userInfo) return <div className="flex justify-center items-center h-screen"><p className="text-gray-500 text-lg">Loading your dashboard...</p></div>;
  if (!userInfo && !isLoading) return <div className="flex justify-center items-center h-screen"><p className="text-red-500 text-lg">Could not load user information. Please try logging in again.</p></div>;


  return (
    <div className="space-y-4 p-3 mt-16 h-[calc(100vh-64px)]">
      <div className="bg-white p-6 rounded h-full overflow-auto">
        {/* Summary Cards (Your existing JSX) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <ReceiptText className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <p className="text-neutral-600 text-sm">Invoices</p>
            <p className="text-black text-lg font-bold my-2">
              {invoicesInfo.length}
            </p>
            {invoicesInfo.length > 0 && (
                <p className="text-neutral-600 text-xs">
                    Last: {new Date([...invoicesInfo].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at).toLocaleDateString("fr-FR")}
                </p>
            )}
          </div>
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <User className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <p className="text-neutral-600 text-sm">Clients</p>
            <p className="text-black text-lg font-bold my-2">
              {clientsInfo.length}
            </p>
             {clientsInfo.length > 0 && (
                <p className="text-neutral-600 text-xs">
                    Last: {new Date([...clientsInfo].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at).toLocaleDateString("fr-FR")}
                </p>
            )}
          </div>
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <ChartNoAxesCombined className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <p className="text-neutral-600 text-sm">Businesses</p>
            <p className="text-black text-lg font-bold my-2">
              {businesses.length}
            </p>
            {businesses.length > 0 && (
                <p className="text-neutral-600 text-xs">
                   Last: {new Date([...businesses].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at).toLocaleDateString("fr-FR")}
                </p>
            )}
          </div>
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <Plus className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <h2 className="text-sm font-semibold">Add New Business</h2>
            <button
              onClick={handleOpenModalForCreateBusiness}
              className="mt-8 cursor-pointer px-4 py-2 w-full font-semibold text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800"
            >
              Add Business
            </button>
          </div>
        </div>

        {/* Business Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-[#000000aa] bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={closeBusinessModal}
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold">
                {editingBusiness ? "Edit Business" : "Create Your Business"}
              </h2>
              <form
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3"
                onSubmit={handleBusinessSubmit}
              >
                {/* Business Name - Required */}
                <div className="sm:col-span-2">
                  <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input id="business_name" name="business_name" value={businessFormData.business_name} onChange={handleInputChange} placeholder="My Awesome Company" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" required />
                </div>

                {/* Email & Phone */}
                <div>
                  <label htmlFor="business_email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input id="business_email" name="business_email" type="email" value={businessFormData.business_email || ''} onChange={handleInputChange} placeholder="contact@company.com" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>
                <div>
                  <label htmlFor="business_phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input id="business_phone" name="business_phone" value={businessFormData.business_phone || ''} onChange={handleInputChange} placeholder="+123 456 7890" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>

                {/* Address Fields */}
                <div className="sm:col-span-2">
                  <label htmlFor="business_address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input id="business_address" name="business_address" value={businessFormData.business_address || ''} onChange={handleInputChange} placeholder="123 Main St" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input id="city" name="city" value={businessFormData.city || ''} onChange={handleInputChange} placeholder="Anytown" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>
                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input id="postal_code" name="postal_code" value={businessFormData.postal_code || ''} onChange={handleInputChange} placeholder="12345" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>
                 <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input id="country" name="country" value={businessFormData.country || ''} onChange={handleInputChange} placeholder="Your Country" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>


                {/* Legal/Financial Identifiers */}
                <div>
                  <label htmlFor="business_ice" className="block text-sm font-medium text-gray-700 mb-1">ICE</label>
                  <input id="business_ice" name="business_ice" value={businessFormData.business_ice || ''} onChange={handleInputChange} placeholder="ICE Number" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>
                <div>
                  <label htmlFor="rc" className="block text-sm font-medium text-gray-700 mb-1">RC</label>
                  <input id="rc" name="rc" value={businessFormData.rc || ''} onChange={handleInputChange} placeholder="RC Number" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>
                <div>
                  <label htmlFor="tp" className="block text-sm font-medium text-gray-700 mb-1">TP</label>
                  <input id="tp" name="tp" value={businessFormData.tp || ''} onChange={handleInputChange} placeholder="TP Number" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>
                 <div>
                  <label htmlFor="if_field" className="block text-sm font-medium text-gray-700 mb-1">IF (Fiscal ID)</label> {/* Renamed id/name for 'if' */}
                  <input id="if_field" name="if" value={businessFormData.if || ''} onChange={handleInputChange} placeholder="Fiscal Identifier" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>
                <div>
                  <label htmlFor="capital" className="block text-sm font-medium text-gray-700 mb-1">Capital</label>
                  <input id="capital" name="capital" value={businessFormData.capital || ''} onChange={handleInputChange} placeholder="e.g., 100000" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>


                {/* Tax Fields */}
                <div>
                  <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input id="tax_rate" name="tax_rate" type="number" value={businessFormData.tax_rate || ''} onChange={handleInputChange} placeholder="e.g., 20" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" min="0" step="0.01" />
                </div>
                <div className="sm:col-span-2 flex items-center space-x-2 pt-2">
                  <input id="charging_tax" name="charging_tax" type="checkbox" checked={businessFormData.charging_tax} onChange={handleInputChange} className="h-4 w-4 accent-blue-600" />
                  <label htmlFor="charging_tax" className="text-sm font-medium text-gray-700">Is Charging Tax?</label>
                </div>

                {/* User Wants - Optional */}
                <div className="sm:col-span-2">
                  <label htmlFor="user_wants" className="block text-sm font-medium text-gray-700 mb-1">User Wants (Optional)</label>
                  <input id="user_wants" name="user_wants" value={businessFormData.user_wants || ''} onChange={handleInputChange} placeholder="e.g., Specific invoicing features" className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full" />
                </div>

                <button
                  type="submit"
                  className="sm:col-span-2 mt-3 cursor-pointer border border-blue-600 text-blue-600 py-2.5 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  {editingBusiness ? "Update Business" : "Save Business"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Businesses List */}
        {isLoading && businesses.length === 0 ? (
             <p className="font-light text-gray-500 mt-6 text-center">Loading businesses...</p>
        ) : businesses.length > 0 ? (
          <div className="mt-8 border border-neutral-300 border-dashed rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Your Businesses</h2>
            <div className="">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 rounded">
                  <tr className="h-14">
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tl-lg">Name</th>
                    <th className="px-4 font-light text-gray-500 py-2">Email</th>
                    <th className="px-4 font-light text-gray-500 py-2">City</th>
                    <th className="px-4 font-light text-gray-500 py-2">ICE</th>
                    <th className="px-4 font-light text-gray-500 py-2">Taxed</th>
                    <th className="px-4 font-light text-gray-500 py-2">Date</th>
                    <th className="px-4 font-light text-gray-500 py-2 text-right rounded-tr-lg"></th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((biz) => (
                    <tr
                      key={biz.id}
                      className="h-14 border-b border-neutral-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium text-gray-800">{biz.business_name}</td>
                      <td className="px-4 py-2">{biz.business_email || "-"}</td>
                      <td className="px-4 py-2">{biz.city || "-"}</td>
                      <td className="px-4 py-2">{biz.business_ice || "-"}</td>
                      <td className="px-4 py-2">
                        {biz.charging_tax ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(biz.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-2 relative text-right">
                        <button
                          onClick={() => toggleBusinessDropdown(biz.id)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-600"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {activeBusinessDropdown === biz.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-20 border border-gray-200 text-left">
                            <ul className="py-1">
                              <li>
                                <button
                                  onClick={() => handleOpenModalForEditBusiness(biz)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Edit
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => openDeleteBusinessConfirmation(biz)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !isLoading && (
          <p className="font-light text-gray-500 mt-6 text-center">
            No businesses found. Add your first business to get started!
          </p>
        )}

        {/* Delete Business Confirmation Modal */}
        {showDeleteConfirmModal && businessToDelete && (
          <div className="fixed inset-0 bg-[#000000aa] bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 space-y-4 w-full max-w-md">
               <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
                <button onClick={closeDeleteBusinessConfirmation} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the business: <strong>{businessToDelete.business_name}</strong>?
              </p>
              <p className="text-sm text-red-500">This action cannot be undone and might affect associated invoices and clients if not handled by database constraints.</p>
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  onClick={closeDeleteBusinessConfirmation}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteBusiness(businessToDelete.id)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Business
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}