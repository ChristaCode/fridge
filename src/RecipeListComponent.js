import React from 'react';
import './RecipeListComponent.css';

const RecipeListComponent = ({ llamaRecipes, isLoading }) => {    
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
                    {isLoading === true && (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                        </div>
                    )}
        </div>
    );
};

export default RecipeListComponent;
