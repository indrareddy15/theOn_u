import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './pages/Layout.jsx'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import AdminDashboard from './adminpages/AdminDashboard'
import AdminProducts from './adminpages/AdminProducts'
import AdminProductForm from './adminpages/AdminProductForm'
import AdminOrders from './adminpages/AdminOrders'
import AdminInventory from './adminpages/AdminInventory'
import AdminCustomers from './adminpages/AdminCustomers'
import AdminSupport from './adminpages/AdminSupport'
import AdminContentManagement from './adminpages/AdminContentManagement'
import AdminMarketing from './adminpages/AdminMarketing'
import AdminSettings from './adminpages/AdminSettings'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
        <Route path="/shop" element={<Layout currentPageName="Shop"><Shop /></Layout>} />
        <Route path="/product/:id" element={<Layout currentPageName="ProductDetail"><ProductDetail /></Layout>} />
        <Route path="/shop/product/:id" element={<Layout currentPageName="ProductDetail"><ProductDetail /></Layout>} />
        <Route path="/cart" element={<Layout currentPageName="Cart"><Cart /></Layout>} />
        <Route path="/checkout" element={<Layout currentPageName="Checkout"><Checkout /></Layout>} />
        <Route path="/order-confirmation/:id" element={<Layout currentPageName="OrderConfirmation"><OrderConfirmation /></Layout>} />
        <Route path="/orders" element={<Layout currentPageName="Orders"><Orders /></Layout>} />
        <Route path="/profile" element={<Layout currentPageName="Profile"><Profile /></Layout>} />
        <Route path="/wishlist" element={<Layout currentPageName="Wishlist"><Wishlist /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<Layout currentPageName="AdminDashboard"><AdminDashboard /></Layout>} />
        <Route path="/admin/products" element={<Layout currentPageName="AdminProducts"><AdminProducts /></Layout>} />
        <Route path="/admin/products/form" element={<Layout currentPageName="AdminProductForm"><AdminProductForm /></Layout>} />
        <Route path="/admin/products/form/:id" element={<Layout currentPageName="AdminProductForm"><AdminProductForm /></Layout>} />
        <Route path="/admin/orders" element={<Layout currentPageName="AdminOrders"><AdminOrders /></Layout>} />
        <Route path="/admin/inventory" element={<Layout currentPageName="AdminInventory"><AdminInventory /></Layout>} />
        <Route path="/admin/customers" element={<Layout currentPageName="AdminCustomers"><AdminCustomers /></Layout>} />
        <Route path="/admin/support" element={<Layout currentPageName="AdminSupport"><AdminSupport /></Layout>} />
        <Route path="/admin/content" element={<Layout currentPageName="AdminContentManagement"><AdminContentManagement /></Layout>} />
        <Route path="/admin/marketing" element={<Layout currentPageName="AdminMarketing"><AdminMarketing /></Layout>} />
        <Route path="/admin/settings" element={<Layout currentPageName="AdminSettings"><AdminSettings /></Layout>} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App
