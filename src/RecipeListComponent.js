import React from 'react';
import './RecipeListComponent.css';

const RecipeListComponent = ({ llamaRecipes, mealDBRecipes, flaxRecipes, gptRecipes, isLoading, doneAllLoading }) => {    
    return (
        <div className="recipe-list">
            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <>
                    {llamaRecipes && llamaRecipes.ingredients && (
                        <div className="recipe-card">
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
                    {mealDBRecipes && mealDBRecipes.map((recipe, index) => (
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
                    {flaxRecipes && flaxRecipes.recipes && (
                        <div className="recipe-card">
                            <h2 className="recipe-title">{flaxRecipes.recipes.title}</h2>
                            <h3>Ingredients:</h3>
                            <ul>
                                {Object.entries(flaxRecipes.recipes.ingredients).map(([ingredient, quantity], i) => (
                                    <li key={i}>{`${ingredient}: ${quantity}`}</li>
                                ))}
                            </ul>
                            <h3>Instructions:</h3>
                            <ol>
                                {flaxRecipes.recipes.instructions.map((instruction, i) => (
                                    <li key={i}>{instruction}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                    {doneAllLoading && (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RecipeListComponent;
