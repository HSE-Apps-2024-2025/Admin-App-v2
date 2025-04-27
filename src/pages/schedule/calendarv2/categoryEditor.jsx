import React, { useState, useEffect } from "react";

const CategoryEditor = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Fetch the categories from the API
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/schedule/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });
  };

  const handleCategoryAction = async (action) => {
    // Create the category data object similar to eventEditor structure
    const categoryData = {
      name,
      color
    };

    if (action === 'update' || action === 'delete') {
      categoryData._id = id;
    }

    try {
      const response = await fetch('/api/schedule/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          content: categoryData
        }),
      });
      
      const data = await response.json();
      alert(`Category ${action}d successfully`);
      resetForm();
      fetchCategories(); // Refresh the category list
    } catch (error) {
      alert(`Error ${action}ing category: ${error.message}`);
    }
  };

  const selectCategoryForEdit = (category) => {
    setIsEditing(true);
    setSelectedCategory(category);
    setId(category._id);
    setName(category.name);
    setColor(category.color);
  };

  const resetForm = () => {
    setName("");
    setColor("#ffffff");
    setId(null);
    setIsEditing(false);
    setSelectedCategory(null);
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="category-section">
      <h2>{isEditing ? 'Edit Category' : 'Add Category'}</h2>
      
      <div className="category-form">
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Color:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        
        <div className="form-actions">
          {isEditing ? (
            <>
              <button onClick={() => handleCategoryAction('update')}>Update Category</button>
              <button onClick={() => handleCategoryAction('delete')} className="delete-btn">Delete Category</button>
              <button onClick={resetForm}>Cancel</button>
            </>
          ) : (
            <button onClick={() => handleCategoryAction('add')}>Add Category</button>
          )}
        </div>
      </div>

      <h3>Available Categories</h3>
      {categories.length > 0 ? (
        <div className="categories-list">
          {categories.map((category) => (
            <div 
              key={category._id} 
              className="category-item" 
              onClick={() => selectCategoryForEdit(category)}
              style={{ borderLeft: `4px solid ${category.color}` }}
            >
              <h4>{category.name}</h4>
              <div className="color-preview" style={{ backgroundColor: category.color }}></div>
            </div>
          ))}
        </div>
      ) : (
        <p>No categories available.</p>
      )}
    </div>
  );
};

export default CategoryEditor;
