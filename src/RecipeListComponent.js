import React, { useEffect } from 'react';
import './RecipeListComponent.css';
import axios from 'axios';

const storeRecipesToDB = async (title, ingredients, instructions) => {
  try {
    const timestamp = new Date().toISOString();
    await axios.post('/recipes', { title, ingredients, instructions, timestamp });
  } catch (error) {
    console.error('Error posting data: ', error);
  }
};

const safeTitle = (title) => {
    if (typeof title === 'string') {
      return title.replace(/,+\s*$/, '');
    }
    // Handle cases where title is not a string (could log or handle differently based on needs)
    console.error('Expected title to be a string, but received:', typeof title);
    return ''; // Return a fallback string or handle as needed
  };

const safeParseJson = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const RecipeListComponent = ({ llamaRecipes, isLoading }) => {
  useEffect(() => {
    if (llamaRecipes) {
      llamaRecipes.forEach(recipe => storeRecipesToDB(recipe.title, recipe.ingredients, recipe.instructions));
    }
  }, [llamaRecipes]);

  console.log('llamaRecipes in RecipeListComponent', llamaRecipes);

  return (
    <div className="recipe-list">
      {llamaRecipes && llamaRecipes.map((recipe, index) => (
        <div key={index} className="recipe-card">
          <h2 className="recipe-title">{safeTitle(recipe.title)}</h2>
          <h3>Ingredients:</h3>
          <ul>
            {console.log("recipe.ingredients", recipe.ingredients)}
            {(Array.isArray(recipe.ingredients) ? recipe.ingredients : safeParseJson(recipe.ingredients)).map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
          <h3>Instructions:</h3>
          <ol>
            {(Array.isArray(recipe.instructions) ? recipe.instructions : safeParseJson(recipe.instructions)).map((instruction, i) => (
              <li key={i}>{instruction}</li>
            ))}
          </ol>
        </div>
      ))}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default RecipeListComponent;
