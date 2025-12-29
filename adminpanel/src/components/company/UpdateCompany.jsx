import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const URL = import.meta.env.VITE_Node_Api_Url;

const UpdateCompany = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState({ name: "" });
    const [loading, setLoading] = useState(false);

    // 🟣 Fetch existing company by ID
    useEffect(() => {
        const fetchCompany = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${URL}/company/one/${id}`);
                console.log(res);
                setCompany(res.data.company || res.data.data?.company || {});
                console.log(company);
            } catch (error) {
                console.error("Error fetching company:", error);
                toast.error(
                    error.response?.data?.message || "Failed to fetch company details"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [id]);

    // 🟢 Handle input change
    const handleOnChange = (e) => {
        const { value } = e.target;
        setCompany({ ...company, name: value });
    };

    // 🟡 Update company API call
    const handleUpdate = async () => {
        if (!company.name.trim()) {
            toast.warn("Company name is required");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.put(`${URL}/company/update/${id}`, {
                name: company.name,
            });
            // toast.success(res.data.message || "Company updated successfully");
            // navigate("/companies");
            toast.success(res.data.message || "Company updated successfully", {
                onClose: () => navigate("/companies"),
            });
        } catch (error) {
            console.error("Error updating company:", error);
            toast.error(
                error.response?.data?.message || "Failed to update company"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container px-6 mx-auto grid">
            <ToastContainer position="top-right" autoClose={1500} />
            <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Update Company
            </h2>

            <div className="px-6 py-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : (
                    <>
                        <label className="block text-sm mb-4">
                            <span className="text-gray-700 dark:text-gray-400">
                                Company Name
                            </span>
                            <input
                                type="text"
                                name="name"
                                value={company.name}
                                onChange={handleOnChange}
                                placeholder="Enter company name"
                                className="block w-full mt-2 p-3 text-sm border border-gray-300 rounded-md 
                dark:border-gray-600 dark:bg-gray-700 focus:border-purple-500 
                focus:outline-none focus:shadow-outline-purple dark:text-gray-300"
                            />
                        </label>

                        <div className="mt-6">
                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className={`px-5 py-2 text-sm font-medium text-white transition-colors 
                duration-150 bg-purple-600 border border-transparent rounded-lg 
                hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple 
                ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Updating..." : "Update Company"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UpdateCompany;
