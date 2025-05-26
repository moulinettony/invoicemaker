import React from "react";

const PdfTest = () => {
  const invoice = {
    count: 3,
    created_at: new Date().toISOString(),
    business_name: "Your Company Name",
    business_city: "Casablanca",
    client: {
      name: "Client Name",
      email: "client@example.com",
      address: "123 Client Street",
      ice: "0011223344",
    },
    product: [
      { name: "Mehdi's box", description: "desc product", price: 20 },
      { name: "Design UI", description: "Figma to Web", price: 80 },
      { name: "Full Stack App", description: "React + Supabase", price: 120 },
    ],
    subtotal: 20,
    tax: 20,
    discount: 0,
    total: 24,
    amount_in_words: "Vingt-quatre dirhams",
  };

  const taxAmount = ((invoice.subtotal * invoice.tax) / 100).toFixed(2);

  return (
    <div className="h-screen mt-10 text-[16px] p-16 text-sm font-sans leading-relaxed w-[900px] mx-auto bg-white">
      <div className="flex justify-end mb-6">
        <div className="">
          <p className="text-[#0092FF] font-bold text-[32px]">Facture</p>
          <p>Nº {Number(invoice.count || 0) + 100}</p>
          <p>
            Date : {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      <div>
        <p className="font-semibold text-[12px] text-[#0092FF]">FACTURE POUR</p>
        <p>Nom : {invoice.client.name}</p>
        <p>{invoice.client.address}</p>
        <p>{invoice.business_city}</p>
        <p>Email : {invoice.client.email || "-"}</p>
        <p>
          <span className="font-bold">ICE:</span> {invoice.client.ice}
        </p>
      </div>

      <div className="mt-16 flex bg-[#A8DAFF] rounded-full p-5">
        <div className="w-1/12 font-semibold">#</div>
        <div className="w-9/12 font-semibold">Description</div>
        <div className="w-2/12 text-right font-semibold">Total (MAD)</div>
      </div>

      {invoice.product.map((prod, idx) => (
        <div
          key={idx}
          className={`flex p-5 rounded-full my-1 ${
            idx % 2 === 1 ? "bg-[#eee]" : ""
          } p-2 rounded`}
        >
          <div className="w-1/12">{idx + 1}</div>
          <div className="w-9/12">
            <p className="font-semibold">{prod.name}</p>
            <p className="text-[14px]">{prod.description}</p>
          </div>
          <div className="w-2/12 text-right">{prod.price.toFixed(2)}</div>
        </div>
      ))}

      <div className="mt-4 mb-6">
        <p>Sous-total : {invoice.subtotal.toFixed(2)} MAD</p>
        <p>
          TVA ({invoice.tax}%): {taxAmount} MAD
        </p>
        {invoice.discount > 0 && <p>Remise : {invoice.discount}%</p>}
        <p className="font-bold">Total TTC : {invoice.total.toFixed(2)} MAD</p>
      </div>

      <div className="italic mb-6">
        Montant en toutes lettres : {invoice.amount_in_words || "-"} TTC
      </div>

      <div className="text-xs space-y-1 mb-6">
        <p className="font-bold">Coordonnées bancaires :</p>
        <p>Libellé du compte : WEBDEV26</p>
        <p>Devise : Dirham Marocain - MAD</p>
        <p>RIB : 050 810 026 01092748 420 01 74</p>
        <p>IBAN : MA64050 810 026 01092748 420 01 74</p>
        <p>Code BIC : CAFGMAMCXXX</p>
      </div>

      <div className="text-right">
        <p>Merci pour votre confiance.</p>
        <p>Signature</p>
      </div>
    </div>
  );
};

export default PdfTest;
