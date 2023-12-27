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
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'user',
                                content: 'please generate recipes given these ingredients, only assume that the person has basic condiments like salt and pepper: ' + fridgeItems.join(", "),
                            }
                        ],
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer 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', // Use the API key from environment variables
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
        const recipeSections = responseString.split(/\d+\.\s/).slice(1); 
        return recipeSections.map(section => {
            const [title, ...rest] = section.split('\n\n');
            return { title, content: rest.join('\n\n') };
        });
    };

    if (isLoading) {
        return <div>Loading recipes...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="recipe-list">
            {recipes.map((recipe, index) => (
                <div key={index} className="recipe-card">
                    <h3 className="recipe-title">{recipe.title}</h3>
                    <p className="recipe-content">{recipe.content}</p>
                </div>
            ))}
        </div>
    );
};

export default RecipeListComponent;
