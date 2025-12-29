import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useCategory } from "../../contextApi/CategoryContext";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const URL = import.meta.env.VITE_Node_Api_Url;

const AllCategories = () => {
    const { categories, loading, error, fetchCategories } = useCategory();
    const didFetch = useRef(false);

    // 🔁 Fetch all categories once
    useEffect(() => {
        if (!didFetch.current) {
            didFetch.current = true;
            fetchCategories();
        }
    }, []);

    // 🗑️ Delete handler
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this category?");
        if (!confirmDelete) return;

        try {
            const res = await axios.delete(`${URL}/category/delete/${id}`);
            toast.success(res.data.message || "Category deleted successfully");

            // Refresh list
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error(error.response?.data?.message || "Failed to delete category ❌");
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={1500} />
            <div className="container grid px-6 mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                        All Categories
                    </h2>

                    <NavLink to="/add-category">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700">
                            + Add Category
                        </button>
                    </NavLink>
                </div>

                {/* Table */}
                <div className="w-full overflow-hidden rounded-lg shadow-xs">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full whitespace-no-wrap">
                            <thead>
                                <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Category Name</th>
                                    <th className="px-4 py-3">Image</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Loading categories...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-4 py-6 text-center text-red-500 dark:text-red-400"
                                        >
                                            {error}
                                        </td>
                                    </tr>
                                ) : categories.length > 0 ? (
                                    categories.map((category, index) => (
                                        <tr
                                            key={category._id}
                                            className="text-gray-700 dark:text-gray-400"
                                        >
                                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm font-medium">
                                                {category.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <img
                                                    src={`${URL}${category.image}`}
                                                    alt={category.name}
                                                    className="w-12 h-12 object-cover rounded-md border"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-3 text-sm">
                                                    <NavLink
                                                        to={`/update-category/${category._id}`}
                                                        className="text-purple-600 hover:text-purple-800"
                                                    >
                                                        <FaEdit size={18} />
                                                    </NavLink>
                                                    <button
                                                        className="text-red-600 hover:text-red-800"
                                                        onClick={() => handleDelete(category._id)}
                                                    >
                                                        <FaTrash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No categories found
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

export default AllCategories;
