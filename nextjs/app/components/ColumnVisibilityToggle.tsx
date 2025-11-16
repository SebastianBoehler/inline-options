"use client";

import React, { useState } from "react";
import { ColumnConfig, SortKey } from "../ColumnsConfig";
import { useColumnVisibilityStore } from "../stores/columnVisibilityStore";

interface ColumnVisibilityToggleProps {
  allColumns: ColumnConfig[];
}

export default function ColumnVisibilityToggle({
  allColumns,
}: ColumnVisibilityToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { visibleColumns, toggleColumn, resetToDefaults, showAllColumns } = useColumnVisibilityStore();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors"
      >
        Columns ({visibleColumns.length})
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded shadow-lg z-20 max-h-96 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-200 flex gap-2">
              <button
                onClick={() => resetToDefaults()}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Reset
              </button>
              <button
                onClick={() => showAllColumns(allColumns.map(col => col.key))}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Show All
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {allColumns.map((column) => (
                  <label
                    key={column.key}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(column.key)}
                      onChange={() => toggleColumn(column.key)}
                      className="w-3 h-3 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span className="text-xs text-gray-700">{column.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
