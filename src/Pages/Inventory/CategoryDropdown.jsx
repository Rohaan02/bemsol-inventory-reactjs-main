// components/inventory/CategoryDropdown.jsx
import React, { useEffect, useState } from "react";
import categoryAPI from "../../lib/categoryAPI";
const CategoryDropdown = ({ selectedCategory, onCategorySelect, leafCategories }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeParent, setActiveParent] = useState(null);
  const [activeChild, setActiveChild] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
  
  const [parentSearch, setParentSearch] = useState("");
  const [childSearch, setChildSearch] = useState("");
  const [nestedSearch, setNestedSearch] = useState("");

  useEffect(() => {
    fetchCategoryTree();
  }, []);

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

  const findCategoryById = (id, items = categories) => {
    for (const item of items) {
      if (!item) continue;
      if (item.id === id || item._id === id) return item;
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

  const resetActiveStates = () => {
    setActiveParent(null);
    setActiveChild(null);
    setParentSearch("");
    setChildSearch("");
    setNestedSearch("");
  };

  const handleCategorySelect = (category) => {
    if (!category) return;
    
    const categoryId = category.id || category._id;
    const categoryName = getCategoryName(category);
    
    const path = findCategoryPath(categoryId);
    if (path && path.length > 0) {
      const pathNames = path.map(item => getCategoryName(item));
      setSelectedPath(pathNames.join(" > "));
    } else {
      setSelectedPath(categoryName);
    }
    
    setIsOpen(false);
    setSearchTerm("");
    resetActiveStates();
    onCategorySelect(category);
  };

  const filterCategories = (items, searchTerm) => {
    if (!searchTerm.trim()) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item && getCategoryName(item).toLowerCase().includes(term)
    );
  };

  const getParentCategories = () => {
    let items = categories;
    if (searchTerm.trim()) {
      items = filterCategories(categories, searchTerm);
    }
    return filterCategories(items, parentSearch);
  };

  const getChildCategories = () => {
    if (!activeParent) return [];
    const parentCategory = findCategoryById(activeParent);
    if (!parentCategory) return [];
    
    let children = getCategoryChildren(parentCategory);
    return filterCategories(children, childSearch);
  };

  const getNestedCategories = () => {
    if (!activeChild) return [];
    const childCategory = findCategoryById(activeChild);
    if (!childCategory) return [];
    
    let grandchildren = getCategoryChildren(childCategory);
    return filterCategories(grandchildren, nestedSearch);
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
    const findParentChain = (cat, items = categories, chain = []) => {
      for (const item of items) {
        if (!item) continue;
        
        const currentChain = [...chain, item];
        
        if (item.id === cat.id || item._id === cat._id) {
          return currentChain;
        }
        
        const children = getCategoryChildren(item);
        if (children.length > 0) {
          const result = findParentChain(cat, children, currentChain);
          if (result) return result;
        }
      }
      return null;
    };
    
    const parentChain = findParentChain(category);
    if (parentChain) {
      if (parentChain.length >= 1) {
        setActiveParent(parentChain[0].id || parentChain[0]._id);
      }
      if (parentChain.length >= 2) {
        setActiveChild(parentChain[1].id || parentChain[1]._id);
      }
    }
  };

  const searchResults = searchCategories(searchTerm);
  const parentCategories = getParentCategories();
  const childCategories = getChildCategories();
  const nestedCategories = getNestedCategories();

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
            ID: {selectedCategory.id || selectedCategory._id}
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
                  ✕
                </button>
              )}
            </div>
            
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

          <div className="flex min-h-60 max-h-80">
            <div className="w-48 border-r border-gray-200">
              <div className="p-2">
                <div className="font-semibold px-2 py-1 text-sm text-gray-700 border-b border-gray-100 mb-1 flex items-center justify-between">
                  <span>{searchTerm ? "Filtered" : "Categories"}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">
                    {parentCategories.length}
                  </span>
                </div>
                
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search parents..."
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="max-h-48 overflow-y-auto">
                  {parentCategories.length > 0 ? (
                    parentCategories.map((category) => {
                      if (!category) return null;
                      const categoryName = getCategoryName(category);
                      const children = getCategoryChildren(category);
                      const hasChildren = children.length > 0;
                      const categoryId = category.id || category._id;
                      const isActive = activeParent === categoryId;

                      return (
                        <div
                          key={categoryId}
                          className={`px-3 py-2 cursor-pointer transition-colors rounded-md flex justify-between items-center ${
                            isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                          }`}
                          onMouseEnter={() => {
                            if (hasChildren) {
                              setActiveParent(categoryId);
                              setActiveChild(null);
                              setChildSearch("");
                              setNestedSearch("");
                            }
                          }}
                          onClick={() => handleCategorySelect(category)}
                        >
                          <span className="text-sm truncate">{categoryName}</span>
                          {hasChildren && (
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

            {activeParent && (
              <div className="w-48 border-r border-gray-200">
                <div className="p-2">
                  <div className="font-semibold px-2 py-1 text-sm text-gray-700 border-b border-gray-100 mb-1 flex items-center justify-between">
                    <span className="truncate">
                      {getCategoryName(findCategoryById(activeParent))}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">
                      {childCategories.length}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Search subcategories..."
                      value={childSearch}
                      onChange={(e) => setChildSearch(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto">
                    {childCategories.length > 0 ? (
                      childCategories.map((child) => {
                        if (!child) return null;
                        const childName = getCategoryName(child);
                        const grandChildren = getCategoryChildren(child);
                        const hasGrandChildren = grandChildren.length > 0;
                        const childId = child.id || child._id;
                        const isActive = activeChild === childId;

                        return (
                          <div
                            key={childId}
                            className={`px-3 py-2 cursor-pointer transition-colors rounded-md flex justify-between items-center ${
                              isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                            }`}
                            onMouseEnter={() => {
                              if (hasGrandChildren) {
                                setActiveChild(childId);
                                setNestedSearch("");
                              }
                            }}
                            onClick={() => handleCategorySelect(child)}
                          >
                            <span className="text-sm truncate">{childName}</span>
                            {hasGrandChildren && (
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-1">▶</span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        No subcategories found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeChild && (
              <div className="w-48">
                <div className="p-2">
                  <div className="font-semibold px-2 py-1 text-sm text-gray-700 border-b border-gray-100 mb-1 flex items-center justify-between">
                    <span className="truncate">
                      {getCategoryName(findCategoryById(activeChild))}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">
                      {nestedCategories.length}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Search nested..."
                      value={nestedSearch}
                      onChange={(e) => setNestedSearch(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto">
                    {nestedCategories.length > 0 ? (
                      nestedCategories.map((grandChild) => {
                        if (!grandChild) return null;
                        const grandChildName = getCategoryName(grandChild);
                        const greatGrandChildren = getCategoryChildren(grandChild);
                        const hasGreatGrandChildren = greatGrandChildren.length > 0;

                        return (
                          <div
                            key={grandChild.id || grandChild._id}
                            className="px-3 py-2 cursor-pointer transition-colors rounded-md flex justify-between items-center hover:bg-gray-50"
                            onClick={() => handleCategorySelect(grandChild)}
                          >
                            <span className="text-sm truncate">{grandChildName}</span>
                            {hasGreatGrandChildren && (
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-1">▶</span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        No nested categories found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;