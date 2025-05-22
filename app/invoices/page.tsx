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
} from "@react-pdf/renderer";

const InvoicePdf = ({ invoice }: { invoice: any }) => {
  const styles = StyleSheet.create({
    page: { padding: 30 },
    section: { marginBottom: 10 },
    header: { fontSize: 20, marginBottom: 10 },
    line: { fontSize: 12, marginBottom: 4 },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Invoice: {invoice.title}</Text>
        <View style={styles.section}>
          <Text style={styles.line}>
            Date: {new Date(invoice.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.line}>Client: {invoice.client.name}</Text>
          <Text style={styles.line}>Email: {invoice.client.email || "-"}</Text>
          <Text style={styles.line}>
            Address: {invoice.client.address || "-"}
          </Text>
        </View>
        <Text style={styles.header}>Products</Text>
        {invoice.product.map((prod: any, idx: number) => (
          <Text key={idx} style={styles.line}>
            • {prod.name} — {prod.price} MAD (+{prod.tax}% tax)
          </Text>
        ))}
        <View style={styles.section}>
          <Text style={styles.line}>
            Subtotal: {invoice.subtotal.toFixed(2)} MAD
          </Text>
          <Text style={styles.line}>Total: {invoice.total.toFixed(2)} MAD</Text>
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
      .select("id, business_name")
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

      const blob = await pdf(<InvoicePdf invoice={invoiceData} />).toBlob();
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
              <h2 className="text-xl font-bold">Create New Invoice</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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

                <input
                  type="text"
                  placeholder="Invoice Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="col-span-2 p-2 rounded-lg h-10 bg-blue-50 text-sm"
                />

                <div className="col-span-2">
                  <label className="block font-medium mb-2">
                    Select Products
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
                          {product.name} — {product.price} MAD (+{product.tax}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="col-span-2 flex items-center gap-2">
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
