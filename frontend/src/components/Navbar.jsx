import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { name: "Home", path: "/", roles: ["Admin", "Doctor", "Receptionist"] },
  { name: "Employee Management", path: "/employees", roles: ["Admin"] },
  { name: "Appointments", path: "/appointments", roles: ["Receptionist"] },
  { name: "Room Management", path: "/rooms", roles: ["Receptionist"] },
  { name: "Patient Management", path: "/patients", roles: ["Receptionist"] },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ Hide navbar if not logged in
  if (!user) return null;

  const userRole = user.role;
  const currentPath = location.pathname;

  // ✅ Filter links (role-based + hide current page)
  const filteredLinks = navLinks.filter(
    (link) =>
      link.roles.includes(userRole) &&
      !(
        (link.path === "/" &&
          (currentPath === "/" ||
            currentPath === "/home" ||
            currentPath === "/admin" ||
            currentPath === "/receptionist")) ||
        currentPath === link.path
      )
  );

  return (
    <nav className="bg-[#1e3a8a] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16">

          {/* ✅ LEFT: Brand + Desktop Links */}
          <div className="flex items-center gap-8">

            {/* ✅ Brand */}
            <Link to="/" className="text-white text-xl font-bold tracking-wide">
              EasyCare HMS
            </Link>

            {/* ✅ Desktop Nav Links */}
            <div className="hidden md:flex gap-5">
              {filteredLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-white text-blue-900 shadow"
                        : "text-blue-100 hover:bg-blue-700 hover:text-white"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* ✅ RIGHT: Logout + Mobile Button */}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 transition text-white text-sm px-4 py-2 rounded-md font-semibold"
            >
              Sign Out
            </button>

            {/* ✅ Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white text-2xl focus:outline-none"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* ✅ MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1e3a8a] px-4 pb-5 animate-pulse">
          <div className="flex flex-col gap-2 pt-3">
            {filteredLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-white text-blue-900 shadow"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
