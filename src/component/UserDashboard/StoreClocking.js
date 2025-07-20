import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { format, parseISO } from 'date-fns';
import JsBarcode from 'jsbarcode';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';

const Attendance = () => {
  const [storeId, setStoreId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [, setUserEmail] = useState(null);
  const [isStoreOwner, setIsStoreOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [barcodeError, setBarcodeError] = useState(false);
  const webcamRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        toast.dismiss();
        const user_email = localStorage.getItem('user_email');
        console.log('User email from localStorage:', user_email);
        if (!user_email) throw new Error('Please log in.');

        setUserEmail(user_email);
        console.log('Querying stores for email:', user_email);
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('email_address', user_email)
          .maybeSingle();
        if (storeError) {
          console.error('Store query error:', storeError);
          throw new Error(`Error checking store owner: ${storeError.message}`);
        }

        if (storeData) {
          console.log('User is store owner for store_id:', storeData.id);
          setIsStoreOwner(true);
          setStoreId(storeData.id);
          console.log('Final storeId:', storeData.id);
          console.log('Querying store_users for email:', user_email);
          const { data: userData, error: userError } = await supabase
            .from('store_users')
            .select('id')
            .eq('email_address', user_email)
            .eq('store_id', storeData.id)
            .maybeSingle();
          if (userError) {
            console.error('User query error:', userError);
            throw new Error(`Error fetching user data: ${userError.message}`);
          }
          if (userData) {
            console.log('User data:', userData);
            setUserId(userData.id);
          } else {
            console.log('No store_users entry found for store owner; using default userId.');
            setUserId(0); // Default userId for store owners not in store_users
          }
        } else {
          console.log('User is not store owner, querying store_users for email:', user_email);
          const { data: userData, error: userError } = await supabase
            .from('store_users')
            .select('id, store_id')
            .eq('email_address', user_email)
            .maybeSingle();
          if (userError) {
            console.error('User query error:', userError);
            throw new Error(`Error fetching user data: ${userError.message}`);
          }
          if (!userData) {
            console.error('No user found for email:', user_email);
            throw new Error('User not found in store_users.');
          }
          console.log('User data:', userData);
          setUserId(userData.id);
          setStoreId(userData.store_id);
          console.log('Final storeId:', userData.store_id);
        }
      } catch (err) {
        console.error('fetchUserData error:', err);
        toast.error(err.message, { toastId: 'auth-error' });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Generate store barcode when modal opens
  useEffect(() => {
    if (showBarcodeModal && storeId) {
      const storeCode = `STORE-${storeId}`;
      const canvas = document.getElementById('store-barcode');
      console.log('Generating store barcode for:', storeCode, 'Canvas:', canvas);
      if (canvas) {
        try {
          JsBarcode(canvas, storeCode, {
            format: 'CODE128',
            displayValue: true,
            width: 3,
            height: 80,
            fontSize: 16,
            background: '#ffffff',
            lineColor: '#000000',
            margin: 10,
          });
          console.log('Store barcode generated successfully for:', storeCode);
          setBarcodeError(false);
        } catch (err) {
          console.error('JsBarcode error for store barcode:', err);
          toast.error('Failed to generate store barcode.', { toastId: 'barcode-error' });
          setBarcodeError(true);
        }
      } else {
        console.log('Store barcode canvas not found');
        setBarcodeError(true);
      }
    }
  }, [showBarcodeModal, storeId]);

  // Fetch attendance logs
  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      if (!storeId) return;
      try {
        console.log('Fetching attendance logs for store_id:', storeId);
        const { data, error } = await supabase
          .from('attendance')
          .select('id, user_id, action, timestamp, store_users!user_id(full_name)')
          .eq('store_id', storeId)
          .order('timestamp', { ascending: false });
        if (error) throw new Error(`Error fetching logs: ${error.message}`);
        setAttendanceLogs(data || []);
        console.log('Attendance logs:', data);
      } catch (err) {
        console.error('fetchAttendanceLogs error:', err);
        toast.error(err.message, { toastId: 'logs-error' });
      }
    };

    fetchAttendanceLogs();
  }, [storeId]);

  // Delete all attendance logs for store
  const handleDeleteAllLogs = async () => {
    try {
      console.log('Deleting all attendance logs for store_id:', storeId);
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('store_id', storeId);
      if (error) throw new Error(`Error deleting all logs: ${error.message}`);
      setAttendanceLogs([]);
      toast.success('All attendance logs deleted.', { toastId: 'delete-all-success' });
    } catch (err) {
      console.error('handleDeleteAllLogs error:', err);
      toast.error(err.message, { toastId: 'delete-all-error' });
    }
  };

  // Handle barcode scan
  const handleScan = useCallback(
    async (err, result) => {
      if (result) {
        try {
          const scannedCode = result.text;
          console.log('Scanned code:', scannedCode);
          const expectedCode = `STORE-${storeId}`;
          if (scannedCode !== expectedCode) {
            toast.error('Invalid store barcode.', { toastId: 'invalid-code' });
            return;
          }

          // Verify user
          let user = { id: userId, full_name: 'Store Owner' };
          if (userId !== 0) {
            const { data: userData, error: userError } = await supabase
              .from('store_users')
              .select('id, full_name')
              .eq('id', userId)
              .eq('store_id', storeId)
              .single();
            if (userError || !userData) {
              console.error('User lookup error:', userError);
              toast.error('User not authenticated.', { toastId: 'auth-error' });
              return;
            }
            user = userData;
            console.log('Authenticated user:', user);
          } else {
            console.log('Using default user for store owner: id=0, full_name=Store Owner');
          }

          // Check last action
          const { data: lastLog, error: logError } = await supabase
            .from('attendance')
            .select('action')
            .eq('user_id', user.id)
            .eq('store_id', storeId)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();
          if (logError && logError.code !== 'PGRST116') {
            throw new Error(`Error checking last log: ${logError.message}`);
          }

          const action = lastLog?.action === 'clock-in' ? 'clock-out' : 'clock-in';
          const { data, error: insertError } = await supabase
            .from('attendance')
            .insert([{ store_id: storeId, user_id: user.id, action, timestamp: new Date().toISOString() }])
            .select('id, user_id, action, timestamp, store_users!user_id(full_name)')
            .single();
          if (insertError) throw new Error(`Error logging attendance: ${insertError.message}`);

          setAttendanceLogs((prev) => [data, ...prev]);
          toast.success(`${user.full_name} ${action === 'clock-in' ? 'clocked in' : 'clocked out'} at ${format(new Date(), 'PPP HH:mm')}.`, {
            toastId: `attendance-${data.id}`,
          });
        } catch (err) {
          console.error('handleScan error:', err);
          toast.error(err.message, { toastId: 'scan-error' });
        }
      }
    },
    [storeId, userId]
  );

  // Handle barcode scanning
  useEffect(() => {
    let currentCodeReader = null;
    if (scanning) {
      currentCodeReader = codeReader.current;
      const scanCode = async () => {
        try {
          await currentCodeReader.decodeFromVideoDevice(null, webcamRef.current.video, (result, err) => {
            if (result) {
              setScanning(false);
              currentCodeReader.reset();
              handleScan(null, result);
            }
            if (err && err.name !== 'NotFoundException') {
              console.error('Scan error:', err);
              toast.error('Error scanning code.', { toastId: 'scan-error' });
            }
          });
        } catch (err) {
          console.error('Scan setup error:', err);
          toast.error('Failed to start scanner.', { toastId: 'scan-setup-error' });
        }
      };
      scanCode();
    }
    return () => {
      if (currentCodeReader) {
        currentCodeReader.reset();
      }
    };
  }, [scanning, handleScan]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = attendanceLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(attendanceLogs.length / itemsPerPage);

  return (
    <div className="w-full bg-white dark:bg-gray-900 p-4 mt-24">
      <h2 className="text-2xl font-bold text-indigo-800 dark:text-white mb-4">Attendance Tracking</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Toaster position="top-center" />
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {(isStoreOwner || userId) && (
            <div className="mb-4 flex gap-4">
              <button
                onClick={() => setScanning(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
                disabled={!storeId}
              >
                Scan Store Barcode
              </button>
              {isStoreOwner && (
                <button
                  onClick={() => setShowBarcodeModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                  disabled={!storeId}
                >
                  Show Store Barcode
                </button>
              )}
            </div>
          )}
          {isStoreOwner && (
            <button
              onClick={handleDeleteAllLogs}
              className="mb-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300"
              disabled={!storeId || attendanceLogs.length === 0}
            >
              Delete All Logs
            </button>
          )}
          {scanning && (
            <div className="mb-4">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'environment' }}
                className="mx-auto rounded-md border border-gray-300 dark:border-gray-600"
                width={300}
                height={300}
              />
              <button
                onClick={() => setScanning(false)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Stop Scanning
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-100 dark:bg-indigo-800">
                  <th className="p-2 text-indigo-800 dark:text-indigo-200 text-sm md:text-base">User</th>
                  <th className="p-2 text-indigo-800 dark:text-indigo-200 text-sm md:text-base">Action</th>
                  <th className="p-2 text-indigo-800 dark:text-indigo-200 text-sm md:text-base">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-2 text-center text-gray-500 dark:text-gray-400">
                      No attendance logs found.
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`border-b dark:border-gray-700 ${
                        log.action === 'clock-in' ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'
                      }`}
                    >
                      <td className="p-2 text-indigo-800 dark:text-indigo-200 text-sm md:text-base">{log.store_users?.full_name || 'Store Owner'}</td>
                      <td className="p-2 text-indigo-800 dark:text-indigo-200 text-sm md:text-base">{log.action}</td>
                      <td className="p-2 text-indigo-800 dark:text-indigo-200 text-sm md:text-base">
                        {format(parseISO(log.timestamp), 'PPP HH:mm')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600"
              >
                Previous
              </button>
              <span className="text-indigo-800 dark:text-indigo-200">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}
          <Dialog open={showBarcodeModal} onClose={() => setShowBarcodeModal(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6">
                <DialogTitle className="text-lg font-bold text-indigo-800 dark:text-indigo-200">
                  Store Barcode
                </DialogTitle>
                <button
                  onClick={() => setShowBarcodeModal(false)}
                  className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                >
                  ✕
                </button>
                <div className="mt-4 flex flex-col items-center space-y-4">
                  {storeId ? (
                    <>
                      <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                        Store Barcode (ID: STORE-{storeId})
                      </p>
                      {barcodeError ? (
                        <img
                          src={`https://barcode.tec-it.com/barcode.ashx?data=STORE-${storeId}&code=Code128`}
                          alt="Store Barcode"
                          className="mx-auto w-full max-w-[250px] h-[100px] border-2 border-gray-400"
                        />
                      ) : (
                        <canvas
                          id="store-barcode"
                          className="mx-auto w-full max-w-[250px] h-[100px] bg-white border-2 border-gray-400"
                        />
                      )}
                      <p className="text-xs text-gray-500">Scan this barcode to clock in/out.</p>
                    </>
                  ) : (
                    <p className="text-red-500 text-center">Store ID not found. Contact support.</p>
                  )}
                </div>
                <button
                  onClick={() => setShowBarcodeModal(false)}
                  className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Close
                </button>
              </DialogPanel>
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Attendance;