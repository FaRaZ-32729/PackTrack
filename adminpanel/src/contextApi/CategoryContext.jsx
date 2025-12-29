import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const URL = import.meta.env.VITE_Node_Api_Url;

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${URL}/category/all`);

            setCategories(res.data.Categories || []);
            // console.log(res.data.Categories);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError(err.response?.data?.message || "Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <CategoryContext.Provider value={{ categories, loading, error, fetchCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategory = () => useContext(CategoryContext);
