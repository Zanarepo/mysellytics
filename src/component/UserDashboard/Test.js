import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "../../supabaseClient";
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaDownload, FaQrcode } from 'react-icons/fa';

export default function ReceiptQRCode() {
  const storeId = localStorage.getItem("store_id");
  const [store, setStore] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [saleGroup, setSaleGroup] = useState(null);
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
      .select("shop_name,business_address,phone_number")
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

  // Fetch all receipts for the store
  useEffect(() => {
    if (!storeId) return;
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
  }, [storeId]);

  // Fetch sale group details when a receipt is selected
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

  const qrCodeUrl = selectedReceipt ? `${window.location.origin}/receipt/${selectedReceipt.receipt_id}` : '';

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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Store Receipts</h2>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Receipt ID</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Customer</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Phone</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Warranty</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt, index) => (
                <tr
                  key={receipt.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 even:bg-gray-50 dark:even:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 truncate">{receipt.receipt_id}</td>
                  <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 truncate">{receipt.customer_name || '-'}</td>
                  <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 truncate">{receipt.phone_number || '-'}</td>
                  <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 truncate">{receipt.warranty || '-'}</td>
                  <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleViewQRCode(receipt)}
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-2"
                    >
                      <FaQrcode /> View QR Code
                    </button>
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 dark:text-gray-400 py-6">
                    No receipts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-auto mt-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Receipt QR Code</h2>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <p className="text-gray-600 dark:text-gray-400">
                Scan the QR code below to view and download the receipt.
              </p>
              <QRCodeCanvas value={qrCodeUrl} size={200} />
              <button
                onClick={generatePDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaDownload /> Download Receipt
              </button>
            </div>
            <div ref={printRef} className="printable-area relative bg-white p-6 mt-6 shadow-lg rounded-lg overflow-x-auto">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ color: watermarkColor, fontSize: '4rem', opacity: 0.1 }}>
                <span className={`${bodyFont}`}>{store?.shop_name || '-'}</span>
              </div>
              <div className={`p-4 rounded-t ${headerFont}`} style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
                <h1 className="text-2xl font-bold">{store?.shop_name || '-'}</h1>
                <p className="text-sm">{store?.business_address || '-'}</p>
                <p className="text-sm">Phone: {store?.phone_number || '-'}</p>
              </div>
              <table className={`w-full rounded-t border-none mb-4 mt-4 ${bodyFont}`}>
                <thead>
                  <tr>
                    <th className="border px-4 py-2 text-left w-1/4">Product</th>
                    <th className="border px-4 py-2 text-left w-1/4">Device ID</th>
                    <th className="border px-4 py-2 text-left w-1/6">Quantity</th>
                    <th className="border px-4 py-2 text-left w-1/6">Unit Price</th>
                    <th className="border px-4 py-2 text-left w-1/6">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {productGroups.map((group, index) => (
                    <React.Fragment key={group.productId}>
                      <tr className="bg-blue-50 dark:bg-gray-800">
                        <td className="border-b px-4 py-2 font-bold" colSpan="2">{group.productName}</td>
                        <td className="border-b px-2 py-2">{group.quantity}</td>
                        <td className="border-b px-4 py-2">₦{group.unitPrice.toFixed(2)}</td>
                        <td className="border-b px-4 py-2">₦{group.totalAmount.toFixed(2)}</td>
                      </tr>
                      {group.deviceIds.map((deviceId, idx) => (
                        <tr key={`${group.productId}-${idx}`}>
                          <td className="border-b px-4 py-2"></td>
                          <td className="border-b px-4 py-2 pl-6">{deviceId}</td>
                          <td className="border-b px-4 py-2"></td>
                          <td className="border-b px-4 py-2"></td>
                          <td className="border-b px-4 py-2"></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" className="border px-4 py-2 text-right font-bold">Total:</td>
                    <td className="border px-4 py-2">{totalQuantity}</td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2 font-bold">₦{totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="mt-4 space-y-2">
                <p><strong>Receipt ID:</strong> {selectedReceipt.receipt_id}</p>
                <p><strong>Date:</strong> {new Date(saleGroup?.created_at).toLocaleString()}</p>
                <p><strong>Payment Method:</strong> {saleGroup?.payment_method}</p>
                <p><strong>Customer Name:</strong> {selectedReceipt.customer_name || '-'}</p>
                <p><strong>Address:</strong> {selectedReceipt.customer_address || '-'}</p>
                <p><strong>Phone:</strong> {selectedReceipt.phone_number || '-'}</p>
                <p><strong>Warranty:</strong> {selectedReceipt.warranty || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-8 p-4 mt-4">
                <div className="border-t text-center pt-2">Manager Signature</div>
                <div className="border-t text-center pt-2">Customer Signature</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}