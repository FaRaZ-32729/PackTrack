import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const URL = import.meta.env.VITE_Node_Api_Url;

const UpdateCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState({
        name: "",
        image: "",
    });

    const [preview, setPreview] = useState(null);

    // Fetch category from MongoDB
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await axios.get(`${URL}/category/one/${id}`);
                // console.log(res)
                if (res.data && res.data.category) {
                    const cat = res.data.category;
                    setCategory({
                        name: cat.name || "",
                        image: cat.image || "",
                    });

                    // show existing image preview
                    setPreview(`${URL}${cat.image}`);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch category");
            }
        };

        fetchCategory();
    }, [id]);

    // Handle field changes
    const handleOnChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            const file = files[0];
            setCategory({ ...category, image: file });
            setPreview(window.URL.createObjectURL(file)); // show selected file preview
        } else {
            setCategory({ ...category, [name]: value });
        }
    };

    // Handle update
    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append("name", category.name);

            // only append new image if user selected one
            if (category.image instanceof File) {
                formData.append("image", category.image);
            }
            const res = await axios.put(`${URL}/category/update/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.status === 200) {
                // toast.success("Category updated successfully!");
                // navigate("/categories");
                toast.success(res.data.message || "Category updated successfully", {
                    onClose: () => navigate("/categories"),
                });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update category");
        }
    };

    return (
        <div className="container px-6 mx-auto grid">
            <ToastContainer position="top-right" autoClose={1500} />
            <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Update Category
            </h2>

            <div className="px-6 py-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
                {/* Name Field */}
                <label className="block text-sm mb-4">
                    <span className="text-gray-700 dark:text-gray-400">Category Name</span>
                    <input
                        type="text"
                        name="name"
                        value={category.name}
                        onChange={handleOnChange}
                        placeholder="Enter category name"
                        className="block w-full mt-2 p-3 text-sm border border-gray-300 rounded-md 
                            dark:border-gray-600 dark:bg-gray-700 focus:border-purple-500 
                            focus:outline-none focus:shadow-outline-purple dark:text-gray-300"
                    />
                </label>

                {/* Image Field */}
                <label className="block text-sm mb-4">
                    <span className="text-gray-700 dark:text-gray-400">Category Image</span>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleOnChange}
                        className="block w-full mt-2 p-3 text-sm border border-gray-300 rounded-md 
                            dark:border-gray-600 dark:bg-gray-700 focus:border-purple-500 
                            focus:outline-none focus:shadow-outline-purple dark:text-gray-300"
                    />
                </label>

                {/* Existing / New Image Preview */}
                {preview && (
                    <div className="mt-4">
                        <span className="text-gray-700 dark:text-gray-400 mb-2 block">
                            Current Image Preview:
                        </span>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-40 h-40 object-cover rounded-lg border"
                        />
                    </div>
                )}

                <div className="mt-6">
                    <button
                        onClick={handleUpdate}
                        className="px-5 py-2 text-sm font-medium text-white transition-colors 
                            duration-150 bg-purple-600 border border-transparent rounded-lg 
                            hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
                    >
                        Update Category
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateCategory;
