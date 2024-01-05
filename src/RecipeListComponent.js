import React, { useEffect, useState } from 'react';
import './RecipeListComponent.css';

const RecipeListComponent = ({ llamaRecipes, mealDBRecipes, recipes, isLoading }) => {    
    return (
        <div className="recipe-list">
            {llamaRecipes !== null &&
            (<div className="recipe-card">
                <h2 className="recipe-title">{llamaRecipes.title}</h2>
                <h3>Ingredients:</h3>
                <ul>
                    {llamaRecipes.ingredients.map((ingredient, i) => (
                        <li key={i}>{ingredient}</li>
                    ))}
                </ul>
                <h3>Instructions:</h3>
                <ol>
                    {llamaRecipes.instructions.map((instruction, i) => (
                        <li key={i}>{instruction}</li>
                    ))}
                </ol>
            </div>
            )}
            {mealDBRecipes.map((recipe, index) => (
            <div key={index} className="recipe-card">
                <h2 className="recipe-title">{recipe.title}</h2>
                <h3>Ingredients:</h3>
                <ul>
                    {recipe.ingredients.map((ingredient, i) => (
                        <li key={i} className={recipe.elementsNotInArray.includes(ingredient) ? 'red-text' : ''}>
                            {ingredient}
                        </li>
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
            {isLoading ?
                (<div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>) : recipes.map((recipe, index) => (
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
                        {recipe.instructions.split('\n').map((instruction, i) => (
                            <li key={i}>{instruction}</li>
                        ))}
                    </ol>
                </div>
            ))}
        </div>
    );
};

export default RecipeListComponent;
