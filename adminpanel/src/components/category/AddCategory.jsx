import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
const URL = import.meta.env.VITE_Node_Api_Url;

const AddCategory = () => {
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();
    const URL = import.meta.env.VITE_Node_Api_Url;


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            setPreview(window.URL.createObjectURL(file));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim() || !image) {
            toast.error("Please provide both name and image");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("image", image);

        try {
            const res = await axios.post(`${URL}/category/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success(res.data.message || "Category added successfully", {
                onClose: () => navigate("/categories"),
            });

            // toast.success(res.data.message || "Category added successfully");
            // setTimeout(() => navigate("/categories"), 1500);

            // Reset form
            setName("");
            setImage(null);
            setPreview(null);

            // Redirect after short delay

        } catch (error) {
            console.error("Error adding category:", error);
            toast.error(error.response?.data?.message || "Failed to add category");
        }
    };

    return (
        <div className="container px-6 mx-auto grid">
            <ToastContainer position="top-right" autoClose={1500} />

            <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Add Category
            </h2>

            <form
                onSubmit={handleSubmit}
                className="px-6 py-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800"
            >
                {/* Category Name */}
                <label className="block text-sm mb-4">
                    <span className="text-gray-700 dark:text-gray-400">Category Name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter category name"
                        className="block w-full mt-2 p-3 text-sm border border-gray-300 rounded-md 
            dark:border-gray-600 dark:bg-gray-700 focus:border-purple-500 
            focus:outline-none focus:shadow-outline-purple dark:text-gray-300"
                    />
                </label>

                {/* Category Image */}
                <label className="block text-sm mb-4">
                    <span className="text-gray-700 dark:text-gray-400">Category Image</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full mt-2 p-3 text-sm border border-gray-300 rounded-md 
            dark:border-gray-600 dark:bg-gray-700 focus:border-purple-500 
            focus:outline-none focus:shadow-outline-purple dark:text-gray-300"
                    />
                </label>

                {/* Image Preview */}
                {preview && (
                    <div className="mt-4">
                        <p className="text-gray-600 dark:text-gray-300 mb-2">Preview:</p>
                        <img
                            src={preview}
                            alt="Category Preview"
                            className="w-40 h-40 object-cover rounded-md border"
                        />
                    </div>
                )}

                {/* Submit Button */}
                <div className="mt-6">
                    <button
                        type="submit"
                        className="px-5 py-2 text-sm font-medium text-white transition-colors 
            duration-150 bg-purple-600 border border-transparent rounded-lg 
            hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
                    >
                        Add Category
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCategory;
