"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, MoreVertical } from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { formatAmountInWords } from "@/utils/n2words";

const InvoicePdf = ({ invoice }: { invoice: any }) => {
  const formatCurrency = (value: number | string | undefined | null) => {
    const num = Number(value || 0);
    const parts = num.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
  };
  let actualDiscountAmount = 0;
  if (invoice.discount_type === "percentage") {
    actualDiscountAmount =
      Number(invoice.subtotal || 0) *
      (Number(invoice.discount_value || 0) / 100);
  } else {
    actualDiscountAmount = Number(invoice.discount_value || 0);
    if (actualDiscountAmount > Number(invoice.subtotal || 0)) {
      actualDiscountAmount = Number(invoice.subtotal || 0);
    }
  }
  const totalTax = invoice.product
    .reduce((sum: number, prod: any) => {
      const originalPrice = Number(prod.price || 0);
      let itemEffectiveDiscount = 0;

      // Distribute the actualDiscountAmount proportionally
      if (Number(invoice.subtotal || 0) > 0) {
        // Avoid division by zero
        itemEffectiveDiscount =
          (originalPrice / Number(invoice.subtotal || 0)) *
          actualDiscountAmount;
      }

      const priceAfterDiscount = originalPrice - itemEffectiveDiscount;
      const taxRate = Number(prod.tax || 0);
      return sum + (priceAfterDiscount * taxRate) / 100;
    }, 0)
    .toFixed(2);
  const amountInWords = formatAmountInWords(invoice.total);
  const styles = StyleSheet.create({
    page: {
      fontSize: 12,
      lineHeight: 1.3,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      marginBottom: 4,
    },
    section: {
      marginBottom: 10,
    },
    bold: {
      fontWeight: "bold",
    },
    line: {
      marginBottom: 4,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#A8DAFF",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 9999,
      marginTop: 20,
    },
    tableRow: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 9999,
    },
    altRow: {
      backgroundColor: "#eee",
    },
    cell1: { width: "10%" },
    cell2: { width: "70%" },
    cell3: { width: "20%", textAlign: "right" },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: "#A8DAFF",
      paddingTop: 6,
      paddingBottom: 6,
      paddingRight: 12,
      paddingLeft: 12,
      borderRadius: 9999,
      fontWeight: "bold",
    },
    bankDetails: {
      position: "absolute",
      fontSize: 10,
      left: 10,
      bottom: 60,
    },
    footerLeft: {
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 9,
      gap: 9,
      position: "absolute",
      bottom: 0,
      left: 0,
      backgroundColor: "#eee",
      padding: 12,
      borderTopRightRadius: 9999,
      width: "70%",
    },
    footerRight: {
      fontSize: 10,
      position: "absolute",
      marginBottom: -4,
      bottom: 0,
      right: 0,
      backgroundColor: "#A8DAFF",
      paddingHorizontal: 14,
      textAlign: "center",
      paddingVertical: 6,
      borderTopLeftRadius: 9999,
      fontWeight: "semibold",
      textTransform: "uppercase",
      width: "35%",
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ paddingTop: 40, paddingHorizontal: 40 }}>
          <View style={styles.row}>
            <View style={{ fontSize: 10 }}>
              <Image
                src="https://dbzxjogjhqzxtebpvhre.supabase.co/storage/v1/object/public/images/webdev.png"
                style={{ height: 28, width: 140, marginBottom: 60 }}
              />
              <Text style={{ color: "#0092FF", fontSize: 10, fontWeight: 600 }}>
                FACTURE POUR
              </Text>
              <Text
                style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}
              >
                {invoice.client.name}
              </Text>
              <Text style={{ maxWidth: 200, lineHeight: 0.7 }}>
                <Text style={styles.bold}>Adresse: </Text>
                {invoice.client.address}
              </Text>
              <Text>
                <Text style={styles.bold}>Email: </Text>
                {invoice.client.email || "-"}
              </Text>
              <Text>
                <Text style={styles.bold}>ICE: </Text>
                {invoice.client.ice}
              </Text>
            </View>
            <View style={{ marginBottom: 40 }}>
              <Text
                style={{
                  color: "#0092FF",
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                Facture
              </Text>
              <Text>Nº {Number(invoice.count || 0) + 100}</Text>
              <Text>
                Date :{" "}
                {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                Webdev 26
              </Text>
              <Text>45 avenue de France</Text>
              <Text>Rabat 10020, Maroc</Text>
            </View>
          </View>

          <View style={styles.tableHeader}>
            <Text style={styles.cell1}></Text>
            <Text style={styles.cell2}>Description</Text>
            <Text style={styles.cell3}>Total (MAD)</Text>
          </View>

          {invoice.product.map((prod: any, idx: any) => (
            <View
              key={idx}
              style={[
                styles.tableRow,
                ...(idx % 2 === 1 ? [styles.altRow] : []),
              ]}
            >
              <Text style={styles.cell1}>{idx + 1}</Text>
              <View style={styles.cell2}>
                <Text style={styles.bold}>{prod.name}</Text>
                <Text>{prod.description}</Text>
              </View>
              <Text style={styles.cell3}>{formatCurrency(prod.price)}</Text>
            </View>
          ))}

          <View style={{ marginTop: 60, alignItems: "flex-end" }}>
            <View style={{ width: "60%" }}>
              <View style={styles.row}>
                {" "}
                {/* Assuming styles.row handles layout */}
                <Text>Total-HT :</Text>
                <Text>{formatCurrency(invoice.subtotal)} MAD</Text>
              </View>

              {Number(invoice.discount_value || 0) > 0 && (
                <View style={styles.row}>
                  <Text>Remise:</Text>
                  <Text>-{formatCurrency(actualDiscountAmount)} MAD</Text>
                </View>
              )}

              <View style={styles.row}>
                <Text>TVA:</Text>
                <Text>{formatCurrency(totalTax)} MAD</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Total TTC :</Text>
                <Text>{formatCurrency(invoice.total)} MAD</Text>
              </View>
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 6,
                  color: "#666",
                  paddingHorizontal: 12,
                  fontStyle: "italic",
                }}
              >
                Facture arrêtée à la somme de {amountInWords || "-"}
                dirhams TTC
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  marginTop: 12,
                  textTransform: "uppercase",
                }}
              >
                signature
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bankDetails}>
          <Text style={styles.bold}>Coordonnées bancaires :</Text>
          <Text>
            <Text style={styles.bold}>Libellé du compte :</Text> WEBDEV26
          </Text>
          <Text>
            <Text style={styles.bold}>Devise :</Text> Dirham Marocain - MAD
          </Text>
          <Text>
            <Text style={styles.bold}>RIB :</Text> 050 810 026 01092748 420 01
            74
          </Text>
          <Text>
            <Text style={styles.bold}>IBAN :</Text> MA64050 810 026 01092748 420
            01 74
          </Text>
          <Text>
            <Text style={styles.bold}>Code BIC :</Text> CAFGMAMCXXX
          </Text>
        </View>

        <View style={styles.footerLeft}>
          <View>
            <Text>Capital</Text>
            <Text>100.000 Dhs</Text>
          </View>
          <View
            style={{
              paddingLeft: 10,
              borderLeft: 1,
              borderColor: "#999",
            }}
          >
            <Text>R.C.</Text>
            <Text>161861</Text>
          </View>
          <View
            style={{
              paddingLeft: 10,
              borderLeft: 1,
              borderColor: "#999",
            }}
          >
            <Text>TP</Text>
            <Text>25712072</Text>
          </View>
          <View
            style={{
              paddingLeft: 10,
              borderLeft: 1,
              borderColor: "#999",
            }}
          >
            <Text>I.F.</Text>
            <Text>52582248</Text>
          </View>
          <View
            style={{
              paddingLeft: 10,
              paddingRight: 30,
              borderLeft: 1,
              borderColor: "#999",
            }}
          >
            <Text>ICE</Text>
            <Text>003115391000030</Text>
          </View>
        </View>

        <View style={styles.footerRight}>
          <Text>Merci pour votre confiance.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function InvoicesPage() {
  const [showModal, setShowModal] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [paid, setPaid] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true); // Added loading state for invoices
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // To track which dropdown is open
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any | null>(null);

  const originalSubtotal = selectedProducts.reduce(
    (sum, product) => sum + Number(product.price || 0),
    0
  );
  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = originalSubtotal * (Number(discountValue || 0) / 100);
  } else {
    // Fixed amount
    discountAmount = Number(discountValue || 0);
    // Ensure fixed discount doesn't make subtotal negative (optional, but good practice)
    if (discountAmount > originalSubtotal) {
      discountAmount = originalSubtotal; // Cap discount at subtotal
    }
  }
  const subtotalAfterDiscount = originalSubtotal - discountAmount;

  const totalTaxOnDiscountedItems = selectedProducts.reduce((sum, product) => {
    const price = Number(product.price || 0);
    let itemEffectiveDiscount = 0;

    if (originalSubtotal > 0) {
      // Avoid division by zero if no products
      // Distribute the total invoice discount proportionally to each item's price
      itemEffectiveDiscount = (price / originalSubtotal) * discountAmount;
    }

    const priceAfterItemDiscount = price - itemEffectiveDiscount;
    const tax = Number(product.tax || 0);
    return sum + (priceAfterItemDiscount * tax) / 100;
  }, 0);

  const total = subtotalAfterDiscount + totalTaxOnDiscountedItems;

  const fetchBusinessData = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return []; // Return empty array or handle appropriately

    const { data: businessData, error } = await supabase
      .from("business")
      .select("id, business_name")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching businesses:", error);
      setBusinesses([]);
      return [];
    }
    setBusinesses(businessData || []);
    return businessData || []; // Return the fetched businesses
  };

  const fetchClientsAndProducts = async (businessId: string) => {
    if (!businessId) {
      setClients([]);
      setProducts([]);
      return;
    }
    const { data: clientsData } = await supabase
      .from("client")
      .select("*")
      .eq("business_id", businessId);
    const { data: productsData } = await supabase
      .from("product")
      .select("*")
      .eq("business_id", businessId);
    setClients(clientsData || []);
    setProducts(productsData || []);
  };

  const fetchUserInvoices = async () => {
    setIsLoadingInvoices(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setInvoices([]);
      setIsLoadingInvoices(false);
      return;
    }

    const { data: userBusinesses, error: businessError } = await supabase
      .from("business")
      .select("id")
      .eq("user_id", user.id);

    if (businessError) {
      console.error("Error fetching user businesses:", businessError.message);
      setInvoices([]);
      setIsLoadingInvoices(false);
      return;
    }

    if (!userBusinesses || userBusinesses.length === 0) {
      setInvoices([]);
      setIsLoadingInvoices(false);
      return;
    }

    const businessIds = userBusinesses.map((b) => b.id);

    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoice")
      .select("*")
      .in("business_id", businessIds)
      .order("created_at", { ascending: false });

    if (invoiceError) {
      console.error("Error fetching invoices:", invoiceError.message);
      setInvoices([]);
    } else {
      setInvoices(invoiceData || []);
    }
    setIsLoadingInvoices(false);
  };

  useEffect(() => {
    fetchBusinessData();
    fetchUserInvoices();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      fetchClientsAndProducts(selectedBusiness);
    } else {
      setClients([]);
      setProducts([]);
    }
  }, [selectedBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBusiness || !selectedClient || selectedProducts.length === 0) {
      alert("Please select a business, client, and at least one service.");
      return;
    }

    // Recalculate discountAmount and totals (your existing logic is good here)
    let finalDiscountAmount = 0;
    if (discountType === "percentage") {
      finalDiscountAmount =
        originalSubtotal * (Number(discountValue || 0) / 100);
    } else {
      // Fixed amount
      finalDiscountAmount = Number(discountValue || 0);
      if (finalDiscountAmount > originalSubtotal) {
        finalDiscountAmount = originalSubtotal;
      }
    }
    const finalSubtotalAfterDiscount = originalSubtotal - finalDiscountAmount;
    const finalTotalTax = selectedProducts.reduce((sum, product) => {
      const price = Number(product.price || 0);
      let itemEffectiveDiscount = 0;
      if (originalSubtotal > 0) {
        itemEffectiveDiscount =
          (price / originalSubtotal) * finalDiscountAmount;
      }
      const priceAfterItemDiscount = price - itemEffectiveDiscount;
      const tax = Number(product.tax || 0);
      return sum + (priceAfterItemDiscount * tax) / 100;
    }, 0);
    const finalTotal = finalSubtotalAfterDiscount + finalTotalTax;

    // This is the payload for both insert and update
    const invoicePayload = {
      // Renamed from invoiceData for clarity with my previous suggestions
      client: selectedClient,
      product: selectedProducts,
      subtotal: originalSubtotal,
      discount_type: discountType,
      discount_value: Number(discountValue || 0),
      total: finalTotal,
      paid,
      business_id: selectedBusiness,
      product_count: selectedProducts.length,
    };

    let processedInvoice: any = null;
    let Dberror: any = null;

    if (editingInvoice) {
      const { data, error: updateError } = await supabase
        .from("invoice")
        .update(invoicePayload)
        .eq("id", editingInvoice.id) // Use the ID of the invoice being edited
        .select()
        .single();
      processedInvoice = data;
      Dberror = updateError;
    } else {
      const { data: insertedData, error: insertError } = await supabase // Using your variable names
        .from("invoice")
        .insert(invoicePayload) // Use invoicePayload
        .select()
        .single();
      processedInvoice = insertedData; // Use 'insertedData' as per your original
      Dberror = insertError;
    }

    if (!Dberror && processedInvoice) {
      closeModal();
      fetchUserInvoices(); // Refresh the list of invoices

      const { data: business } = await supabase
        .from("business")
        .select("*") // Select all necessary business fields for the PDF
        .eq("id", selectedBusiness) // selectedBusiness should be correct from the form
        .single();

      const fullInvoiceForPdf = {
        ...processedInvoice, // This now contains all fields of the saved/updated invoice
        // Add business details needed by InvoicePdf component
        business_name: business?.business_name,
        business_address: business?.business_address,
        city: business?.city,
        business_email: business?.business_email,
        business_ice: business?.business_ice,
        // Ensure 'count' is handled for PDF.
        // If 'count' was a sequential number from DB for new invoices, it might be part of 'processedInvoice'.
        // If not, or for updated invoices, you might use 'id' or another identifier.
        // The example below assumes 'count' might be in processedInvoice or defaults.
        count:
          processedInvoice.count !== undefined
            ? processedInvoice.count
            : (Number(processedInvoice.id) || 0) + 100,
      };

      const blob = await pdf(
        <InvoicePdf invoice={fullInvoiceForPdf} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url);
    } else {
      // Handle error
      const action = editingInvoice ? "updating" : "saving";
      console.error(`Error ${action} invoice:`, Dberror?.message);
      alert(`Error ${action} invoice: ${Dberror?.message}`);
    }
  };

  const resetForm = () => {
    setSelectedBusiness("");
    setSelectedClient(null);
    setSelectedProducts([]);
    setPaid(false);
    setDiscountType("percentage");
    setDiscountValue(0);
    setEditingInvoice(null); // Crucial
  };
  const handleOpenModalForCreate = () => {
    resetForm(); // Call reset before showing
    setShowModal(true);
  };

  const handleOpenModalForEdit = async (invoiceToEdit: any) => {
    setEditingInvoice(invoiceToEdit);
    setSelectedBusiness(invoiceToEdit.business_id); // Triggers client/product fetch

    // Assuming invoiceToEdit.client is the full client object and
    // invoiceToEdit.product is an array of full product objects
    setSelectedClient(invoiceToEdit.client);
    setSelectedProducts(invoiceToEdit.product || []);
    setPaid(invoiceToEdit.paid);
    setDiscountType(invoiceToEdit.discount_type || "percentage");
    setDiscountValue(invoiceToEdit.discount_value || 0);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  useEffect(() => {
    if (selectedBusiness) {
      fetchClientsAndProducts(selectedBusiness);
    } else {
      setClients([]);
      setProducts([]);
      // Add this condition to prevent clearing selections when populating for an edit
      if (!editingInvoice) {
        setSelectedClient(null);
        setSelectedProducts([]);
      }
    }
  }, [selectedBusiness, editingInvoice]);

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!invoiceId) return;

    const { error } = await supabase
      .from("invoice")
      .delete()
      .eq("id", invoiceId);

    if (error) {
      console.error("Error deleting invoice:", error.message);
      alert(`Error deleting invoice: ${error.message}`);
    } else {
      fetchUserInvoices(); // Refresh the invoice list
      setShowDeleteConfirmModal(false); // Close confirmation modal on success
      setInvoiceToDelete(null);
    }
  };

  const toggleDropdown = (invoiceId: string) => {
    setActiveDropdown(activeDropdown === invoiceId ? null : invoiceId);
  };

  const openEditModalWithInvoice = (invoice: any) => {
    handleOpenModalForEdit(invoice); // Your existing function
    setActiveDropdown(null); // Close dropdown
  };

  const openDeleteConfirmation = (invoice: any) => {
    setInvoiceToDelete(invoice);
    setShowDeleteConfirmModal(true);
    setActiveDropdown(null); // Close dropdown
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteConfirmModal(false);
    setInvoiceToDelete(null);
  };

  return (
    <div className="space-y-4 p-3 mt-16 h-[calc(100vh-64px)]">
      <div className="bg-white p-6 rounded h-full overflow-auto">
        <div className="grid grid-cols-4 gap-4 mt-4">
          {" "}
          {/* This grid seems to be just for the button */}
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <Plus className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <h2 className="text-sm font-semibold">Add New Invoice</h2>
            <button
              onClick={handleOpenModalForCreate}
              className="mt-8 cursor-pointer px-4 py-2 w-full mt-3 font-semibold text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-700"
            >
              Add Invoice
            </button>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-[#000000aa] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 space-y-4 relative">
              <button
                className="absolute cursor-pointer top-2 right-3 text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold">
                {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                {/* Business Select - NO CHANGE */}
                <select
                  value={selectedBusiness}
                  onChange={(e) => {
                    const newBusinessId = e.target.value;
                    setSelectedBusiness(newBusinessId);
                    // If business changes during an edit, or for a new form, reset client/products
                    if (
                      !editingInvoice ||
                      (editingInvoice &&
                        editingInvoice.business_id !== newBusinessId)
                    ) {
                      setSelectedClient(null);
                      setSelectedProducts([]);
                    }
                  }}
                  required // Good to have
                  className="col-span-2 p-2 rounded-lg h-10 border text-sm"
                >
                  <option value="">Select Business</option>
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.business_name}
                    </option>
                  ))}
                </select>

                {/* Client Select - NO CHANGE */}
                {selectedBusiness && clients.length > 0 && (
                  <select
                    value={selectedClient?.id ?? ""}
                    onChange={(e) => {
                      const foundClient = clients.find(
                        (client) => String(client.id) === e.target.value
                      );
                      setSelectedClient(foundClient ?? null);
                    }}
                    required // Good to have
                    className="col-span-2 p-2 rounded-lg h-10 border text-sm"
                  >
                    <option value="">Select Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                )}
                {/* Conditional message for no clients - NO CHANGE */}
                {selectedBusiness && clients.length === 0 && (
                  <p className="col-span-2 text-sm text-gray-500">
                    No clients found for the selected business. Please add
                    clients first.
                  </p>
                )}

                {/* Product Select - NO CHANGE */}
                <div className="col-span-2">
                  <label className="block mb-2 text-sm font-semibold">
                    Select Service(s):
                  </label>
                  {selectedBusiness && products.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            id={`product-${product.id}`}
                            checked={selectedProducts.some(
                              (p) => p.id === product.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([
                                  ...selectedProducts,
                                  product,
                                ]);
                              } else {
                                setSelectedProducts(
                                  selectedProducts.filter(
                                    (p) => p.id !== product.id
                                  )
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`product-${product.id}`}
                            className="text-sm cursor-pointer"
                          >
                            <span className="font-semibold">
                              {product.name}
                            </span>{" "}
                            ({product.price} MAD){" "}
                            <span className="italic text-xs">
                              +{product.tax}%
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="col-span-2 text-sm text-gray-500">
                      Select a business to see services.
                    </p>
                  )}
                </div>

                {/* === ADD DISCOUNT INPUT FIELD HERE === */}
                <div className="flex w-full gap-3">
                  <div className="w-1/2">
                    <label
                      htmlFor="discountType"
                      className="block mb-1 text-sm font-semibold"
                    >
                      Discount Type:
                    </label>
                    <select
                      id="discountType"
                      value={discountType}
                      onChange={(e) => {
                        setDiscountType(
                          e.target.value as "percentage" | "fixed"
                        );
                        setDiscountValue(0); // Reset value when type changes
                      }}
                      className="w-full p-1 h-8 rounded border text-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (MAD)</option>
                    </select>
                  </div>

                  {/* Discount Value Input */}
                  <div className="w-1/2">
                    <label
                      htmlFor="discountValue"
                      className="block mb-1 text-sm font-semibold"
                    >
                      Discount Value:
                    </label>
                    <input
                      type="number"
                      id="discountValue"
                      value={discountValue}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setDiscountValue(isNaN(val) || val < 0 ? 0 : val);
                      }}
                      min="0"
                      step="1"
                      className="w-full p-1 h-8 rounded border text-sm"
                      placeholder={
                        discountType === "percentage"
                          ? "e.g., 10 for 10%"
                          : "e.g., 50"
                      }
                    />
                  </div>
                </div>
                {/* Mark as Paid - NO CHANGE */}
                <label className="col-span-2 text-sm flex items-center gap-2 border cursor-pointer border-neutral-400 w-fit rounded p-1">
                  <input
                    type="checkbox"
                    checked={paid}
                    onChange={(e) => setPaid(e.target.checked)}
                  />
                  Mark as Paid
                </label>

                {/* === UPDATE TOTALS DISPLAY SECTION HERE === */}
                <div className="col-span-2 border-t pt-4 space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span>Subtotal (HT):</span>
                    {/* Assumes 'originalSubtotal' state/variable exists */}
                    <strong>{originalSubtotal.toFixed(2)} MAD</strong>
                  </p>

                  {Number(discountValue) > 0 && ( // Show if discountValue is entered
                    <>
                      <p className="flex justify-between">
                        <span>
                          Discount
                          {discountType === "percentage"
                            ? ` (${discountValue}%)`
                            : " (Fixed)"}
                          :
                        </span>
                        <strong className="text-red-500">
                          -{discountAmount.toFixed(2)} MAD
                        </strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Subtotal after Discount:</span>
                        <strong>{subtotalAfterDiscount.toFixed(2)} MAD</strong>
                      </p>
                    </>
                  )}

                  <p className="flex justify-between">
                    <span>TVA:</span>
                    {/* Assumes 'totalTaxOnDiscountedItems' state/variable exists */}
                    <strong>{totalTaxOnDiscountedItems.toFixed(2)} MAD</strong>
                  </p>
                  <p className="flex justify-between font-bold text-base mt-2 border-t pt-2">
                    <span>Total TTC:</span>
                    {/* Assumes 'total' (final total) state/variable exists */}
                    <strong>{total.toFixed(2)} MAD</strong>
                  </p>
                </div>

                {/* Save Invoice Button - NO CHANGE */}
                <button
                  type="submit"
                  className="col-span-2 cursor-pointer border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    !selectedBusiness ||
                    !selectedClient ||
                    selectedProducts.length === 0
                  }
                >
                  {editingInvoice ? "Update Invoice" : "Save Invoice"}
                </button>
              </form>
            </div>
          </div>
        )}

        {isLoadingInvoices ? (
          <p className="font-light text-gray-500 mt-6">Loading invoices...</p>
        ) : invoices.length > 0 ? (
          <div className="mt-6 border border-neutral-300 border-dashed rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Your Invoices</h2>
            <div className="">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr className="h-14">
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tl-lg">
                      Client Name
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Email
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Service Count
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Subtotal
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Total
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">Paid</th>
                    <th className="px-4 font-light text-gray-500 py-2">Date</th>
                    <th className="px-4 w-6 font-light text-gray-500 py-2 rounded-tr-lg">
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="h-14 border-b border-neutral-200"
                    >
                      <td className="px-4 py-2">
                        {invoice.client?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {invoice.client?.email   || "N/A"}
                      </td>
                      <td className="px-4 py-2">{invoice.product_count}</td>
                      <td className="px-4 py-2">
                        {invoice.subtotal?.toFixed(2)} MAD
                      </td>
                      <td className="px-4 py-2">
                        {invoice.total?.toFixed(2)} MAD
                      </td>
                      <td className="px-4 py-2">
                        {invoice.paid ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(invoice.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-4 py-2 relative">
                        {" "}
                        {/* Added 'relative' for dropdown positioning */}
                        <button
                          onClick={() => toggleDropdown(invoice.id)}
                          className="p-1 cursor-pointer rounded hover:bg-gray-200 text-gray-600"
                          aria-haspopup="true"
                          aria-expanded={activeDropdown === invoice.id}
                        >
                          <MoreVertical size={18} />
                        </button>
                        {activeDropdown === invoice.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <ul className="py-1">
                              <li>
                                <button
                                  onClick={() =>
                                    openEditModalWithInvoice(invoice)
                                  }
                                  className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Edit
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() =>
                                    openDeleteConfirmation(invoice)
                                  }
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
                  ))}
                </tbody>
              </table>
              {showDeleteConfirmModal && invoiceToDelete && (
                <div className="fixed inset-0 bg-[#000000aa] bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-5 space-y-4 w-full max-w-md">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Confirm Deletion
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Are you sure you want to delete the invoice for{" "}
                      <strong>
                        {invoiceToDelete.client?.name ||
                          `Invoice #${invoiceToDelete.id}`}{" "}
                        {invoiceToDelete.invoice?.total}
                      </strong>
                      ?
                    </p>
                    <p className="text-sm text-red-500">
                      This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={closeDeleteConfirmation}
                        className="px-4 cursor-pointer py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoiceToDelete.id)}
                        className="px-4 cursor-pointer py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete Invoice
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="font-light text-gray-500 mt-6">
            No invoices found for your account.
          </p>
        )}
      </div>
    </div>
  );
}
