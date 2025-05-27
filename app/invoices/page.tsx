"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";
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
  const amountInWords = formatAmountInWords(invoice.total);
  const totalTax = invoice.product.reduce((sum: number, prod: any) => {
    const price = Number(prod.price || 0);
    const tax   = Number(prod.tax   || 0);   // percentage (e.g. 20)
    return sum + (price * tax) / 100;
  }, 0).toFixed(2); 
  const styles = StyleSheet.create({
    page: {
      fontSize: 12,
      lineHeight: 1.3,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
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
      fontSize: 9,
      position: "absolute",
      bottom: 0,
      left: 0,
      backgroundColor: "#eee",
      padding: 12,
      borderTopRightRadius: 9999,
    },
    footerRight: {
      fontSize: 10,
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: "#A8DAFF",
      paddingHorizontal: 24,
      paddingVertical: 6,
      borderTopLeftRadius: 9999,
      fontWeight: "bold",
      textTransform: "uppercase",
      width: 300,
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
                {invoice.business_name}
              </Text>
              <Text style={{ maxWidth: 200, lineHeight: 0.7 }}>
                <Text style={styles.bold}>Adresse: </Text>
                {invoice.business_address}, {invoice.city}
              </Text>
              <Text>
                <Text style={styles.bold}>Email: </Text>
                {invoice.business_email || "-"}
              </Text>
              <Text>
                <Text style={styles.bold}>ICE: </Text>
                {invoice.business_ice}
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
            <Text style={styles.cell1}>#</Text>
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
              <Text style={styles.cell3}>{prod.price.toFixed(2)}</Text>
            </View>
          ))}

          <View style={{ marginTop: 60, alignItems: "flex-end" }}>
            <View style={{ width: "60%" }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Text>Total-HT :</Text>
                <Text>{invoice.subtotal.toFixed(2)} MAD</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Text>TVA:</Text>
                <Text>{totalTax} MAD</Text>
              </View>
              {invoice.discount > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text>Remise :</Text>
                  <Text>{invoice.discount}%</Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text>Total TTC :</Text>
                <Text>{invoice.total.toFixed(2)} MAD</Text>
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
          <View
            style={{
              paddingRight: 10,
              marginRight: 6,
              borderRight: 1,
              borderColor: "#999",
            }}
          >
            <Text>Capital</Text>
            <Text>100.000 Dhs</Text>
          </View>
          <View
            style={{
              paddingRight: 10,
              marginRight: 6,
              borderRight: 1,
              borderColor: "#999",
            }}
          >
            <Text>R.C.</Text>
            <Text>161861</Text>
          </View>
          <View
            style={{
              paddingRight: 10,
              marginRight: 6,
              borderRight: 1,
              borderColor: "#999",
            }}
          >
            <Text>TP</Text>
            <Text>25712072</Text>
          </View>
          <View style={{ paddingRight: 30 }}>
            <Text>I.F. 52582248</Text>
            <Text>ICE 003115391000030</Text>
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
  const [title, setTitle] = useState("");
  const [paid, setPaid] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  const subtotal = selectedProducts.reduce(
    (sum, product) => sum + Number(product.price || 0),
    0
  );
  const total = selectedProducts.reduce((sum, product) => {
    const price = Number(product.price || 0);
    const tax = Number(product.tax || 0);
    return sum + price + (price * tax) / 100;
  }, 0);

  const fetchBusinessData = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data: businessData } = await supabase
      .from("business")
      .select("*")
      .eq("user_id", user.id);

    setBusinesses(businessData || []);
  };

  const fetchClientsAndProducts = async (businessId: string) => {
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

  const fetchInvoices = async () => {
    const { data } = await supabase.from("invoice").select("*");
    setInvoices(data || []);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      fetchClientsAndProducts(selectedBusiness);
    }
  }, [selectedBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceData = {
      title,
      client: selectedClient,
      product: selectedProducts,
      subtotal,
      total,
      paid,
      business_id: selectedBusiness,
      product_count: selectedProducts.length,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("invoice").insert(invoiceData);

    if (!error) {
      setTitle("");
      setSelectedClient(null);
      setSelectedProducts([]);
      setPaid(false);
      setShowModal(false);
      fetchInvoices();

      // 🆕 Fetch full business info
      const { data: business } = await supabase
        .from("business")
        .select("*")
        .eq("id", selectedBusiness)
        .single();

      const fullInvoice = {
        ...invoiceData,
        business_name: business?.business_name,
        business_address: business?.business_address,
        city: business?.city,
        business_email: business?.business_email,
        business_ice: business?.business_ice,
      };

      const blob = await pdf(<InvoicePdf invoice={fullInvoice} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url);
    } else {
      console.error(error.message);
    }
  };

  return (
    <div className="space-y-4 p-3 mt-16 h-[calc(100vh-64px)]">
      <div className="bg-white p-6 rounded h-full overflow-auto">
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="relative border border-neutral-300 border-dashed rounded-xl p-4">
            <Plus className="absolute right-4 top-4 h-8 w-8 text-neutral-700 p-2 rounded bg-neutral-100" />
            <h2 className="text-sm font-semibold">Add New Invoice</h2>
            <button
              onClick={() => setShowModal(true)}
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
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold">Create New Invoice</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <select
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  required
                  className="col-span-2 p-2 rounded-lg h-10 border text-sm"
                >
                  <option value="">Select Business</option>
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.business_name}
                    </option>
                  ))}
                </select>

                {clients.length > 0 && (
                  <select
                    value={selectedClient?.id ?? ""}
                    onChange={(e) => {
                      const foundClient = clients.find(
                        (client) => String(client.id) === e.target.value
                      );
                      setSelectedClient(foundClient ?? null);
                    }}
                    required
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
                <div className="w-full">
                  <label className="block text-sm ml-1 mb-1 font-semibold">Invoice Title*:</label>
                  <input
                    type="text"
                    placeholder="Invoice Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="col-span-2 p-2 rounded-lg h-10 bg-blue-50 text-sm w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2 text-sm font-semibold">
                    Select Product(s):
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product)}
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
                        <span className="text-sm">
                          <span className="font-semibold">{product.name}</span>{" "}
                          ({product.price} MAD){" "}
                          <span className="italic text-xs">
                            +{product.tax}%
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="col-span-2 text-sm flex items-center gap-2 border-dashed border-neutral-400 border w-fit rounded p-1">
                  <input
                    type="checkbox"
                    checked={paid}
                    onChange={(e) => setPaid(e.target.checked)}
                  />
                  Mark as Paid
                </label>

                <div className="col-span-2 border-t pt-4 space-y-1 text-sm">
                  <p>
                    Subtotal: <strong>{subtotal.toFixed(2)} MAD</strong>
                  </p>
                  <p>
                    Total: <strong>{total.toFixed(2)} MAD</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  className="col-span-2 cursor-pointer border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50"
                >
                  Save Invoice
                </button>
              </form>
            </div>
          </div>
        )}

        {invoices.length > 0 ? (
          <div className="mt-6 border border-neutral-300 border-dashed rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Your Invoices</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 rounded">
                  <tr className="h-14">
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tl-lg">
                      Title
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Client Name
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Product Count
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Subtotal
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">
                      Total
                    </th>
                    <th className="px-4 font-light text-gray-500 py-2">Paid</th>
                    <th className="px-4 font-light text-gray-500 py-2 rounded-tr-lg">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="h-14 border-b border-neutral-200"
                    >
                      <td className="px-4 py-2">{invoice.title}</td>
                      <td className="px-4 py-2">{invoice.client.name}</td>
                      <td className="px-4 py-2">{invoice.product_count}</td>
                      <td className="px-4 py-2">{invoice.subtotal} MAD</td>
                      <td className="px-4 py-2">{invoice.total} MAD</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
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
