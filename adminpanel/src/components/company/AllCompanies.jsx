import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useCompany } from "../../contextApi/CompanyContext";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
const URL = import.meta.env.VITE_Node_Api_Url;

const AllCompanies = () => {
  const { companies, loading, fetchCompanies } = useCompany();
  const didFetch = useRef(false);

  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true;
      fetchCompanies();
    }
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this company?"
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`${URL}/company/delete/${id}`);
      toast.success(res.data.message || "Company deleted successfully ✅");

      // 🔄 Refresh the company list
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error(error.response?.data?.message || "Failed to delete company ❌");
    }
  };



  return (
    <>
      <div className="container grid px-6 mx-auto">
        <ToastContainer position="top-right" autoClose={1500} />

        {/* Header section */}
        <div className="flex justify-between items-center">
          <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
            All Companies
          </h2>

          <NavLink to="/add-company">
            <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple">
              + Add Company
            </button>
          </NavLink>
        </div>

        {/* Table */}
        <div className="w-full overflow-hidden rounded-lg shadow-xs">
          <div className="w-full overflow-x-auto">
            <table className="w-full whitespace-no-wrap">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Company Name</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                    >
                      Loading companies...
                    </td>
                  </tr>
                ) : companies.length > 0 ? (
                  companies.map((company, index) => (
                    <tr
                      key={company._id}
                      className="text-gray-700 dark:text-gray-400"
                    >
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {company.name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3 text-sm">
                          <NavLink
                            to={`/update-company/${company._id}`}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <FaEdit size={18} />
                          </NavLink>

                          <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(company._id)}>
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                    >
                      No companies found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllCompanies;
