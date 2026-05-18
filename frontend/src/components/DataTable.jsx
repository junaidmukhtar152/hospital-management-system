import React, { useState } from "react";

const DataTable = ({ columns, data, actions, deleteAction }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which row's dropdown is open
  const rowsPerPage = 8;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Helper to determine button color based on action label
  const getButtonClasses = (label) => {
    switch (label) {
      case "Delete":
      case "Remove":
        return "text-red-600 hover:bg-red-50";
      case "Generate Invoice":
        return "text-yellow-600 hover:bg-yellow-50";
      case "Assign Room":
        return "text-green-600 hover:bg-green-50";
      case "View Profile":
      default:
        return "text-blue-600 hover:bg-blue-50";
    }
  };

  // Toggle dropdown for a specific row
  const toggleDropdown = (rowIndex) => {
    if (openDropdown === rowIndex) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(rowIndex);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };
    
    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [openDropdown]);

  // Render actions dropdown for desktop
  const renderDesktopActions = (row, rowIndex) => {
    if (!actions || actions.length === 0) return null;

    const filteredActions = actions.filter((action) => !action.show || action.show(row));

    // Special case for Cancelled status
    if (row.Status === "Cancelled" && deleteAction) {
      return (
        <button
          onClick={() => deleteAction(row)}
          className="px-4 py-2 min-w-[100px] rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
        >
          Delete
        </button>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleDropdown(rowIndex);
          }}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Actions"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        
        {openDropdown === rowIndex && (
          <div 
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {filteredActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    action.handler(row);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${getButtonClasses(action.label)} hover:bg-opacity-10 transition`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render actions for mobile (kept as buttons for better UX on mobile)
  const renderMobileActions = (row) => {
    if (!actions || actions.length === 0) return null;

    // Special case for Cancelled status
    if (row.Status === "Cancelled" && deleteAction) {
      return (
        <button
          onClick={() => deleteAction(row)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
        >
          Delete
        </button>
      );
    }

    const filteredActions = actions.filter((action) => !action.show || action.show(row));

    return (
      <div className="flex flex-wrap gap-2">
        {filteredActions.map((action, i) => (
          action.handler ? (
            <button
              key={i}
              onClick={() => action.handler(row)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${getButtonClasses(action.label)}`}
            >
              {action.label}
            </button>
          ) : null
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* ✅ Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  {col.header}
                </th>
              ))}
              {/* Actions column header */}
              {actions?.length > 0 && (
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions?.length > 0 ? 1 : 0)}
                  className="text-center py-12 text-gray-500 font-medium"
                >
                  No records matching your search criteria.
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-blue-50/50 transition duration-150"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-sm whitespace-nowrap ${col.className || 'text-gray-700'}`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}

                  {/* Actions column with dropdown */}
                  {actions?.length > 0 && (
                    <td className="px-6 py-4">
                      {renderDesktopActions(row, startIndex + rowIndex)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {currentData.map((row, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col space-y-3"
          >
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex justify-between items-start border-b border-gray-100 pb-1 last:border-b-0">
                <span className="font-semibold text-gray-600 text-sm">
                  {col.header}:
                </span>
                <span className={`text-gray-800 text-sm max-w-[60%] text-right ${col.className || ''}`}>
                  {col.render ? col.render(row) : row[col.accessor]}
                </span>
              </div>
            ))}

            {actions?.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <span className="block font-semibold text-gray-600 text-xs mb-2">Actions:</span>
                {renderMobileActions(row)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 p-3 bg-gray-50 rounded-xl shadow-inner">
          <span className="text-sm text-gray-600 font-medium order-2 sm:order-1">
            Showing {Math.min(endIndex, data.length)} of {data.length} records
          </span>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;