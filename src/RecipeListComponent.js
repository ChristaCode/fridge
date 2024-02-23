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

const RecipeListComponent = ({ llamaRecipes, isLoading }) => {
  useEffect(() => {
    if (llamaRecipes) {
      llamaRecipes.forEach(recipe => storeRecipesToDB(recipe.title, recipe.ingredients, recipe.instructions));
    }
  }, [llamaRecipes]);

  return (
    <div className="recipe-list">
      {llamaRecipes && llamaRecipes.map((recipe, index) => (
        <div key={index} className="recipe-card">
          <h2 className="recipe-title">{recipe.title}</h2>
          <h3>Ingredients:</h3>
          <ul>
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
          <h3>Instructions:</h3>
          <ol>
            {recipe.instructions.map((instruction, i) => (
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
