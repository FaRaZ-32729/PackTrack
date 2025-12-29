import React from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PageNotFound from "./pages/PageNotFound";
import AllCompanies from "./components/company/AllCompanies";
import UpdateCompany from "./components/company/UpdateCompany";
import AddCompany from "./components/company/AddCompany";
import AllCategories from "./components/category/AllCategory";
import AddCategory from "./components/category/AddCategory";
import UpdateCategory from "./components/category/UpdateCategory";
import AdminDashboard from "./pages/AdminDashboard";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <>

      <Routes>
        {/* Main layout routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          <Route path="companies" element={<AllCompanies />} />
          <Route path="add-company" element={<AddCompany />} />
          <Route path="update-company/:id" element={<UpdateCompany />} />
          <Route path="categories" element={<AllCategories />} />
          <Route path="add-category" element={<AddCategory />} />
          <Route path="update-category/:id" element={<UpdateCategory />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 404 fallback */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

export default App;
