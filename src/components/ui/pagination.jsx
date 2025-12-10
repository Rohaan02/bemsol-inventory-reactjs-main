// src/components/ui/pagination.jsx
import React from "react";
import { Button } from "./button";

// Main Pagination wrapper
export const Pagination = ({ children }) => {
  return <div className="flex items-center justify-center space-x-2 mt-4">{children}</div>;
};

// Pagination content (full component with page buttons)
export const PaginationContent = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Pagination>
      <PaginationPrevious currentPage={currentPage} onPageChange={onPageChange} />
      {pages.map((page) => (
        <PaginationItem key={page} currentPage={currentPage} page={page} onPageChange={onPageChange} />
      ))}
      <PaginationNext currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </Pagination>
  );
};

// Individual page button
export const PaginationItem = ({ page, currentPage, onPageChange }) => {
  return (
    <PaginationLink
      onClick={() => onPageChange(page)}
      active={currentPage === page}
    >
      {page}
    </PaginationLink>
  );
};

// Link/button for a page
export const PaginationLink = ({ children, onClick, active }) => {
  return (
    <Button
      onClick={onClick}
      className={`px-2 py-1 ${active ? "bg-blue-600 text-white" : ""}`}
    >
      {children}
    </Button>
  );
};

// Previous button
export const PaginationPrevious = ({ currentPage, onPageChange }) => (
  <Button
    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
    disabled={currentPage === 1}
    className="px-2 py-1"
  >
    Prev
  </Button>
);

// Next button
export const PaginationNext = ({ currentPage, totalPages, onPageChange }) => (
  <Button
    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="px-2 py-1"
  >
    Next
  </Button>
);
