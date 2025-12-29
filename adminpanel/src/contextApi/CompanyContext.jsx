// src/context/CompanyContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CompanyContext = createContext();

const URL = import.meta.env.VITE_Node_Api_Url;

export const CompanyProvider = ({ children }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${URL}/company/all`);

            const fetchedCompanies = res.data.Compnies || [];

            setCompanies(fetchedCompanies);
            // toast.success(res.data.message || "Companies fetched successfully");
        } catch (error) {
            console.error("Error fetching companies:", error);
            toast.error(
                error.response?.data?.message || "Failed to fetch companies"
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch once when context mounts
    useEffect(() => {
        fetchCompanies();
    }, []);

    return (
        <CompanyContext.Provider value={{ companies, loading, fetchCompanies }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => useContext(CompanyContext);
