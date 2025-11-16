import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  LayoutDashboard,
  Package,
  Users,
  Tag,
  LogOut,
  Settings,
  ShoppingBag,
  Percent,
  Megaphone,
  Box,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SupportChat from "@/components/store/SupportChat";
import MegaMenu from "@/components/store/MegaMenu";
import LoginModal from "@/components/auth/LoginModal";
import DebugUserPanel from "@/components/DebugUserPanel";
import { useAuth } from "@/hooks/useAuth";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showLoginModal, openLoginModal, closeLoginModal } = useAuth();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [disclaimers, setDisclaimers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const isAdminPage =
    location.pathname.includes("/admin") ||
    currentPageName?.startsWith("Admin");

  const loadCartCount = useCallback(async () => {
    try {
      const items = await base44.entities.CartItem.filter({
        user_email: user.email,
      });
      setCartCount(items.length);
    } catch (error) {
      console.error("Error loading cart count:", error);
    }
  }, [user?.email]);

  const loadWishlistCount = useCallback(async () => {
    try {
      const items = await base44.entities.Wishlist.filter({
        user_email: user.email,
      });
      setWishlistCount(items.length);
    } catch (error) {
      console.error("Error loading wishlist count:", error);
    }
  }, [user?.email]);

  useEffect(() => {
    loadUser();
    if (!isAdminPage) {
      loadCategories();
      loadDisclaimers();
    }
  }, [isAdminPage]);

  useEffect(() => {
    if (user?.email && !isAdminPage) {
      loadCartCount();
      loadWishlistCount();
    }
  }, [user, isAdminPage, loadCartCount, loadWishlistCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleOpenLoginModal = (event) => {
      openLoginModal(event.detail?.returnUrl || location.pathname);
    };

    const handleUserLogin = () => {
      loadUser(); // Reload user data after login
    };

    const handleWishlistUpdated = () => {
      if (user?.email && !isAdminPage) {
        loadWishlistCount();
      }
    };

    const handleCartUpdated = () => {
      if (user?.email && !isAdminPage) {
        loadCartCount();
      }
    };

    const handleKeyDown = (event) => {
      // Press 'Escape' to close search bar
      if (event.key === "Escape" && showSearchBar) {
        setShowSearchBar(false);
        setSearchQuery("");
      }
      // Press 'Ctrl+K' or 'Cmd+K' to open search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        if (!showSearchBar) {
          setShowSearchBar(true);
          setTimeout(() => {
            const searchInput = document.querySelector("#header-search-input");
            if (searchInput) searchInput.focus();
          }, 100);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("openLoginModal", handleOpenLoginModal);
    window.addEventListener("userLoggedIn", handleUserLogin);
    window.addEventListener("wishlistUpdated", handleWishlistUpdated);
    window.addEventListener("cartUpdated", handleCartUpdated);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("openLoginModal", handleOpenLoginModal);
      window.removeEventListener("userLoggedIn", handleUserLogin);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
      window.removeEventListener("cartUpdated", handleCartUpdated);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    location.pathname,
    openLoginModal,
    user?.email,
    isAdminPage,
    loadWishlistCount,
    loadCartCount,
    showSearchBar,
  ]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await base44.entities.Category.filter(
        { is_active: true },
        "display_order"
      );
      setCategories(cats);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadDisclaimers = async () => {
    try {
      const discs = await base44.entities.Disclaimer.filter(
        { is_active: true, position: "footer" },
        "display_order"
      );
      setDisclaimers(discs);
    } catch (error) {
      console.error("Error loading disclaimers:", error);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    setUser(null); // Clear user state immediately
    navigate(createPageUrl("Home"));
  };

  const switchToAdmin = async () => {
    const adminUser = base44.auth.loginAs("admin");
    setUser(adminUser);
    console.log("Switched to admin user:", adminUser);
  };

  const switchToCustomer = async () => {
    const customerUser = base44.auth.loginAs("customer");
    setUser(customerUser);
    console.log("Switched to customer user:", customerUser);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        createPageUrl(`Shop?q=${encodeURIComponent(searchQuery.trim())}`)
      );
      setSearchQuery("");
      setShowSearchBar(false);
      setMobileMenuOpen(false); // Close mobile menu if open
    } else {
      navigate(createPageUrl("Shop"));
      setShowSearchBar(false);
      setMobileMenuOpen(false); // Close mobile menu if open
    }
  };

  const toggleSearch = () => {
    setShowSearchBar(!showSearchBar);
    if (!showSearchBar) {
      // Focus the input after it becomes visible
      setTimeout(() => {
        const searchInput = document.querySelector("#header-search-input");
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                to={createPageUrl("AdminDashboard")}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">ON U</div>
                  <div className="text-xs text-gray-500">Admin Panel</div>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to={createPageUrl("AdminDashboard")}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPageName === "AdminDashboard"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to={createPageUrl("AdminProducts")}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPageName === "AdminProducts" ||
                    currentPageName === "AdminProductForm"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Products
                </Link>
                <Link
                  to={createPageUrl("AdminOrders")}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPageName === "AdminOrders"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Orders
                </Link>
                <Link
                  to={createPageUrl("AdminInventory")}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPageName === "AdminInventory"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Box className="w-4 h-4" />
                  Inventory
                </Link>
                <Link
                  to={createPageUrl("AdminCustomers")}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPageName === "AdminCustomers"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Customers
                </Link>
                <Link
                  to={createPageUrl("AdminSupport")}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPageName === "AdminSupport"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Support
                </Link>
                <Link
                  to={createPageUrl("AdminContentManagement")}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPageName === "AdminContentManagement"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                  Content
                </Link>
                <Link
                  to={createPageUrl("AdminSettings")}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    currentPageName === "AdminSettings"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </nav>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(createPageUrl("Home"))}
                >
                  View Store
                </Button>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                >
                  {adminMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      {user?.email} ({user?.role})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={switchToCustomer}>
                      <User className="w-4 h-4 mr-2" />
                      Switch to Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={switchToAdmin}>
                      <User className="w-4 h-4 mr-2" />
                      Switch to Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Admin Navigation */}
            {adminMenuOpen && (
              <div className="md:hidden border-t border-gray-200 bg-white py-2 animate-fadeInDown">
                <Link
                  to={createPageUrl("AdminDashboard")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentPageName === "AdminDashboard"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setAdminMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to={createPageUrl("AdminProducts")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentPageName === "AdminProducts" ||
                    currentPageName === "AdminProductForm"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setAdminMenuOpen(false)}
                >
                  <Package className="w-4 h-4" />
                  Products
                </Link>
                <Link
                  to={createPageUrl("AdminOrders")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentPageName === "AdminOrders"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setAdminMenuOpen(false)}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Orders
                </Link>
                <Link
                  to={createPageUrl("AdminInventory")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentPageName === "AdminInventory"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setAdminMenuOpen(false)}
                >
                  <Box className="w-4 h-4" />
                  Inventory
                </Link>
                <Link
                  to={createPageUrl("AdminCustomers")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentPageName === "AdminCustomers"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setAdminMenuOpen(false)}
                >
                  <Users className="w-4 h-4" />
                  Customers
                </Link>
                <Link
                  to={createPageUrl("AdminSupport")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentPageName === "AdminSupport"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setAdminMenuOpen(false)}
                >
                  <MessageSquare className="w-4 h-4" />
                  Support
                </Link>
                <Link
                  to={createPageUrl("AdminContentManagement")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentPageName === "AdminContentManagement"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setAdminMenuOpen(false)}
                >
                  <Megaphone className="w-4 h-4" />
                  Content
                </Link>
                <Link
                  to={createPageUrl("AdminSettings")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentPageName === "AdminSettings"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setAdminMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            )}
          </div>
        </header>
        <main>
          <DebugUserPanel />
          {children}
        </main>
      </div>
    );
  }

  const getDisclaimerIcon = (iconName) => {
    const icons = {
      Shield: "🛡️",
      Truck: "🚚",
      RefreshCw: "🔄",
      Package: "📦",
      CheckCircle: "✓",
      Heart: "❤️",
    };
    return icons[iconName] || "✓";
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.3s ease-out;
        }
      `}</style>

      {/* Header Banner Disclaimers */}
      {disclaimers.filter((d) => d.position === "header" && d.is_active)
        .length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex flex-wrap gap-4 gap-y-1">
              {disclaimers
                .filter((d) => d.position === "header" && d.is_active)
                .sort((a, b) => a.display_order - b.display_order)
                .map((disclaimer) => (
                  <div key={disclaimer.id} className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-white">
                      {getDisclaimerIcon(disclaimer.icon)}
                    </span>
                    <div className="text-xs sm:text-sm text-white">
                      <span className="font-semibold">
                        {disclaimer.title}:{" "}
                      </span>
                      <span>{disclaimer.content}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          disclaimers.filter((d) => d.position === "header" && d.is_active)
            .length > 0
            ? "mt-12 sm:mt-14"
            : "mt-0"
        } ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
        }`}
      >
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                to={createPageUrl("Home")}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">U</span>
                </div>
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  ON U
                </span>
              </Link>

              <div className="hidden lg:flex items-center gap-8">
                <Link
                  to={createPageUrl("Home")}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Home
                </Link>
                <MegaMenu
                  categories={categories}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                {showSearchBar ? (
                  <form
                    onSubmit={handleSearch}
                    className="hidden md:flex items-center gap-2"
                  >
                    <div className="relative">
                      <Input
                        id="header-search-input"
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-60 pr-10"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSearchBar(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex"
                    onClick={toggleSearch}
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                )}
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      onClick={() => navigate(createPageUrl("Wishlist"))}
                    >
                      <Heart className="w-5 h-5" />
                      {wishlistCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                        >
                          {wishlistCount}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      onClick={() => navigate(createPageUrl("Cart"))}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                        >
                          {cartCount}
                        </Badge>
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <User className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => navigate(createPageUrl("Profile"))}
                        >
                          <User className="w-4 h-4 mr-2" />
                          My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(createPageUrl("Orders"))}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          My Orders
                        </DropdownMenuItem>
                        {user.role === "admin" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(createPageUrl("AdminDashboard"))
                              }
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Admin Panel
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={switchToCustomer}>
                          <User className="w-4 h-4 mr-2" />
                          Switch to Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={switchToAdmin}>
                          <User className="w-4 h-4 mr-2" />
                          Switch to Admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => openLoginModal()}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-medium"
                  >
                    Sign In
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-fadeInDown">
            <div className="max-w-7xl mx-auto px-4 py-4">
              {/* Mobile Search */}
              <div className="mb-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
              </div>

              {/* Home Link */}
              <Link
                to={createPageUrl("Home")}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>

              {/* MegaMenu Mobile Navigation */}
              <div
                onClick={(e) => {
                  // Only close menu if clicking directly on this div, not on child elements
                  if (e.target === e.currentTarget) {
                    setMobileMenuOpen(false);
                  }
                }}
              >
                <MegaMenu
                  categories={categories}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      <main
        className={`${
          disclaimers.filter((d) => d.position === "header" && d.is_active)
            .length > 0
            ? "pt-32 sm:pt-36"
            : "pt-16"
        }`}
      >
        {children}
      </main>

      <footer className="bg-gray-50 border-t mt-20">
        {/* Disclaimers Section */}
        {disclaimers.filter((d) => d.position === "footer" && d.is_active)
          .length > 0 && (
          <div className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {disclaimers
                  .filter((d) => d.position === "footer" && d.is_active)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((disclaimer) => (
                    <div key={disclaimer.id} className="flex items-start gap-3">
                      <span className="text-2xl">
                        {getDisclaimerIcon(disclaimer.icon)}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {disclaimer.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {disclaimer.content}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link
                to={createPageUrl("Home")}
                className="flex items-center gap-3 mb-4"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">TheOn</span>
              </Link>
              <p className="text-gray-600 text-sm mb-4 max-w-md">
                Your destination for premium fashion and style. Discover the
                latest trends in clothing and accessories.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link
                    to={createPageUrl("Shop")}
                    className="hover:text-gray-900"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    to={createPageUrl("Orders")}
                    className="hover:text-gray-900"
                  >
                    Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to={createPageUrl("Profile")}
                    className="hover:text-gray-900"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 TheOn. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Support Chat Widget */}
      <SupportChat />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        returnUrl={location.pathname}
      />
    </div>
  );
}
