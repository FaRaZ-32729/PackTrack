import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { useCompany } from "../contextApi/CompanyContext";
import { useCategory } from "../contextApi/CategoryContext";

const AdminDashboard = () => {
  const { companies, loading: companyLoading, fetchCompanies } = useCompany();
  const { categories, loading: categoryLoading, fetchCategories } = useCategory();

  const [form, setForm] = useState({
    company: "",
    category: "",
    bottles: "",
    truckNumber: "",
  });

  const [qrData, setQrData] = useState(null);
  const [numQRCodes, setNumQRCodes] = useState(""); // total QR codes
  const printRef = useRef();

  useEffect(() => {
    fetchCompanies();
    fetchCategories();
  }, []);

  const handleGenerateQR = () => {
    const { company, category, bottles, truckNumber } = form;
    if (!company || !category || !bottles || !truckNumber) {
      toast.error("Please fill in all fields");
      return;
    }

    const qrPayload = { company, category, bottles, truckNumber };
    setQrData(qrPayload);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "QR Codes",
    onAfterPrint: () => toast.success("Printing completed"),
  });

  const handlePrintClick = () => {
    if (!qrData) {
      toast.error("Please generate QR code first");
      return;
    }
    if (!numQRCodes || numQRCodes <= 0) {
      toast.error("Enter a valid number of QR codes");
      return;
    }
    if (!printRef.current) {
      toast.error("Print section not ready. Try again.");
      return;
    }

    handlePrint();
  };

  return (
    <div className="container px-6 mx-auto">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
        QR Code Generator
      </h2>

      {/* ====== QR Generator Section ====== */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Dropdown */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Company
            </label>
            <select
              className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            >
              <option value="">Select Company</option>
              {companyLoading ? (
                <option>Loading...</option>
              ) : (
                companies.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Category
            </label>
            <select
              className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categoryLoading ? (
                <option>Loading...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Bottles */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Quantity
            </label>
            <input
              type="number"
              placeholder="Enter Quantity"
              className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
              value={form.bottles}
              onChange={(e) => setForm({ ...form, bottles: e.target.value })}
            />
          </div>

          {/* Truck Number */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Truck Number
            </label>
            <input
              type="text"
              placeholder="Enter truck number"
              className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
              value={form.truckNumber}
              onChange={(e) => setForm({ ...form, truckNumber: e.target.value })}
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleGenerateQR}
            className="px-6 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            Generate QR
          </button>
        </div>

        {/* Display Generated QR */}
        {qrData && (
          <div className="mt-8 flex flex-col items-center space-y-4">
            <QRCodeCanvas value={JSON.stringify(qrData)} size={150} />
            <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
              {JSON.stringify(qrData)}
            </p>

            {/* Number of QR Codes Input */}
            <div className="flex items-center gap-3 mt-4">
              <input
                type="number"
                placeholder="Number of QR Codes"
                className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
                value={numQRCodes}
                onChange={(e) => setNumQRCodes(e.target.value)}
              />
              <button
                onClick={handlePrintClick}
                className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Print
              </button>
            </div>
          </div>
        )}
      </div>


      {/* ====== Hidden Print Section ====== */}
      {/* <div style={{ display: "none" }}>
        <div ref={printRef}>
          {qrData &&
            Array.from({ length: numQRCodes }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between w-full h-[33vh] border-b border-gray-300 p-6"
                style={{
                  pageBreakAfter: (idx + 1) % 3 === 0 ? "always" : "auto",
                }}
              >
                <div className="flex flex-col justify-center w-1/2">
                  <p style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>
                    Company: <span style={{ fontWeight: "bold" }}>{form.company}</span>
                  </p>
                  <p style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
                    Category: <span style={{ fontWeight: "bold" }}>{form.category}</span>
                  </p>
                  <p style={{ fontSize: 20, fontWeight: "bold" }}>
                    Quantity: <span style={{ fontWeight: "bold" }}>{numQRCodes}</span>
                  </p>
                </div>

                <div className="flex justify-center items-center w-1/2">
                  <QRCodeCanvas value={JSON.stringify(qrData)} size={200} />
                </div>
              </div>
            ))}
        </div>
      </div> */}

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          {qrData &&
            Array.from({ length: numQRCodes }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between w-full h-[33vh] border-b border-gray-300 p-6"
                style={{
                  pageBreakAfter: (idx + 1) % 3 === 0 ? "always" : "auto",
                }}
              >
                {/* ===== Left Side: Logo + Text Info ===== */}
                <div className="flex flex-col justify-center w-1/2 space-y-4">
                  {/* Company Logo */}
                  <div className="flex justify-start mb-4">
                    <img
                      src="/assets/logo.png" 
                      alt="Company Logo"
                      style={{
                        width: "150px",
                        height: "auto",
                        objectFit: "contain",
                        marginBottom: "10px",
                      }}
                    />
                  </div>

                  {/* Company, Category, Quantity */}
                  <p style={{ fontSize: 22, fontWeight: "bold", marginBottom: 6 }}>
                    Company: <span style={{ fontWeight: "normal" }}>{form.company}</span>
                  </p>
                  <p style={{ fontSize: 20, fontWeight: "bold", marginBottom: 6 }}>
                    Category: <span style={{ fontWeight: "normal" }}>{form.category}</span>
                  </p>
                  <p style={{ fontSize: 20, fontWeight: "bold" }}>
                    Quantity: <span style={{ fontWeight: "normal" }}>{numQRCodes}</span>
                  </p>
                </div>

                {/* ===== Right Side: Enlarged QR Code ===== */}
                <div className="flex justify-center items-center w-1/2">
                  <QRCodeCanvas value={JSON.stringify(qrData)} size={300} /> {/* enlarged from 200 → 260 */}
                </div>
              </div>
            ))}
        </div>
      </div>


    </div>
  );
};

export default AdminDashboard;
