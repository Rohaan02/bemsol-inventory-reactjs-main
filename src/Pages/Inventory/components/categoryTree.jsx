import React, { useState, useEffect } from "react";
import categoryAPI from "@/lib/categoryAPI";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
// Updated Category Dropdown Component with unlimited nesting support
const CategoryDropdown = ({ selectedCategory, onCategorySelect, leafCategories }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activePath, setActivePath] = useState([]); // Track the active path instead of individual parents
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
 
  
  // Separate search terms for each panel
  const [panelSearches, setPanelSearches] = useState({});

  // Fetch category tree on component mount
  useEffect(() => {
    fetchCategoryTree();
  }, []);

  const fetchCategoryTree = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getCategoryTree();
      
      // Handle different response structures
      let categoryData = [];
      
      if (response && response.success) {
        categoryData = response.data || [];
      } else if (Array.isArray(response)) {
        categoryData = response;
      } else if (response && Array.isArray(response.data)) {
        categoryData = response.data;
      }
      
      console.log("Fetched category data:", categoryData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Error fetching category tree:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };
 

  // Safe category name getter - using category_name
  const getCategoryName = (category) => {
    if (!category) return "";
    return category.category_name || category.name || category.title || "";
  };

  // Safe children getter
  const getCategoryChildren = (category) => {
    if (!category) return [];
    return category.children || category.subcategories || category.childCategories || [];
  };

  // Find category by ID path
  const findCategoryByPath = (path) => {
    let currentItems = categories;
    let result = null;
    
    for (const id of path) {
      result = currentItems.find(item => (item.id === id || item._id === id));
      if (!result) break;
      currentItems = getCategoryChildren(result);
    }
    
    return result;
  };

  // Get categories for a specific level
  const getCategoriesForLevel = (level) => {
    if (level === 0) {
      // Root level - apply main search or panel search
      let items = categories;
      if (searchTerm.trim()) {
        items = filterCategories(categories, searchTerm);
      }
      const panelSearch = panelSearches[0] || "";
      return filterCategories(items, panelSearch);
    }
    
    // For nested levels, get from active path
    const parentCategory = findCategoryByPath(activePath.slice(0, level));
    if (!parentCategory) return [];
    
    let children = getCategoryChildren(parentCategory);
    const panelSearch = panelSearches[level] || "";
    return filterCategories(children, panelSearch);
  };

  // Find category path (parent chain)
  const findCategoryPath = (categoryId, items = categories, path = []) => {
    for (const item of items) {
      if (!item) continue;
      
      const currentPath = [...path, item];
      
      if (item.id === categoryId || item._id === categoryId) {
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

  // Reset all active states and searches
  const resetActiveStates = () => {
    setActivePath([]);
    setPanelSearches({});
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    if (!category) return;
    
    const categoryId = category.id || category._id;
    const categoryName = getCategoryName(category);
    
    // Find and set the full path
    const path = findCategoryPath(categoryId);
    if (path && path.length > 0) {
      const pathNames = path.map(item => getCategoryName(item));
      setSelectedPath(pathNames.join(" > "));
    } else {
      setSelectedPath(categoryName);
    }
    
    // Close the dropdown
    setIsOpen(false);
    
    // Reset all searches and active states
    setSearchTerm("");
    resetActiveStates();
    
    // Call parent handler with selected category
    onCategorySelect(category);
    
    console.log("Selected Category ID:", categoryId);
    console.log("Selected Category:", category);
  };

  // Filter categories by search term for each panel
  const filterCategories = (items, searchTerm) => {
    if (!searchTerm.trim()) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item && getCategoryName(item).toLowerCase().includes(term)
    );
  };

  // Handle panel search change
  const handlePanelSearchChange = (level, value) => {
    setPanelSearches(prev => ({
      ...prev,
      [level]: value
    }));
  };

  // Handle category hover to set active path
  const handleCategoryHover = (category, level) => {
    const categoryId = category.id || category._id;
    const newPath = activePath.slice(0, level);
    newPath[level] = categoryId;
    setActivePath(newPath);
  };

  // Flatten all categories for main search
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

  // Search through all categories for main search
  const searchCategories = (term) => {
    if (!term.trim()) return [];
    
    const allCategories = getAllCategories();
    const searchTerm = term.toLowerCase();
    
    return allCategories.filter(category => 
      getCategoryName(category).toLowerCase().includes(searchTerm)
    );
  };

  // Handle search result click
  const handleSearchResultClick = (category) => {
    const path = findCategoryPath(category.id || category._id);
    if (path) {
      const pathIds = path.map(item => item.id || item._id);
      setActivePath(pathIds);
    }
  };

  const searchResults = searchCategories(searchTerm);
  const maxVisibleLevels = 4; // You can adjust this based on your UI requirements

  return (
    <div className="max-w-full relative">
      {/* Dropdown trigger button - Shows selected path */}
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
            ID: {selectedCategory.id || selectedCategory._id}
          </div>
        )}
      </button>

      {/* Main Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-96 max-h-96 overflow-hidden">
          {/* Main Search Bar */}
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
                  ✕
                </button>
              )}
            </div>
            
            {/* Search Results */}
            {searchTerm && searchResults.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto">
                <div className="text-xs font-semibold text-gray-500 mb-1">Search Results:</div>
                {searchResults.slice(0, 5).map((result, index) => (
                  <div
                    key={`${result.id || result._id}-${index}`}
                    className="px-2 py-1 text-sm cursor-pointer hover:bg-blue-50 rounded-md flex items-center"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <span className="truncate">{getCategoryName(result)}</span>
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded">
                      Level {result.level}
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

          <div className="flex min-h-60 max-h-80">
            {/* Dynamic Panels for each level */}
            {Array.from({ length: Math.min(maxVisibleLevels, activePath.length + 1) }).map((_, level) => {
              const categoriesForLevel = getCategoriesForLevel(level);
              const parentCategory = level > 0 ? findCategoryByPath(activePath.slice(0, level)) : null;
              
              return (
                <div key={level} className="w-48 border-r border-gray-200 last:border-r-0">
                  <div className="p-2">
                    <div className="font-semibold px-2 py-1 text-sm text-gray-700 border-b border-gray-100 mb-1 flex items-center justify-between">
                      <span className="truncate">
                        {level === 0 ? "Categories" : getCategoryName(parentCategory)}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">
                        {categoriesForLevel.length}
                      </span>
                    </div>
                    
                    {/* Panel Search */}
                    <div className="mb-2">
                      <input
                        type="text"
                        placeholder={`Search ${level === 0 ? 'categories' : 'subcategories'}...`}
                        value={panelSearches[level] || ""}
                        onChange={(e) => handlePanelSearchChange(level, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto">
                      {categoriesForLevel.length > 0 ? (
                        categoriesForLevel.map((category) => {
                          if (!category) return null;
                          const categoryName = getCategoryName(category);
                          const children = getCategoryChildren(category);
                          const hasChildren = children.length > 0;
                          const categoryId = category.id || category._id;
                          const isActive = activePath[level] === categoryId;

                          return (
                            <div
                              key={categoryId}
                              className={`px-3 py-2 cursor-pointer transition-colors rounded-md flex justify-between items-center ${
                                isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                              }`}
                              onMouseEnter={() => {
                                if (hasChildren && level < maxVisibleLevels - 1) {
                                  handleCategoryHover(category, level);
                                }
                              }}
                              onClick={() => handleCategorySelect(category)}
                            >
                              <span className="text-sm truncate">{categoryName}</span>
                              {hasChildren && level < maxVisibleLevels - 1 && (
                                <span className="text-xs text-gray-400 flex-shrink-0 ml-1">▶</span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          No categories found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

  );
};
export default CategoryDropdown;