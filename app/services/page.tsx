"use client";

import { useEffect, useState, FormEvent } from "react"; // Added FormEvent
import { supabase } from "@/lib/supabase";
import { Plus, MoreVertical, X } from "lucide-react"; // Added MoreVertical and X for icons

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  tax: number;
  created_at: string;
  business_id: string; // Ensure business_id is part of the Product type
};

type Business = {
  id: string;
  business_name: string;
};

export default function ProductsPage() { // Renamed to follow PascalCase convention
  const [products, setProducts] = useState<Product[]>([]); // Renamed for consistency
  const [showModal, setShowModal] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]); // Typed Business

  // --- State for Form Inputs ---
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState<number | string>(""); // Allow string for input, parse to number on submit
  const [productTax, setProductTax] = useState<number | string>("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");

  // --- State for Editing ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- State for Dropdown and Delete Confirmation ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const fetchProductsAndBusinesses = async () => {
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
        const { data: productData, error: productError } = await supabase
          .from("product")
          .select("*")
          .in("business_id", businessIds)
          .order("created_at", { ascending: false }); // Optional: order products

        if (productError) console.error("Error fetching products:", productError);
        setProducts(productData || []);
      } else {
        setProducts([]); // No businesses, so no products
      }
    } else {
      setBusinesses([]);
      setProducts([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProductsAndBusinesses();
  }, []);

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductTax("");
    setSelectedBusinessId(businesses.length > 0 ? businesses[0].id : ""); // Default to first business or empty
    setEditingProduct(null);
  };

  const handleOpenModalForCreate = () => {
    resetForm();
    if (businesses.length > 0 && !selectedBusinessId) { // Pre-select first business if none selected
        setSelectedBusinessId(businesses[0].id);
    }
    setShowModal(true);
  };

  const handleOpenModalForEdit = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductDescription(product.description || "");
    setProductPrice(product.price);
    setProductTax(product.tax);
    setSelectedBusinessId(product.business_id);
    setShowModal(true);
    setActiveDropdown(null); // Close dropdown
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm(); // Also resets editingProduct
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedBusinessId) {
      alert("Please select a business.");
      return;
    }

    const productDataPayload = {
      name: productName,
      description: productDescription,
      price: Number(productPrice) || 0,
      tax: Number(productTax) || 0,
      business_id: selectedBusinessId,
    };

    let Dberror = null;

    if (editingProduct) {
      // Update existing product
      const { error } = await supabase
        .from("product")
        .update(productDataPayload)
        .eq("id", editingProduct.id);
      Dberror = error;
    } else {
      // Create new product
      const { error } = await supabase
        .from("product")
        .insert(productDataPayload);
      Dberror = error;
    }

    if (!Dberror) {
      closeModal();
      fetchProductsAndBusinesses();
    } else {
      console.error("Error saving product:", Dberror.message);
      alert(`Error saving product: ${Dberror.message}`);
    }
  };

  // --- Delete Logic ---
  const handleDeleteProduct = async (productId: string) => {
    if (!productId) return;

    const { error } = await supabase
      .from("product")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error.message);
      alert(`Error deleting product: ${error.message}`);
    } else {
      fetchProductsAndBusinesses();
      setShowDeleteConfirmModal(false);
      setProductToDelete(null);
    }
  };

  const openDeleteConfirmation = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirmModal(true);
    setActiveDropdown(null); // Close dropdown
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteConfirmModal(false);
    setProductToDelete(null);
  };

  const toggleDropdown = (productId: string) => {
    setActiveDropdown(activeDropdown === productId ? null : productId);
  };


  return (
    <div className="space-y-4 p-3 mt-16 h-[calc(100vh-64px)]">
      <div className="bg-white p-6 rounded h-full overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <Plus className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <h2 className="text-sm font-semibold">Add New Service</h2>
            <button
              onClick={handleOpenModalForCreate}
              className="mt-8 cursor-pointer px-4 py-2 w-full font-semibold text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800"
            >
              Add Service
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
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold">
                {editingProduct ? "Edit Service" : "Create New Service"}
              </h2>
              <form
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                onSubmit={handleSubmit}
              >
                <div className="sm:col-span-2">
                  <label htmlFor="business_id" className="block text-sm font-medium text-gray-700 mb-1">Business</label>
                  <select
                    id="business_id"
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
                     <p className="text-xs text-gray-500 mt-1">No businesses found. Please add a business first.</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    id="name"
                    name="name"
                    placeholder="e.g., Web Design"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (MAD)</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="e.g., 1500"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <label htmlFor="tax" className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                  <input
                    id="tax"
                    name="tax"
                    type="number"
                    placeholder="e.g., 20"
                    value={productTax}
                    onChange={(e) => setProductTax(e.target.value)}
                    className="p-2 rounded-lg h-10 bg-blue-50 text-sm w-full"
                    min="0"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Detailed description of the service"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="p-2 rounded-lg bg-blue-50 text-sm w-full min-h-[60px]"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  className="sm:col-span-2 mt-2 cursor-pointer border border-blue-600 text-blue-600 py-2.5 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  {editingProduct ? "Update Service" : "Save Service"}
                </button>
              </form>
            </div>
          </div>
        )}

        {isLoading ? (
             <p className="font-light text-gray-500 mt-6 text-center">Loading services...</p>
        ) : products.length > 0 ? (
          <div className="mt-6 border border-neutral-300 border-dashed rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Your services</h2>
            <div className="">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 rounded">
                  <tr className="h-14">
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tl-lg">Name</th>
                    <th className="px-4 font-light text-gray-500 py-2">Price</th>
                    <th className="px-4 font-light text-gray-500 py-2">Tax</th>
                    <th className="px-4 font-light text-gray-500 py-2">Business</th>
                    <th className="px-4 font-light text-gray-500 py-2">Date</th>
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tr-lg text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const businessName = businesses.find(b => b.id === product.business_id)?.business_name || "N/A";
                    return (
                    <tr
                      key={product.id}
                      className="h-14 border-b border-neutral-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium text-gray-800">{product.name}</td>
                      <td className="px-4 py-2">{product.price?.toFixed(2)} MAD</td>
                      <td className="px-4 py-2">{product.tax}%</td>
                      <td className="px-4 py-2">{businessName}</td>
                      <td className="px-4 py-2">
                        {new Date(product.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-2 relative text-right">
                        <button
                          onClick={() => toggleDropdown(product.id)}
                          className="p-1 cursor-pointer rounded hover:bg-gray-200 text-gray-600"
                          aria-haspopup="true"
                          aria-expanded={activeDropdown === product.id}
                        >
                          <MoreVertical size={18} />
                        </button>
                        {activeDropdown === product.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-20 border border-gray-200 text-left">
                            <ul className="py-1">
                              <li>
                                <button
                                  onClick={() => handleOpenModalForEdit(product)}
                                  className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Edit
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => openDeleteConfirmation(product)}
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
            No services found for your account. Add a service to get started.
          </p>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && productToDelete && (
          <div className="fixed inset-0 bg-[#000000aa] bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 space-y-4 w-full max-w-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
              </div>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the service: <strong>{productToDelete.name}</strong>?
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
                  onClick={() => handleDeleteProduct(productToDelete.id)}
                  className="px-4 cursor-pointer py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Service
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}