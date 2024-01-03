import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RecipeListComponent.css';

const RecipeListComponent = ({ fridgeItems }) => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (fridgeItems.length === 0) return;

        const callGPT = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: 'gpt-4',
                        messages: [
                            {
                                role: 'user',
                                content: 'Please generate no more than 5 recipes given these ingredients, only assume that the person has basic condiments like salt and pepper: ' + fridgeItems.join(", "),
                            }
                        ],
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer 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',  // Use the API key from environment variables
                        },
                    }
                );

                const recipesData = parseRecipes(response.data.choices[0].message.content.trim());
                setRecipes(recipesData);
            } catch (error) {
                console.error('Error calling GPT API:', error);
                setError('Failed to load recipes. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        callGPT();
    }, [fridgeItems]);

    const parseRecipes = (responseString) => {
        const recipes = [];
        const recipeSections = responseString.split(/Recipe \d+:/);
    
        recipeSections.forEach((section) => {
            if (section.trim() === '') return;
    
            const titleAndRest = section.split('\n\n');
            const title = titleAndRest[0].trim();
            const rest = titleAndRest.slice(1).join('\n\n');
    
            const ingredientsLabelIndex = rest.indexOf('Ingredients');
            const instructionsLabelIndex = rest.indexOf('Instructions');
    
            if (ingredientsLabelIndex === -1 || instructionsLabelIndex === -1) {
                // If we don't have both ingredients and instructions, skip this section.
                return;
            }
    
            const ingredientsText = rest.substring(
                ingredientsLabelIndex + 'Ingredients:'.length,
                instructionsLabelIndex
            );
    
            const instructionsText = rest.substring(
                instructionsLabelIndex + 'Instructions:'.length
            );
    
            // Split ingredients by newline and filter out any empty lines.
            const ingredients = ingredientsText
                .split('\n')
                .filter((line) => line.trim() !== '')
                .map((ingredient) => ingredient.trim().replace(/^- /, '')); // Remove bullet points.
    
            // Split instructions by newline and filter out any empty lines.
            const instructions = instructionsText
                .split('\n')
                .filter((line) => line.trim() !== '')
                .join('\n'); // Rejoin to keep formatting for display.
    
            recipes.push({
                title,
                ingredients,
                instructions,
            });
        });
    
        return recipes;
    };
    

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <div className="recipe-list">
            {recipes.map((recipe, index) => (
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
