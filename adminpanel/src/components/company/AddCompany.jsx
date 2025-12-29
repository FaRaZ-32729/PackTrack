import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const URL = import.meta.env.VITE_Node_Api_Url;

const AddCompany = () => {
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const handleAddCompany = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Company name is required");
            return;
        }

        try {
            const res = await axios.post(`${URL}/company/register`, { name });

            if (res.status === 200 || res.status === 201) {
                toast.success(res.data.message || "Company added successfully", {
                    onClose: () => navigate("/companies"),
                });
                // toast.success(res.data.message || "Company added successfully!");
                setName("");
                // navigate("/companies");
                // setTimeout(() => navigate("/companies"), 1500);
            }
            else {
                toast.error(response.data.message)
            }
        } catch (err) {
            console.error("Error adding company:", err);
            toast.error(err.response?.data?.message || "Failed to add company");
        }
    };

    return (
        <div className="container px-6 mx-auto grid">
            <ToastContainer position="top-right" autoClose={1500} />
            <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Add Company
            </h2>

            <form
                onSubmit={handleAddCompany}
                className="px-6 py-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800"
            >
                <label className="block text-sm">
                    <span className="text-gray-700 dark:text-gray-400">Company Name</span>
                    <input
                        type="text"
                        placeholder="Enter company name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full mt-2 p-3 text-sm border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 focus:border-purple-500 focus:outline-none focus:shadow-outline-purple dark:text-gray-300"
                    />
                </label>

                <div className="mt-6">
                    <button
                        type="submit"
                        className="px-5 py-2 text-sm font-medium text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
                    >
                        Add Company
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCompany;
