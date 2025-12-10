// src/pages/Category/CategoryIndex.jsx
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import categoryAPI from "@/lib/categoryAPI";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";

import Swal from "sweetalert2";

const CategoryIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCategory, setEditCategory] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = filtered.length;
  const totalPages = pageSize === "all" ? 1 : Math.ceil(totalItems / pageSize);

  // Search
  const [search, setSearch] = useState("");

  // Modal state
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  // Expanded rows for tree view
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  // Fetch categories with hierarchical structure
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryAPI.getCategoryTree();
      setCategories(res?.data || []);
      setFiltered(res?.data || []);
    } catch {
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(categories);
    } else {
      const searchLower = search.toLowerCase();
      const filterCategories = (cats) => {
        let results = [];
        cats.forEach((cat) => {
          if (cat.category_name.toLowerCase().includes(searchLower)) {
            results.push(cat);
          }
          if (cat.children && cat.children.length > 0) {
            results = results.concat(filterCategories(cat.children));
          }
        });
        return results;
      };
      setFiltered(filterCategories(categories));
    }
    setPage(1);
  }, [search, categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Enhanced flatten function to ensure newly added categories are visible
  const flattenCategories = (cats, level = 0, parentExpanded = true) => {
    let flat = [];
    cats.forEach((cat) => {
      const isExpanded = expandedRows.has(cat.id);
      flat.push({
        ...cat,
        level,
        hasChildren: cat.children && cat.children.length > 0,
      });

      // Always show children if parent is expanded OR if we're searching
      if (
        cat.children &&
        cat.children.length > 0 &&
        (isExpanded || search.trim() !== "")
      ) {
        flat = flat.concat(
          flattenCategories(cat.children, level + 1, isExpanded)
        );
      }
    });
    return flat;
  };

  const flattenedCategories = flattenCategories(filtered);
  const paginated =
    pageSize === "all"
      ? flattenedCategories
      : flattenedCategories.slice((page - 1) * pageSize, page * pageSize);

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSave = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setSaving(true);

      let res;
      if (editCategory) {
        // update existing
        res = await categoryAPI.update(editCategory.id, {
          category_name: newCategory,
          parent_id: parentId || null,
        });
      } else {
        // create new
        res = await categoryAPI.create({
          category_name: newCategory,
          parent_id: parentId || null,
        });
      }

      if (res?.success) {
        toast.success(res.message || "Operation successful", {
          position: "top-right",
          autoClose: 3000,
        });
        setNewCategory("");
        setParentId("");
        setSelectedParent(null);
        setEditCategory(null);
        setOpen(false);

        // Auto-expand the parent when adding a subcategory
        if (parentId && !editCategory) {
          const newExpanded = new Set(expandedRows);
          newExpanded.add(parseInt(parentId));
          setExpandedRows(newExpanded);
        }

        // Refresh categories
        await fetchCategories();
      } else {
        toast.error(res?.message || "Operation failed", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      // Catch 422 validation errors
      if (err.response?.status === 422 && err.response.data.errors) {
        const errors = err.response.data.errors;
        Object.values(errors).forEach((messages) => {
          messages.forEach((msg) =>
            toast.error(msg, { position: "top-right", autoClose: 5000 })
          );
        });
      } else {
        toast.error("Something went wrong", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditCategory(cat);
    setNewCategory(cat.category_name);
    setParentId(cat.parent_id || "");
    setSelectedParent(null);
    setOpen(true);
    setOpenDropdown(null);
  };

  // Add new root category
  const handleAddNew = () => {
    setEditCategory(null);
    setNewCategory("");
    setParentId("");
    setSelectedParent(null);
    setOpen(true);
  };

  // Add subcategory to specific parent
  const handleAddSubcategory = (parentCategory) => {
    setEditCategory(null);
    setNewCategory("");
    setParentId(parentCategory.id);
    setSelectedParent(parentCategory);
    setOpen(true);
  };

  const handleDelete = async (id, categoryName) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Delete category "${categoryName}"? This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await categoryAPI.remove(id);
        if (res?.success) {
          Swal.fire("Deleted!", res.message || "Category deleted.", "success");
          fetchCategories();
        } else {
          Swal.fire("Error", res?.message || "Failed to delete.", "error");
        }
      } catch (error) {
        if (error.response?.status === 422) {
          Swal.fire(
            "Cannot Delete",
            error.response.data.message ||
              "This category has subcategories and cannot be deleted.",
            "error"
          );
        } else {
          Swal.fire(
            "Error",
            "Something went wrong. Please try again.",
            "error"
          );
        }
      }
    }
    setOpenDropdown(null);
  };

  // View category details
  const handleView = (cat) => {
    // You can implement view functionality here
    // For example, show a modal with category details
    Swal.fire({
      title: `Category: ${cat.category_name}`,
      html: `
        <div class="text-left">
          <p><strong>ID:</strong> ${cat.id}</p>
          <p><strong>Name:</strong> ${cat.category_name}</p>
          <p><strong>Parent ID:</strong> ${cat.parent_id || "Root Category"}</p>
          <p><strong>Has Children:</strong> ${
            cat.children && cat.children.length > 0 ? "Yes" : "No"
          }</p>
          ${
            cat.children && cat.children.length > 0
              ? `<p><strong>Children Count:</strong> ${cat.children.length}</p>`
              : ""
          }
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
    setOpenDropdown(null);
  };

  const getIndentation = (level) => {
    return { marginLeft: `${level * 20}px` };
  };

  const getFolderIcon = (hasChildren, isExpanded) => {
    if (!hasChildren) return <Folder className="w-4 h-4 text-gray-400" />;
    return isExpanded ? (
      <FolderOpen className="w-4 h-4 text-blue-500" />
    ) : (
      <Folder className="w-4 h-4 text-blue-500" />
    );
  };

  // Toggle dropdown
  const toggleDropdown = (e, categoryId) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, page - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value === "all" ? "all" : parseInt(value));
    setPage(1);
  };

  // Find category path for breadcrumb
  const getCategoryPath = (categoryId) => {
    const findPath = (cats, targetId, path = []) => {
      for (const cat of cats) {
        if (cat.id === targetId) {
          return [...path, cat];
        }
        if (cat.children && cat.children.length > 0) {
          const found = findPath(cat.children, targetId, [...path, cat]);
          if (found) return found;
        }
      }
      return null;
    };

    return findPath(categories, categoryId) || [];
  };

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleAddNew}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>

          <Card className="bg-white">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <CardTitle className="text-gray-800">Category List</CardTitle>
              {/* Enhanced Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="all">All</option>
                  </select>
                  <span className="text-sm text-gray-700">
                    of {totalItems} items
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border border-green-600 text-green-600 hover:bg-green-50"
                    disabled={page === 1}
                    onClick={() => setPage(1)}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border border-green-600 text-green-600 hover:bg-green-50"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {getPageNumbers().map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        className={`min-w-10 h-10 ${
                          pageNum === page
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-white border border-green-600 text-green-600 hover:bg-green-50"
                        }`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border border-green-600 text-green-600 hover:bg-green-50"
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border border-green-600 text-green-600 hover:bg-green-50"
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage(totalPages)}
                  >
                    Last
                  </Button>
                </div>

                <div className="text-sm text-gray-700">
                  Page {page} of {totalPages || 1}
                </div>
              </div>
              <Input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </CardHeader>

            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>Tip:</strong> Click the arrow (▶) next to parent
                      categories to expand and see their subcategories. New
                      subcategories will automatically appear when you expand
                      their parent.
                    </p>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead className="w-32">Add Subcategory</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-4 text-gray-500"
                          >
                            No categories found.{" "}
                            {search && "Try a different search term."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginated.map((cat) => {
                          const isExpanded = expandedRows.has(cat.id);
                          return (
                            <TableRow
                              key={cat.id}
                              className={cat.level > 0 ? "bg-gray-50" : ""}
                            >
                              <TableCell>{cat.id}</TableCell>
                              <TableCell>
                                <div
                                  className="flex items-center gap-2"
                                  style={getIndentation(cat.level)}
                                >
                                  {cat.hasChildren && (
                                    <button
                                      onClick={() => toggleRow(cat.id)}
                                      className="p-1 hover:bg-gray-200 rounded transition-all"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="w-4 h-4" />
                                      ) : (
                                        <ChevronRightIcon className="w-4 h-4" />
                                      )}
                                    </button>
                                  )}
                                  {!cat.hasChildren && <div className="w-6" />}
                                  {getFolderIcon(cat.hasChildren, isExpanded)}
                                  <span
                                    className={
                                      cat.level === 0 ? "font-semibold" : ""
                                    }
                                  >
                                    {cat.category_name}
                                  </span>
                                  {cat.hasChildren && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      ({cat.children.length})
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {cat.parent_id ? (
                                  <span className="text-gray-600">
                                    {(() => {
                                      // Find parent name from the full category tree
                                      const findParentName = (
                                        cats,
                                        parentId
                                      ) => {
                                        for (const category of cats) {
                                          if (category.id === parentId) {
                                            return category.category_name;
                                          }
                                          if (
                                            category.children &&
                                            category.children.length > 0
                                          ) {
                                            const found = findParentName(
                                              category.children,
                                              parentId
                                            );
                                            if (found) return found;
                                          }
                                        }
                                        return "N/A";
                                      };
                                      return findParentName(
                                        categories,
                                        cat.parent_id
                                      );
                                    })()}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">
                                    Root Category
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <button
                                  onClick={() => handleAddSubcategory(cat)}
                                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded flex items-center gap-1 text-sm transition-colors"
                                  title={`Add subcategory to ${cat.category_name}`}
                                >
                                  <Plus size={14} />
                                  Add Child
                                </button>
                              </TableCell>
                              <TableCell className="relative">
                                <div className="flex justify-center">
                                  <button
                                    onClick={(e) => toggleDropdown(e, cat.id)}
                                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                    title="Actions"
                                  >
                                    <MoreVertical size={18} />
                                  </button>

                                  {/* Dropdown Menu */}
                                  {openDropdown === cat.id && (
                                    <div className="absolute right-0 mt-8 w-48 bg-white rounded-md shadow-lg border z-10">
                                      <div className="py-1">
                                        <button
                                          onClick={() => handleView(cat)}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          View Details
                                        </button>
                                        <button
                                          onClick={() => handleEdit(cat)}
                                          className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                                        >
                                          <Pencil className="w-4 h-4 mr-2" />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDelete(
                                              cat.id,
                                              cat.category_name
                                            )
                                          }
                                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add/Edit Category Modal */}
      <Dialog open={open} onOpenChange={setOpen} size="md">
        <DialogHeader>
          <h2 className="text-xl font-bold">
            {editCategory ? "Edit Category" : "Add Category"}
          </h2>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {/* Show parent hierarchy when adding subcategory */}
          {selectedParent && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm font-medium text-blue-800">Adding under:</p>
              <div className="flex items-center gap-1 mt-1 text-sm text-blue-600">
                {getCategoryPath(selectedParent.id).map((parent, index) => (
                  <span key={parent.id}>
                    {parent.category_name}
                    {index < getCategoryPath(selectedParent.id).length - 1 && (
                      <span className="mx-1">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Only show parent selection when editing or adding root category */}
          {(editCategory || !selectedParent) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Root Category (No Parent)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {editCategory
                  ? "Change parent category"
                  : "Leave empty to create a root category"}
              </p>
            </div>
          )}

          {/* Show fixed parent when adding subcategory */}
          {selectedParent && !editCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              <div className="p-2 bg-gray-100 rounded-md border">
                <span className="font-medium">
                  {selectedParent.category_name}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  (Fixed - selected from tree)
                </span>
              </div>
              <input type="hidden" value={selectedParent.id} />
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 transition-colors"
            disabled={saving || !newCategory.trim()}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : editCategory ? "Update" : "Save"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default CategoryIndex;
