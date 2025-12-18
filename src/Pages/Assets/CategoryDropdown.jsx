// components/inventory/CategoryDropdown.jsx
import React, { useEffect, useState } from "react";
import categoryAPI from "../../lib/categoryAPI";
import { Search, X, ChevronRight } from "lucide-react";

const CategoryDropdown = ({ selectedCategory, onCategorySelect, leafCategories }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activePath, setActivePath] = useState([]); // Array of category IDs in the current path
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
  const [columnSearches, setColumnSearches] = useState({}); // Search terms for each column

  useEffect(() => {
    fetchCategoryTree();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      updateSelectedPath(selectedCategory);
      updateActivePath(selectedCategory);
    }
  }, [selectedCategory, categories]);

  const fetchCategoryTree = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getCategoryTree();
      
      let categoryData = [];
      
      if (response && response.success) {
        categoryData = response.data || [];
      } else if (Array.isArray(response)) {
        categoryData = response;
      } else if (response && Array.isArray(response.data)) {
        categoryData = response.data;
      }
      
      setCategories(categoryData);
    } catch (error) {
      console.error("Error fetching category tree:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category) => {
    if (!category) return "";
    return category.category_name || category.name || category.title || "";
  };

  const getCategoryChildren = (category) => {
    if (!category) return [];
    return category.children || category.subcategories || category.childCategories || [];
  };

  const getCategoryId = (category) => {
    if (!category) return null;
    return category.id || category._id;
  };

  const findCategoryById = (id, items = categories) => {
    for (const item of items) {
      if (!item) continue;
      if (getCategoryId(item) === id) return item;
      const children = getCategoryChildren(item);
      if (children.length > 0) {
        const found = findCategoryById(id, children);
        if (found) return found;
      }
    }
    return null;
  };

  const findCategoryPath = (categoryId, items = categories, path = []) => {
    for (const item of items) {
      if (!item) continue;
      
      const currentPath = [...path, item];
      
      if (getCategoryId(item) === categoryId) {
        return currentPath;
      }
      
      const children = getCategoryChildren(item);
      if (children.length > 0) {
        const result = findCategoryPath(categoryId, children, currentPath);
        if (result) return result;
      }
    }
    return null;
  };

  const updateSelectedPath = (category) => {
    if (!category) {
      setSelectedPath("");
      return;
    }
    
    const path = findCategoryPath(getCategoryId(category));
    if (path && path.length > 0) {
      const pathNames = path.map(item => getCategoryName(item));
      setSelectedPath(pathNames.join(" > "));
    } else {
      setSelectedPath(getCategoryName(category));
    }
  };

  const updateActivePath = (category) => {
    if (!category) {
      setActivePath([]);
      return;
    }
    
    const path = findCategoryPath(getCategoryId(category));
    if (path) {
      setActivePath(path.map(getCategoryId));
    }
  };

  const resetActiveStates = () => {
    setActivePath([]);
    setColumnSearches({});
  };

  const handleCategorySelect = (category) => {
    if (!category) return;
    
    // If leafCategories is true and category has children, navigate deeper instead of selecting
    if (leafCategories && getCategoryChildren(category).length > 0) {
      // Add to active path to show children
      setActivePath(prev => [...prev, getCategoryId(category)]);
      return;
    }
    
    const categoryId = getCategoryId(category);
    const path = findCategoryPath(categoryId);
    
    if (path && path.length > 0) {
      const pathNames = path.map(item => getCategoryName(item));
      setSelectedPath(pathNames.join(" > "));
    } else {
      setSelectedPath(getCategoryName(category));
    }
    
    setIsOpen(false);
    setSearchTerm("");
    resetActiveStates();
    onCategorySelect(category);
  };

  const handleLevelClick = (category, levelIndex) => {
    const categoryId = getCategoryId(category);
    
    // If clicking on a category that's already in the path, 
    // truncate the path to that level
    const existingIndex = activePath.indexOf(categoryId);
    if (existingIndex !== -1) {
      setActivePath(prev => prev.slice(0, existingIndex + 1));
    } else {
      // Navigate to this category
      const newPath = activePath.slice(0, levelIndex);
      newPath.push(categoryId);
      setActivePath(newPath);
    }
  };

  const getItemsForLevel = (levelIndex) => {
    let items = [];
    
    if (levelIndex === 0) {
      // Root level
      items = categories;
    } else if (levelIndex <= activePath.length) {
      const parentCategoryId = activePath[levelIndex - 1];
      const parentCategory = findCategoryById(parentCategoryId);
      if (parentCategory) {
        items = getCategoryChildren(parentCategory);
      }
    }
    
    // Apply column-specific search if exists
    const columnSearch = columnSearches[levelIndex];
    if (columnSearch && columnSearch.trim()) {
      const searchLower = columnSearch.toLowerCase();
      items = items.filter(item => {
        if (!item) return false;
        const name = getCategoryName(item).toLowerCase();
        return name.includes(searchLower);
      });
    }
    
    return items;
  };

  const getAllCategories = () => {
    const allCategories = [];
    
    const traverse = (items, level = 0) => {
      items.forEach(item => {
        if (!item) return;
        allCategories.push({
          ...item,
          level,
          fullPath: getCategoryName(item)
        });
        
        const children = getCategoryChildren(item);
        if (children.length > 0) {
          traverse(children, level + 1);
        }
      });
    };
    
    traverse(categories);
    return allCategories;
  };

  const searchCategories = (term) => {
    if (!term.trim()) return [];
    
    const allCategories = getAllCategories();
    const searchTerm = term.toLowerCase();
    
    return allCategories.filter(category => 
      getCategoryName(category).toLowerCase().includes(searchTerm)
    );
  };

  const handleSearchResultClick = (category) => {
    const path = findCategoryPath(getCategoryId(category));
    if (path) {
      setActivePath(path.map(getCategoryId));
      setColumnSearches({});
    }
  };

  const handleColumnSearchChange = (levelIndex, searchTerm) => {
    setColumnSearches(prev => ({
      ...prev,
      [levelIndex]: searchTerm
    }));
  };

  const clearColumnSearch = (levelIndex) => {
    setColumnSearches(prev => {
      const newSearches = { ...prev };
      delete newSearches[levelIndex];
      return newSearches;
    });
  };

  const searchResults = searchCategories(searchTerm);
  
  // Calculate total columns to show: activePath.length + 1 (for next level if exists)
  const totalColumns = activePath.length + 1;

  return (
    <div className="max-w-full relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            resetActiveStates();
            setSearchTerm("");
          }
        }}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <div className="flex justify-between items-center">
          <span className="font-medium truncate text-sm">
            {selectedPath || "Select Category"}
          </span>
          <span className={`text-xs transition-transform flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-90' : ''
          }`}>▶</span>
        </div>
        {selectedCategory && (
          <div className="text-xs text-gray-500 mt-1 truncate">
            ID: {getCategoryId(selectedCategory)}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-96 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search all categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {searchTerm && searchResults.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto">
                <div className="text-xs font-semibold text-gray-500 mb-1">Search Results:</div>
                {searchResults.slice(0, 5).map((result, index) => (
                  <div
                    key={`${getCategoryId(result)}-${index}`}
                    className="px-2 py-1 text-sm cursor-pointer hover:bg-blue-50 rounded-md flex items-center"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <span className="truncate">{getCategoryName(result)}</span>
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded">
                      {result.level === 0 ? 'Parent' : result.level === 1 ? 'Child' : 'Nested'}
                    </span>
                  </div>
                ))}
                {searchResults.length > 5 && (
                  <div className="text-xs text-gray-400 px-2 py-1">
                    +{searchResults.length - 5} more results
                  </div>
                )}
              </div>
            )}
            
            {searchTerm && searchResults.length === 0 && (
              <div className="mt-2 text-sm text-gray-500 text-center">
                No categories found
              </div>
            )}
          </div>

          {/* Horizontal Scrollable Container for All Columns */}
          <div className="overflow-x-auto">
            <div className="flex min-h-60 max-h-80" style={{ minWidth: `${totalColumns * 192}px` }}>
              {/* Render columns for each level */}
              {Array.from({ length: totalColumns }).map((_, columnIndex) => {
                const items = getItemsForLevel(columnIndex);
                const parentCategoryId = columnIndex > 0 ? activePath[columnIndex - 1] : null;
                const parentCategory = parentCategoryId ? findCategoryById(parentCategoryId) : null;
                const columnSearch = columnSearches[columnIndex] || "";
                
                return (
                  <div key={columnIndex} className="w-48 border-r border-gray-200 flex-shrink-0">
                    <div className="p-2 h-full flex flex-col">
                      <div className="font-semibold px-2 py-1 text-sm text-gray-700 border-b border-gray-100 mb-1 flex items-center justify-between">
                        <span className="truncate">
                          {columnIndex === 0 
                            ? "Categories" 
                            : parentCategory 
                              ? getCategoryName(parentCategory)
                              : "Subcategories"}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">
                          {items.length}
                        </span>
                      </div>
                      
                      {/* Search input for this column */}
                      <div className="mb-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={`Search ${columnIndex === 0 ? 'all' : 'here'}...`}
                            value={columnSearch}
                            onChange={(e) => handleColumnSearchChange(columnIndex, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 pr-6"
                          />
                          {columnSearch && (
                            <button
                              onClick={() => clearColumnSearch(columnIndex)}
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              type="button"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto">
                        {items.length > 0 ? (
                          items.map((category) => {
                            if (!category) return null;
                            const categoryName = getCategoryName(category);
                            const children = getCategoryChildren(category);
                            const hasChildren = children.length > 0;
                            const categoryId = getCategoryId(category);
                            const isInPath = activePath.includes(categoryId);
                            const isSelectable = !leafCategories || !hasChildren;

                            return (
                              <div
                                key={categoryId}
                                className={`px-3 py-2 cursor-pointer transition-colors rounded-md flex justify-between items-center ${
                                  isInPath ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                } ${!isSelectable ? '' : ''}`}
                                onClick={() => {
                                  if (hasChildren) {
                                    handleLevelClick(category, columnIndex);
                                  } else {
                                    handleCategorySelect(category);
                                  }
                                }}
                                onMouseEnter={() => {
                                  if (hasChildren && !isInPath) {
                                    // Auto-navigate on hover if not already in path
                                    const newPath = activePath.slice(0, columnIndex);
                                    newPath.push(categoryId);
                                    setActivePath(newPath);
                                  }
                                }}
                              >
                                <span className="text-sm truncate">{categoryName}</span>
                                {hasChildren ? (
                                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-1" />
                                ) : (
                                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded flex-shrink-0">
                                    Select
                                  </span>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            {columnSearch ? "No matches found" : "No items found"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* If the last level has items with children, add one more column */}
              {totalColumns > 0 && getItemsForLevel(totalColumns - 1).some(item => getCategoryChildren(item).length > 0) && (
                <div className="w-48 border-r border-gray-200 flex-shrink-0">
                  <div className="p-2 h-full flex flex-col items-center justify-center">
                    <div className="text-sm text-gray-400 text-center">
                      <ChevronRight className="w-6 h-6 mx-auto mb-2" />
                      <p>Select a category to see more levels</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;