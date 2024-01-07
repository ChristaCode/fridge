// Node.js Express server
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const NodeCache = require('node-cache');

const secondsInAMonth = 30 * 24 * 60 * 60;
const twoMonthsInSeconds = 2 * secondsInAMonth;
const myCache = new NodeCache({ stdTTL: twoMonthsInSeconds, checkperiod: 120 });

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors()); // Enable CORS for all origins
app.use(express.json());

const path = require('path');

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  const hobbitArr = [{
    "title": "Baked Garlic Parmesan Chicken",
    "ingredients": [
        "4 chicken thighs",
        "1 tsp salt"
    ],
    "instructions": [
        "1. Preheat the oven to 375°F.",
        "2. Coat each chicken thigh in the flour mixture and place on a greased baking sheet."
    ]
    },
    {
        "title": "Baked Garlic Parmesan Chicken",
        "ingredients": [
            "4 chicken thighs",
            "1 tsp salt"
        ],
        "instructions": [
            "1. Preheat the oven to 375°F.",
            "2. Coat each chicken thigh in the flour mixture and place on a greased baking sheet."
        ]
    }];

function replaceSpacesWithUnderscores(strings) {
    return strings.map(string => string.replace(/\s+/g, '_'));
  }

const parseLlamaRecipes = (text) => {
    const titleRegex = /Title: ([^\n]*)/;
    const ingredientsRegex = /Ingredients:([\s\S]*?)(?=\n\n[^\n]+:|\n*$)/;
    const instructionsRegex = /Instructions:([\s\S]*?)\n(?=\n|$)/;

    const titleMatch = text.match(titleRegex);
    const ingredientsMatch = text.match(ingredientsRegex);
    const instructionsMatch = text.match(instructionsRegex);

    return {
        title: titleMatch ? titleMatch[1].trim() : null,
        ingredients: ingredientsMatch ? ingredientsMatch[1].trim().split('\n') : [],
        instructions: instructionsMatch ? instructionsMatch[1].trim().split('\n') : [],
    };
};

function capitalizeWords(string) {
    if (typeof string !== 'string' || !string) {
        console.error('Invalid input for capitalizeWords:', string);
        return ''; // Return an empty string or handle this case as appropriate
    }

    return string.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}


function parseFlaxRecipe(recipeString) {
    if (!recipeString) {
        console.error('Invalid recipe string');
        return null; // or handle this case as appropriate
    }

    let recipe = {};

    // Splitting the string into title, ingredients, and directions parts
    const parts = recipeString.split(/ ingredients: | directions: /);
    if (parts.length < 3) {
        console.error('Recipe string does not have the expected format');
        return null; // or handle this case as appropriate
    }

    // Extracting and capitalizing the title
    recipe.title = capitalizeWords(parts[0].split('title: ')[1].trim());

    // Processing ingredients
    const ingredientsList = parts[1].split(' ');
    let ingredients = {};
    for (let i = 0; i < ingredientsList.length; i += 3) {
        let ingredient = ingredientsList[i + 2];
        let quantity = ingredientsList[i] + ' ' + ingredientsList[i + 1];

        // Handling multi-word ingredient names
        while (i + 3 < ingredientsList.length && !ingredientsList[i + 3].match(/^\d/)) {
            i++;
            ingredient += ' ' + ingredientsList[i + 2];
        }

        // Capitalize first word of ingredient
        ingredient = capitalizeWords(ingredient);

        ingredients[ingredient] = quantity;
    }
    recipe.ingredients = ingredients;

    // Processing and capitalizing directions
    recipe.directions = parts[2].split('. ').map(direction => capitalizeWords(direction.trim()) + '.');

    // Processing and capitalizing instructions
    recipe.instructions = parts[2].split('. ').map(instruction => capitalizeWords(instruction.trim()) + '.');

    return {
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
    };
}


const fetchMealDetails = async (mealIds, newFridgeItems, kitchenBasics) => {
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
            const combinedItems = kitchenBasics.concat(newFridgeItems);
            const elementsNotInArray = ingredients.filter(ingredient => {
                // Convert ingredient to lowercase for case-insensitive comparison
                const lowerIngredient = ingredient.toLowerCase();
                // Check if the ingredient is not part of any item in the combinedItems
                return !combinedItems.some(item => lowerIngredient.includes(item));
            });

            if (elementsNotInArray.length > 1) {
                return {
                    title: "delete"
                };
            }
            return {
                title: meal.strMeal,
                ingredients: ingredients,
                elementsNotInArray, // include this to track which items are not in the array
                instructions: meal.strInstructions.split(/\r\n|\r|\n/).filter(line => line.trim() !== ''), // Split instructions by new lines and remove empty lines
                thumbnail: meal.strMealThumb, // Thumbnail URL
            };
        });
    } catch (error) {
        console.error('Error fetching meal details:', error);
        return [];
    }
};

function parseRecipes(text) {
    const recipes = [];
    let currentRecipe = { title: '', ingredients: [], instructions: [] };
    let isCollectingIngredients = true;

    text.split('\n').forEach(line => {
        if (line.match(/^\d+\.\s+.+/)) {
            // New recipe starts
            if (currentRecipe.title) {
                recipes.push(currentRecipe);
            }
            currentRecipe = { title: line.trim(), ingredients: [], instructions: [] };
            isCollectingIngredients = true;
        } else if (line.trim() && currentRecipe) {
            if (isCollectingIngredients) {
                if (line.match(/^\d+\./)) {
                    // Start of instructions
                    isCollectingIngredients = false;
                    currentRecipe.instructions.push(line.trim());
                } else {
                    // Ingredient line
                    currentRecipe.ingredients.push(line.trim());
                }
            } else {
                // Continuation of instructions
                currentRecipe.instructions.push(line.trim());
            }
        }
    });

    // Add the last recipe if it exists
    if (currentRecipe.title) {
        recipes.push(currentRecipe);
    }
    console.log(recipes);
    return recipes;
}


// const parseRecipes = (responseString) => {
//     const recipes = [];
//     const recipeSections = responseString.split(/Recipe \d+:/);

//     recipeSections.forEach((section) => {
//         if (section.trim() === '') return;

//         const titleAndRest = section.split('\n\n');
//         const title = titleAndRest[0].trim();
//         const rest = titleAndRest.slice(1).join('\n\n');

//         const ingredientsLabelIndex = rest.indexOf('Ingredients');
//         const instructionsLabelIndex = rest.indexOf('Instructions');

//         if (ingredientsLabelIndex === -1 || instructionsLabelIndex === -1) {
//             // If we don't have both ingredients and instructions, skip this section.
//             return;
//         }

//         const ingredientsText = rest.substring(
//             ingredientsLabelIndex + 'Ingredients:'.length,
//             instructionsLabelIndex
//         );

//         const instructionsText = rest.substring(
//             instructionsLabelIndex + 'Instructions:'.length
//         );

//         // Split ingredients by newline and filter out any empty lines.
//         const ingredients = ingredientsText
//             .split('\n')
//             .filter((line) => line.trim() !== '')
//             .map((ingredient) => ingredient.trim().replace(/^- /, '')); // Remove bullet points.

//         // Split instructions by newline and filter out any empty lines.
//         const instructions = instructionsText
//             .split('\n')
//             .filter((line) => line.trim() !== '')
//             .join('\n'); // Rejoin to keep formatting for display.

//         recipes.push({
//             title,
//             ingredients,
//             instructions,
//         });
//     });

//     return recipes;
// };

const parseMealRecipes = (response) => {
    const meals = response.data.meals;
    const mealIds = meals.map(meal => meal.idMeal);
    return mealIds;
}

app.post('/api/recipes/flax', async (req, res) => {
    async function query(data) {
        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/flax-community/t5-recipe-generation",
                {
                    headers: { 
                        "Authorization": "Bearer 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", 
                        "Content-Type": "application/json" 
                    },
                    method: "POST",
                    body: JSON.stringify(data),
                }
            );
            if (!response.ok) {
                console.log(response.status)
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error during FLAX API call:', error);
            throw new Error('FLAX API error');
        }
    }

    const { fridgeItemsForFlax, kitchenBasicsForFlax } = req.body;
    const combined = fridgeItemsForFlax.join(", ") + ", " + kitchenBasicsForFlax.join(", ");
    const cacheKey = `flax-recipes-${JSON.stringify({ fridgeItemsForFlax, kitchenBasicsForFlax })}`;

    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
        return res.json({ recipes: cachedData });
    }

    try {
        const response = await query({"inputs": combined});
        if (response) {
            const parsedResponse = parseFlaxRecipe(response[0]?.generated_text)
            console.log(response)
            myCache.set(cacheKey, parsedResponse);
            return res.json({ recipes: parsedResponse });
        } else {
            return res.json({ recipes: [] });
        }
    } catch (error) {
        console.error('Error during Flax API call:', error);
        return res.status(500).send('Error processing request');
    }
});

app.post('/api/recipes/huggingface', async (req, res) => {
    console.log('Received a request at /api/recipes/huggingface');
    const { fridgeItems, kitchenBasics } = req.body;

    async function query(data) {
        const requestData = {
            ...data,
            parameters: {
                max_new_tokens: 1000
            }
        };
        const body = JSON.stringify(requestData);
        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/meta-llama/Llama-2-70b-chat-hf",
                {
                    headers: { 
                        "Authorization": "Bearer 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", 
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: body,
                }
            );
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error during Hugging Face API call:', error);
            res.status(500).send('Error processing request');
            throw new Error('Hugging Face API error');
        }
    }

    try {
        const inputData = {
            "inputs": "generate a recipe given these ingredients " + fridgeItems.join(", ") + kitchenBasics + " Return the title, followed by the ingredients, followed by the instructions."
        };

        const response = await query(inputData);
        console.log('free 70B', response);
        console.log(response);
        if (response) {
            console.log('llama respones before parsing');
            const llamaRecipes = parseLlamaRecipes(response[0].generated_text);
            res.json({ recipes: llamaRecipes });
        } else {
            res.json({ recipes: [] });
        }
    } catch (error) {
        res.status(500).send('Error processing request');
        // Error already logged and response sent in the query function
    }
});

app.post('/api/recipes/mealdb', async (req, res) => {
    // Extracting fridgeItems from the request body
    const { fridgeItems } = req.body;
    const newFridgeItems = replaceSpacesWithUnderscores(fridgeItems);
    const cacheKey = newFridgeItems.join(",");

    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
        return res.json({ recipes: cachedData });
    }

    let mealDetails = [];

    try {
        // Fetching meal IDs based on ingredients
        const response = await axios.get(`http://www.themealdb.com/api/json/v2/1/filter.php?i=${newFridgeItems[0]}`);
    
        // Assuming parseMealRecipes is a correctly defined function
        const mealIDs = parseMealRecipes(response.data); // Ensure you are passing the correct data to the function
        mealDetails = await fetchMealDetails(mealIDs, newFridgeItems, req.kitchenBasics);

        // Filter out meals marked for deletion
        const meals = mealDetails.filter(item => item.title !== "delete");
        myCache.set(cacheKey, meals);

        res.json({ recipes: meals });
    } catch (error) {
        res.status(500).send('Error processing request');
        console.error('Error fetching meal details:', error);
    }
});

app.post('/api/recipes/openai', async (req, res) => {
    // Extracting fridgeItems and kitchenBasics from the request body
    const { fridgeItems, kitchenBasics } = req.body;
    const cacheKey = `openai-recipes-${JSON.stringify({ fridgeItems, kitchenBasics })}`;

    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
        return res.json({ recipes: cachedData });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo-1106',
                messages: [
                    {
                        role: 'user',
                        content: `Please generate recipes given these ingredients: ${fridgeItems.join(", ")} ${kitchenBasics.join(", ")}. Return each recipe in the format of ${hobbitArr}}.`,
                    }
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer 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`,  // Using environment variable for API key
                },
            }
        );

        // Assuming parseRecipes is a correctly defined function
        const recipesData = parseRecipes(response.data.choices[0].message.content.trim());
        myCache.set(cacheKey, recipesData);

        console.log('gpt response');
        console.log(recipesData)
        res.json({ recipes: recipesData });
    } catch (error) {
        res.status(500).send('Error processing request');
        console.error('Error calling GPT API:', error);
    }
});
