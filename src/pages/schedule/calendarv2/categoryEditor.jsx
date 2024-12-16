import React, { useState, useEffect } from "react";

const CategoryEditor = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", color: "#ffffff" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the categories from the API
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
  }, []);

  const updateCategory = (id, name, color) => {
    fetch(`/api/schedule/categories/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: id,
        name,
        color,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(`Category updated: ${data.message}`);
        // Optionally refresh the category list
        setCategories((prev) =>
          prev.map((category) =>
            category._id === id ? { ...category, name, color } : category
          )
        );
      })
      .catch((error) => {
        alert("Error updating category:", error);
      });
  };

  const createCategory = () => {
    fetch(`/api/schedule/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCategory),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Category created successfully");
        setCategories([...categories, { ...newCategory, _id: data.upsertedId }]);
        setNewCategory({ name: "", color: "#ffffff" });
      })
      .catch((error) => {
        alert("Error creating category:", error);
      });
  };

  const handleInputChange = (id, field, value) => {
    setCategories((prev) =>
      prev.map((category) =>
        category._id === id ? { ...category, [field]: value } : category
      )
    );
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="category-section">
      <h2>Edit Categories</h2>
      {categories.map((category) => (
        <div key={category._id} className="category-item">
          <label>
            Name:
            <input
              type="text"
              value={category.name}
              onChange={(e) =>
                handleInputChange(category._id, "name", e.target.value)
              }
            />
          </label>
          <label>
            Color:
            <input
              type="color"
              value={category.color}
              onChange={(e) =>
                handleInputChange(category._id, "color", e.target.value)
              }
            />
          </label>
          <button
            onClick={() =>
              updateCategory(category._id, category.name, category.color)
            }
          >
            Update Category
          </button>
        </div>
      ))}
      <div className="new-category">
        <h3>Create New Category</h3>
        <label>
          Name:
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
          />
        </label>
        <label>
          Color:
          <input
            type="color"
            value={newCategory.color}
            onChange={(e) =>
              setNewCategory({ ...newCategory, color: e.target.value })
            }
          />
        </label>
        <button onClick={createCategory}>Create Category</button>
      </div>
    </div>
  );
};

export default CategoryEditor;
