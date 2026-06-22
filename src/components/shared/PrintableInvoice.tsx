import { Invoice, InvoiceItem } from "./Billing";
import { formatCurrency, convertToIndianWords } from "../../utils/formatters";

interface PrintableInvoiceProps {
  invoice: Invoice;
  onClose: () => void;
}

type GroupedItem = {
  mainDesc: string;
  items: (InvoiceItem & { designation: string })[];
};

export const PrintableInvoice = ({ invoice, onClose }: PrintableInvoiceProps) => {
  const handlePrint = () => {
    const printContent = document.getElementById("printable-invoice")?.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow?.document.write(`
      <html>
        <head>
          <title>Tax Invoice - ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; padding: 10px; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice-container { max-width: 1000px; margin: 0 auto; background: white; }
            .header { border-bottom: 2px solid #1e3a8a; margin-bottom: 12px; text-align: center; }
            .company-name { font-size: 24px; font-weight: bold; color: #1e3a8a; }
            .services { display: flex; justify-content: center; gap: 15px; margin: 5px 0; font-size: 12px; }
            .address, .contact { font-size: 10px; margin: 3px 0; }
            .title { text-align: center; margin: 10px 0; }
            .title h3 { font-size: 18px; font-weight: bold; border-top: 1.5px solid black; border-bottom: 1.5px solid black; display: inline-block; padding: 4px 20px; }
            .service-period { text-align: center; background: #f3f4f6; padding: 4px; border-radius: 4px; margin: 8px 0; font-size: 11px; }
            .site-section { border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; background: #f9fafb; margin: 8px 0; }
            .site-section-title { font-weight: bold; font-size: 11px; margin-bottom: 4px; }
            .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px 15px; border: 1px solid #e5e7eb; border-radius: 4px; padding: 6px; margin: 8px 0; }
            .details-row { display: flex; justify-content: space-between; padding: 2px 0; border-bottom: 1px dashed #e5e7eb; font-size: 10px; }
            .label { font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10px; }
            th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: top; }
            th { background-color: #f5f5f5; color: #000; font-weight: 700; font-size: 10px; text-align: center; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .summary { width: 260px; margin-left: auto; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-top: 12px; }
            .summary-row { display: flex; justify-content: space-between; padding: 4px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
            .total-row { background: #eef2ff; font-weight: bold; font-size: 12px; }
            .words { background: #f3f4f6; padding: 8px; border-radius: 4px; margin: 12px 0; font-size: 10px; }
            .bank-details { margin: 12px 0; font-size: 9px; border-top: 1px solid #e5e7eb; padding-top: 6px; }
            .signatures { display: flex; justify-content: space-between; margin-top: 20px; }
            .signature-box { width: 160px; text-align: center; }
            .signature-line { border-top: 1px solid black; margin-top: 20px; padding-top: 5px; font-size: 10px; }
            .footer { text-align: center; font-size: 8px; color: #6b7280; margin-top: 10px; }
            @media print { button { display: none; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="invoice-container">${printContent}</div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow?.document.close();
  };

  const getFormattedPeriod = () => {
    if (invoice.servicePeriodFrom && invoice.servicePeriodTo) {
      const from = new Date(invoice.servicePeriodFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const to = new Date(invoice.servicePeriodTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${from} to ${to}`;
    }
    return "";
  };

  // ✅ Group items by main description, preserving designation from the item
  const groupedItems = (): GroupedItem[] => {
    const groups: GroupedItem[] = [];
    
    invoice.items.forEach(item => {
      let mainDesc = item.description;
      let designation = item.designation || "";

      // If no explicit designation, try to split on " - "
      if (!designation && mainDesc.includes(" - ")) {
        const parts = mainDesc.split(" - ");
        mainDesc = parts[0];
        designation = parts.slice(1).join(" - ");
      }

      const existing = groups.find(g => g.mainDesc === mainDesc);
      const itemWithDesignation = { ...item, designation };
      
      if (existing) {
        existing.items.push(itemWithDesignation);
      } else {
        groups.push({ mainDesc, items: [itemWithDesignation] });
      }
    });
    
    return groups;
  };

  const groups = groupedItems();
  const subtotal = invoice.items.reduce((s, i) => s + i.amount, 0);
  const total = invoice.amount;
  const sgst = invoice.tax / 2;
  const cgst = invoice.tax / 2;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-gray-100 p-2 flex justify-between border-b">
          <h2 className="text-md font-bold">Tax Invoice Preview</h2>
          <div className="space-x-2">
            <button onClick={handlePrint} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">
              🖨️ Print / Save as PDF
            </button>
            <button onClick={onClose} className="bg-gray-500 text-white px-3 py-1.5 rounded text-sm">
              Close
            </button>
          </div>
        </div>

        <div id="printable-invoice" className="p-4">
          {/* Header */}
          <div className="header">
            <div className="company-name">S.K. ENTERPRISES</div>
            <div className="services">Housekeeping &nbsp;|&nbsp; Parking &nbsp;|&nbsp; Waste Management</div>
            <div className="address">Office No.505, 5th Floor, Global Square Building, Deccan College Road, Yerawada, Pune - 411006</div>
            <div className="contact">📞 +91 9158984091 / +91 7028577271 &nbsp;|&nbsp; ✉️ s.k.enterprises7583@gmail.com</div>
          </div>

          <div className="title"><h3>TAX INVOICE</h3></div>
          {getFormattedPeriod() && <div className="service-period">{getFormattedPeriod()}</div>}

          {/* Site section */}
          <div className="site-section">
            <div className="site-section-title">Select Site / Client</div>
            <div className="text-sm"><strong>Site:</strong> {invoice.site || invoice.clientAddress || "—"}</div>
          </div>

          {/* Client details grid */}
          <div className="details-grid">
            <div className="details-row"><span className="label">Client Name</span><span>{invoice.client}</span></div>
            <div className="details-row"><span className="label">Invoice No</span><span>{invoice.invoiceNumber}</span></div>
            <div className="details-row"><span className="label">Address</span><span>{invoice.clientAddress || invoice.site || "—"}</span></div>
            <div className="details-row"><span className="label">Date</span><span>{invoice.date}</span></div>
            <div className="details-row"><span className="label">PAN NO</span><span>{invoice.panNumber || "ALKPK7734N"}</span></div>
            <div className="details-row"><span className="label">ST NO</span><span>{invoice.gstNumber || "27ALKPK7734NL2E"}</span></div>
            <div className="details-row"><span className="label">Service Tax Category</span><span>{invoice.serviceType || "Manpower"}</span></div>
            <div className="details-row"><span className="label">ESIC NO</span><span>{invoice.esicNumber || "33000457830001001"}</span></div>
            <div className="details-row"><span className="label">GST</span><span>{invoice.gstNumber || "27ALKPK7734NL2E"}</span></div>
            <div className="details-row"><span className="label">LWF NO</span><span>{invoice.lwfNumber || "PUN60715PROV"}</span></div>
            <div className="details-row"><span className="label">PF NO</span><span>{invoice.pfNumber || "PUPUN1012226"}</span></div>
          </div>

          {/* Items table with rowspan grouping */}
          <table>
            <thead>
              <tr>
                <th className="text-center" style={{ width: "35px" }}>SR NO</th>
                <th>DESCRIPTION</th>
                <th>DESIGNATION</th>
                <th className="text-center" style={{ width: "45px" }}>QTY</th>
                <th className="text-center" style={{ width: "45px" }}>DAYS</th>
                <th className="text-right" style={{ width: "80px" }}>RATE PER MONTH</th>
                <th className="text-right" style={{ width: "80px" }}>RATE (₹)</th>
                <th className="text-right" style={{ width: "100px" }}>AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, groupIdx) => {
                const rowSpan = group.items.length;
                const mainDesc = group.mainDesc;
                const periodLine = getFormattedPeriod() ? `For The Period Of ${getFormattedPeriod()}` : "";
                return group.items.map((item, idx) => (
                  <tr key={`${groupIdx}-${idx}`}>
                    {idx === 0 && (
                      <>
                        <td rowSpan={rowSpan} className="text-center align-middle">{groupIdx + 1}</td>
                        <td rowSpan={rowSpan} className="align-middle">
                          {mainDesc}<br />
                          {periodLine && <span className="text-xs">{periodLine}</span>}
                        </td>
                      </>
                    )}
                    <td>{item.designation || "-"}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-center">{item.days ?? "-"}</td>
                    <td className="text-right">{item.monthlyRate ? formatCurrency(item.monthlyRate) : "-"}</td>
                    <td className="text-right">{formatCurrency(item.rate)}</td>
                    <td className="text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>

          {/* Tax Summary */}
          <div className="summary">
            <div className="summary-row"><span>Net Taxable Value</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="summary-row"><span>SGST @9%</span><span>{formatCurrency(sgst)}</span></div>
            <div className="summary-row"><span>CGST @9%</span><span>{formatCurrency(cgst)}</span></div>
            {invoice.managementFeesAmount && <div className="summary-row"><span>Management Fees ({invoice.managementFeesPercent || 0}%)</span><span>{formatCurrency(invoice.managementFeesAmount)}</span></div>}
            {invoice.roundUp !== undefined && invoice.roundUp !== 0 && <div className="summary-row"><span>Round Up</span><span>{formatCurrency(invoice.roundUp)}</span></div>}
            <div className="summary-row total-row"><span>Total Amount</span><span>{formatCurrency(total)}</span></div>
          </div>

          <div className="words">
            <div className="label">Amount in words:</div>
            <div>{convertToIndianWords(total)}</div>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <div className="label" style={{ fontWeight: "bold", marginBottom: "2px" }}>Terms & Conditions</div>
            <div style={{ fontSize: "9px" }}>
              {invoice.termsConditions || "We declare that this invoice shows the actual price of the goods & service described and that all particulars are true and correct."}
            </div>
          </div>

          <div className="bank-details">
            <div>Account No.: {invoice.accountNumber || "61068661338"} | IFSC Code: {invoice.ifscCode || "MAHB0001223"}</div>
            <div>Account Name: S.K. ENTERPRISES</div>
          </div>

          <div className="signatures">
            <div className="signature-box"><div className="signature-line">Receiver's Signature</div></div>
            <div className="signature-box"><div className="signature-line">Authorized Signatory</div></div>
          </div>
          <div className="footer">This is a Computer Generated Document</div>
        </div>
      </div>
    </div>
  );
};