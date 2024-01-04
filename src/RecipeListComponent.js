import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RecipeListComponent.css';

const RecipeListComponent = ({ fridgeItems, kitchenBasics }) => {
    const [mealDBRecipes, setMealDBRecipes] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const hobbitArr = [{
            "title": "looks like meats back on the menu, boys",
            "ingredients": [
                "2 hobbits"
            ],
            "instructions": "Boil em\nMash um\nStick um in a stew"
    }];

    function replaceSpacesWithUnderscores(strings) {
        return strings.map(string => string.replace(/\s+/g, '_'));
      }

    useEffect(() => {
        if (fridgeItems.length === 0) return;

        if (fridgeItems.includes("human meat")){
            setRecipes(hobbitArr);
            return;
        }

        const callMealDB = async () => {
            const newFridgeItems = replaceSpacesWithUnderscores(fridgeItems);
            let mealDetails = [];
        
            try {
                const response = await axios.get(
                    'http://www.themealdb.com/api/json/v2/1/filter.php?i=' + newFridgeItems[0],
                );
                const mealIDs = parseMealRecipes(response);
                mealDetails = await fetchMealDetails(mealIDs);
        
                // Corrected usage of filter
                const meals = mealDetails.filter(item => item.title !== "delete");
    
                setMealDBRecipes(meals);
            } catch (error) {
                console.error('Error fetching meal details:', error);
            }
        };

        const callMealDBMult = async () => {
            const newFridgeItems = replaceSpacesWithUnderscores(fridgeItems);
            let mealDetails = [];
        
            try {
                const response = await axios.get(
                    'http://www.themealdb.com/api/json/v2/1/filter.php?i=' + newFridgeItems.join(","),
                );
                const mealIDs = parseMealRecipes(response);
                mealDetails = await fetchMealDetails(mealIDs);
        
                // Corrected usage of filter
                const meals = mealDetails.filter(item => item.title !== "delete");
    
                setMealDBRecipes(meals);
            } catch (error) {
                console.error('Error fetching meal details:', error);
            }
        };

        const fetchMealDetails = async (mealIds) => {
            try {
                const mealDetailsPromises = mealIds.map(id => 
                    axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
                );
                const mealDetailsResponses = await Promise.all(mealDetailsPromises);
                const meals = mealDetailsResponses.map(response => response.data.meals[0]);
        
                return meals.map(meal => {
                    const ingredients = [];
        
                    // Extract ingredients and their measurements
                    for(let i = 1; i <= 20; i++) {
                        if(meal[`strIngredient${i}`]) {
                            ingredients.push(`${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}`);
                        }
                    }
                    const combinedItems = kitchenBasics.concat(fridgeItems);
                    const elementsNotInArray = ingredients.filter(item => !combinedItems.includes(item));

                    if (elementsNotInArray.length > 3) {
                        return {
                            title: "delete"
                        };
                    }
                    return {
                        title: meal.strMeal,
                        ingredients: ingredients,
                        instructions: meal.strInstructions.split(/\r\n|\r|\n/).filter(line => line.trim() !== ''), // Split instructions by new lines and remove empty lines
                        thumbnail: meal.strMealThumb, // Thumbnail URL
                    };
                });
            } catch (error) {
                console.error('Error fetching meal details:', error);
                return [];
            }
        };

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
                                content: 'Please generate no more than 5 recipes given these ingredients: ' + fridgeItems.join(", ") + kitchenBasics,
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

        callMealDB();
        callMealDBMult();
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
    
    const parseMealRecipes = (response) => {
        const meals = response.data.meals;
        const mealIds = meals.map(meal => meal.idMeal);
        return mealIds;
    }    

    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <div className="recipe-list">
            {mealDBRecipes.map((recipe, index) => (
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
