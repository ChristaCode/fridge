// Node.js Express server
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors()); // Enable CORS for all origins
app.use(express.json());

const path = require('path');

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


const hobbitArr = [{
    "title": "",
    "ingredients": [
        ""
    ],
    "instructions": ""
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

            if (elementsNotInArray.length > 5) {
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

app.get('/', (req, res) => {
    res.send('Hello World!');
  });

app.post('/api/recipes/flax', async (req, res) => {
    async function query(data) {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/flax-community/t5-recipe-generation",
            {
                headers: { Authorization: "Bearer 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" },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    }
    
    const { fridgeItems, kitchenBasics } = req.body;
    const combined = fridgeItems.join(", ") + kitchenBasics.join(", ")

    query({"inputs": combined}).then((response) => {
        console.log(JSON.stringify(response));
    });
});

app.post('/api/recipes/huggingface', async (req, res) => {
    console.log('Received a request at /api/recipes/huggingface');
    const { fridgeItems, kitchenBasics } = req.body;

    async function query(data) {
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/meta-llama/Llama-2-70b-chat-hf",
                data,
                {
                    headers: { 
                        Authorization: "Bearer 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",
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
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
        console.log("generatedText")
        console.log(response[0])
        if (response) {
            const llamaRecipes = parseLlamaRecipes(response[0].generated_text);
            res.json({ recipes: llamaRecipes });
        } else {
            res.json({ recipes: [] });
        }
    } catch (error) {
        // Error already logged and response sent in the query function
    }
});

app.post('/api/recipes/mealdb', async (req, res) => {
    // Extracting fridgeItems from the request body
    const { fridgeItems } = req.body;

    // Assuming replaceSpacesWithUnderscores is a correctly defined function
    const newFridgeItems = replaceSpacesWithUnderscores(fridgeItems);
    let mealDetails = [];

    try {
        // Fetching meal IDs based on ingredients
        const response = await axios.get(`http://www.themealdb.com/api/json/v2/1/filter.php?i=${newFridgeItems.join(",")}`);
    
        // Assuming parseMealRecipes is a correctly defined function
        const mealIDs = parseMealRecipes(response.data); // Ensure you are passing the correct data to the function
        mealDetails = await fetchMealDetails(mealIDs, newFridgeItems, req.kitchenBasics);

        // Filter out meals marked for deletion
        const meals = mealDetails.filter(item => item.title !== "delete");

        res.json({ recipes: meals });
    } catch (error) {
        console.error('Error fetching meal details:', error);
    }
});

app.post('/api/recipes/openai', async (req, res) => {
    // Extracting fridgeItems and kitchenBasics from the request body
    const { fridgeItems, kitchenBasics } = req.body;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo-1106',
                messages: [
                    {
                        role: 'user',
                        content: `Please generate recipes given these ingredients: ${fridgeItems.join(", ")} ${kitchenBasics}`,
                    }
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,  // Using environment variable for API key
                },
            }
        );

        // Assuming parseRecipes is a correctly defined function
        const recipesData = parseRecipes(response.data.choices[0].message.content.trim());
        res.json({ recipes: recipesData });
    } catch (error) {
        console.error('Error calling GPT API:', error);
    }
});
