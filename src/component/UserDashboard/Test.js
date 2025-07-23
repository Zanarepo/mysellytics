import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "../../supabaseClient";
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaDownload, FaQrcode, FaEdit } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReceiptQRCode({ singleReceipt = null }) {
  const storeId = localStorage.getItem("store_id");
  const [store, setStore] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(singleReceipt);
  const [saleGroup, setSaleGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ customer_name: "", customer_address: "", phone_number: "", warranty: "" });
  const itemsPerPage = 20;
  const [headerBgColor] = useState('#1E3A8A');
  const [headerTextColor] = useState('#FFFFFF');
  const [headerFont] = useState('font-serif');
  const [bodyFont] = useState('font-sans');
  const [watermarkColor] = useState('rgba(30,58,138,0.1)');
  const printRef = useRef();

  // Fetch store details
  useEffect(() => {
    if (!storeId) return;
    supabase
      .from("stores")
      .select("shop_name,business_address,phone_number,email_address")
      .eq("id", storeId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching store:', error);
          toast.error('Failed to fetch store details.');
        } else {
          setStore(data);
        }
      });
  }, [storeId]);

  // Fetch all receipts for the store (only for list view)
  useEffect(() => {
    if (!storeId || singleReceipt) return;
    const fetchReceipts = async () => {
      try {
        const { data: receiptData, error: receiptError } = await supabase
          .from("receipts")
          .select(`
            *,
            sale_groups (
              id,
              store_id,
              total_amount,
              payment_method,
              created_at,
              dynamic_sales (
                id,
                device_id,
                quantity,
                amount,
                sale_group_id,
                dynamic_product (
                  id,
                  name,
                  selling_price,
                  dynamic_product_imeis
                )
              )
            )
          `)
          .eq("store_receipt_id", storeId)
          .order('id', { ascending: false });

        if (receiptError) {
          console.error('Error fetching receipts:', receiptError);
          toast.error('Failed to fetch receipts.');
          return;
        }
        setReceipts(receiptData || []);
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred.');
      }
    };
    fetchReceipts();
  }, [storeId, singleReceipt]);

  // Filter receipts based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredReceipts(
      receipts.filter(r => {
        const dateStr = r.sale_groups ? new Date(r.sale_groups.created_at).toLocaleDateString().toLowerCase() : '';
        const fields = [
          r.receipt_id,
          r.customer_name,
          r.phone_number,
          r.warranty,
          dateStr
        ];
        return fields.some(f => f?.toString().toLowerCase().includes(term));
      })
    );
    setCurrentPage(1);
  }, [searchTerm, receipts]);

  // Set sale group for selected or single receipt
  useEffect(() => {
    if (!selectedReceipt) return;
    setSaleGroup(selectedReceipt.sale_groups);
  }, [selectedReceipt]);

  const getProductGroups = () => {
    if (!saleGroup || !saleGroup.dynamic_sales) return [];

    const productMap = new Map();
    saleGroup.dynamic_sales.forEach(sale => {
      const product = sale.dynamic_product;
      const deviceIds = product.dynamic_product_imeis?.split(',').filter(id => id.trim()) || [];
      const soldDeviceIds = sale.device_id?.split(',').filter(id => id.trim()) || deviceIds;
      const quantity = soldDeviceIds.length;
      const unitPrice = sale.amount / sale.quantity;
      const totalAmount = unitPrice * quantity;

      if (!productMap.has(product.id)) {
        productMap.set(product.id, {
          productId: product.id,
          productName: product.name,
          deviceIds: soldDeviceIds,
          quantity,
          unitPrice,
          totalAmount,
          sellingPrice: product.selling_price || unitPrice
        });
      } else {
        const existing = productMap.get(product.id);
        existing.deviceIds = [...new Set([...existing.deviceIds, ...soldDeviceIds])];
        existing.quantity = existing.deviceIds.length;
        existing.totalAmount = existing.unitPrice * existing.quantity;
      }
    });

    return Array.from(productMap.values());
  };

  const productGroups = getProductGroups();
  const totalQuantity = productGroups.reduce((sum, group) => sum + group.quantity, 0);
  const totalAmount = productGroups.reduce((sum, group) => sum + group.totalAmount, 0);

  const generatePDF = async () => {
    const element = printRef.current;
    if (!element) {
      toast.error('Receipt content not found.');
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 1, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const { width, height } = canvas;

      const pdfWidth = 595;
      const pdfHeight = 842;
      const aspectRatio = width / height;
      let newWidth = pdfWidth;
      let newHeight = pdfWidth / aspectRatio;

      if (newHeight > pdfHeight) {
        newHeight = pdfHeight;
        newWidth = pdfHeight * aspectRatio;
      }

      const pdf = new jsPDF({
        orientation: newWidth > newHeight ? 'landscape' : 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, newWidth, newHeight);
      pdf.save(`receipt-${selectedReceipt?.receipt_id}.pdf`);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Generate PDF error:', error);
      toast.error('Failed to generate PDF.');
    }
  };

  const handleViewQRCode = (receipt) => {
    setSelectedReceipt(receipt);
  };

  const openEdit = (receipt) => {
    setEditing(receipt);
    setForm({
      customer_name: receipt.customer_name || "",
      customer_address: receipt.customer_address || "",
      phone_number: receipt.phone_number || "",
      warranty: receipt.warranty || ""
    });
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const saveReceipt = async () => {
    try {
      await supabase.from("receipts").update({ ...editing, ...form }).eq("id", editing.id);
      setEditing(null);
      setForm({ customer_name: "", customer_address: "", phone_number: "", warranty: "" });
      const { data } = await supabase
        .from("receipts")
        .select(`
          *,
          sale_groups (
            id,
            store_id,
            total_amount,
            payment_method,
            created_at,
            dynamic_sales (
              id,
              device_id,
              quantity,
              amount,
              sale_group_id,
              dynamic_product (
                id,
                name,
                selling_price,
                dynamic_product_imeis
              )
            )
          )
        `)
        .eq("store_receipt_id", storeId)
        .order('id', { ascending: false });
      setReceipts(data);
      toast.success('Receipt updated successfully!');
    } catch (error) {
      console.error('Error updating receipt:', error);
      toast.error('Failed to update receipt.');
    }
  };

  const qrCodeUrl = selectedReceipt ? `${window.location.origin}/receipt/${selectedReceipt.receipt_id}` : '';

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (!storeId) {
    return <div className="p-4 text-center text-red-500">Select a store first.</div>;
  }

  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      .printable-area, .printable-area * { visibility: visible; }
      .printable-area { position: absolute; top:0; left:0; width:100%; }
      .printable-area table { page-break-inside: auto; }
      .printable-area tr { page-break-inside: avoid; page-break-after: auto; }
    }
  `;

  return (
    <>
      <style>{printStyles}</style>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="p-6 space-y-6 dark:bg-gray-900 dark:text-white">
        {!singleReceipt && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Store Receipts</h2>
            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by Receipt ID, Customer, Phone, Warranty, or Date"
                className="flex-1 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="min-w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Receipt ID</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Customer</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Phone</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Warranty</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Date</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReceipts.map((receipt, index) => (
                        <tr
                          key={receipt.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 even:bg-gray-50 dark:even:bg-gray-800 transition-colors"
                        >
                          <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 truncate">{receipt.receipt_id}</td>
                          <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 truncate">{receipt.customer_name || '-'}</td>
                          <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 truncate">{receipt.phone_number || '-'}</td>
                          <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 truncate">{receipt.warranty || '-'}</td>
                          <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">{new Date(receipt.sale_groups.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex gap-4">
                              <button
                                onClick={() => openEdit(receipt)}
                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleViewQRCode(receipt)}
                                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-2"
                              >
                                <FaQrcode /> View QR Code
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedReceipts.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center text-gray-500 dark:text-gray-400 py-6">
                            No receipts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredReceipts.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      Previous
                    </button>
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-lg ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      {(selectedReceipt || singleReceipt) && (
  <div className={singleReceipt ? "p-4 sm:p-0 space-y-6 dark:bg-gray-900 dark:text-white w-full" : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 overflow-auto"}>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-[95vw] sm:max-w-3xl flex flex-col max-h-[90vh]">
      {!singleReceipt && (
        <div className="flex justify-between items-center p-0 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Receipt QR Code</h2>
          <button
            onClick={() => setSelectedReceipt(null)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-0 sm:p-0">
        <div className="flex flex-col items-center gap-4 mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base text-center">
            Scan the QR code below to view and download the receipt.
          </p>
          <QRCodeCanvas value={qrCodeUrl} size={150} className="w-[120px] sm:w-[150px] h-auto" />
          <button
            onClick={generatePDF}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm sm:text-base"
          >
            <FaDownload /> Download Receipt
          </button>
        </div>
        <div ref={printRef} className="printable-area relative bg-white p-0 sm:p-6 shadow-lg rounded-lg w-full">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ color: watermarkColor, fontSize: '2rem sm:4rem', opacity: 0.1 }}>
            <span className={`${bodyFont}`}>{store?.shop_name || '-'}</span>
          </div>
          <div className={`p-3 sm:p-4 rounded-t ${headerFont}`} style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
            <h1 className="text-lg sm:text-2xl font-bold">{store?.shop_name || '-'}</h1>
            <p className="text-xs sm:text-sm">{store?.business_address || '-'}</p>
            <p className="text-xs sm:text-sm">Phone: {store?.phone_number || '-'}</p>
            <p className="text-xs sm:text-sm">Email: {store?.email_address || '-'}</p>

          </div>
          <div className="overflow-x-auto">
            <table className={`w-full border-none mb-4 mt-4 ${bodyFont} text-xs sm:text-sm`}>
              <thead>
                <tr className="hidden sm:table-row">
                  <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">Product</th>
                  <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">Device ID</th>
                  <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">Qty</th>
                  <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">Unit Price</th>
                  <th className="border px-2 sm:px-4 py-1 sm:py-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {productGroups.map((group, index) => (
                  <React.Fragment key={group.productId}>
                    <tr className="flex flex-col sm:table-row border-b sm:border-b-0 sm:bg-indigo-50 sm:dark:bg-gray-800">
                      <td className="border-b px-2 sm:px-4 py-1 sm:py-2 font-bold sm:font-normal flex sm:table-cell sm:border-b">
                        <span className="sm:hidden font-semibold mr-2">Product:</span>
                        {group.productName}
                      </td>
                      <td className="border-b px-2 sm:px-4 py-1 sm:py-2 sm:pl-6 flex sm:table-cell sm:border-b">
                        <span className="sm:hidden font-semibold mr-2">Device ID:</span>
                        {group.deviceIds.join(', ')}
                      </td>
                      <td className="border-b px-2 sm:px-4 py-1 sm:py-2 flex sm:table-cell sm:border-b">
                        <span className="sm:hidden font-semibold mr-2">Quantity:</span>
                        {group.quantity}
                      </td>
                      <td className="border-b px-2 sm:px-4 py-1 sm:py-2 flex sm:table-cell sm:border-b">
                        <span className="sm:hidden font-semibold mr-2">Unit Price:</span>
                        ₦{group.unitPrice.toFixed(2)}
                      </td>
                      <td className="border-b px-2 sm:px-4 py-1 sm:py-2 flex sm:table-cell sm:border-b">
                        <span className="sm:hidden font-semibold mr-2">Amount:</span>
                        ₦{group.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr className="flex flex-col sm:table-row">
                  <td colSpan="2" className="border px-2 sm:px-4 py-1 sm:py-2 text-right font-bold flex sm:table-cell sm:border-b">
                    <span className="sm:hidden font-semibold mr-2">Total:</span>
                  </td>
                  <td className="border px-2 sm:px-4 py-1 sm:py-2 flex sm:table-cell sm:border-b">
                    <span className="sm:hidden font-semibold mr-2">Total Quantity:</span>
                    {totalQuantity}
                  </td>
                  <td className="border px-2 sm:px-4 py-1 sm:py-2 flex sm:table-cell sm:border-b"></td>
                  <td className="border px-2 sm:px-4 py-1 sm:py-2 font-bold flex sm:table-cell sm:border-b">
                    <span className="sm:hidden font-semibold mr-2">Total Amount:</span>
                    ₦{totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-4 space-y-2 text-xs sm:text-sm">
            <p><strong>Receipt ID:</strong> {selectedReceipt.receipt_id}</p>
            <p><strong>Date:</strong> {new Date(saleGroup?.created_at).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> {saleGroup?.payment_method}</p>
            <p><strong>Customer Name:</strong> {selectedReceipt.customer_name || '-'}</p>
            <p><strong>Address:</strong> {selectedReceipt.customer_address || '-'}</p>
            <p><strong>Phone:</strong> {selectedReceipt.phone_number || '-'}</p>
            <p><strong>Warranty:</strong> {selectedReceipt.warranty || '-'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 p-4 mt-4">
            <div className="border-t text-center pt-2 text-xs sm:text-sm">Manager Signature</div>
            <div className="border-t text-center pt-2 text-xs sm:text-sm">Customer Signature</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-auto mt-10">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 space-y-6">
              <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Edit Receipt {editing.receipt_id}</h2>
              <div className="space-y-4">
                {['customer_name', 'customer_address', 'phone_number', 'warranty'].map(field => (
                  <label key={field} className="block">
                    <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize block mb-1">
                      {field.replace('_', ' ')}
                    </span>
                    <input
                      name={field}
                      value={form[field]}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                    />
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={saveReceipt} className="px-4 py-2  text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center justify-between gap-2">
                  <FaDownload /> Save Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}