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

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  const hobbitArr = [{
    "title": ["Baked Garlic Parmesan Chicken"],
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
    "title": ["Baked Garlic Parmesan Chicken"],
    "ingredients": [
        "4 chicken thighs",
        "1 tsp salt"
    ],
    "instructions": [
        "1. Preheat the oven to 375°F.",
        "2. Coat each chicken thigh in the flour mixture and place on a greased baking sheet."
    ]
    }];

const parseLlamaRecipes = (text) => {
        // Split the text into individual recipes using 'END' as a delimiter
        const recipeSections = text.split('END\n').filter(section => section.trim());

        const recipes = recipeSections.map(section => {
        // Extract the title
        const titleMatch = section.match(/^Title:\s*(.*?)\s*$/m);
        const title = titleMatch ? titleMatch[1].trim() : 'Unknown Title';

        // Extract the ingredients
        const ingredientsMatch = section.match(/Ingredients:\n([\s\S]*?)\n\n/);
        const ingredients = ingredientsMatch ? ingredientsMatch[1].split('\n').map(ingredient => ingredient.trim()) : [];

        // Extract the instructions
        const instructionsMatch = section.match(/Instructions:\n([\s\S]*?)$/);
        const instructions = instructionsMatch ? instructionsMatch[1].trim().split('\n').map(step => step.trim()) : [];

        return { title, ingredients, instructions };
    });

    return recipes;
};

app.post('/api/recipes/huggingface', async (req, res) => {
    console.log('Received a request at /api/recipes/huggingface');
    const { fridgeItems, kitchenBasics } = req.body;
    const cacheKey = fridgeItems.join(",") + "," + kitchenBasics.join(",");

    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
        return res.json({ recipes: cachedData });
    }

    async function query(data) {
        const requestData = {
            ...data,
            parameters: {
                max_new_tokens: 4000
            }
        };
        const body = JSON.stringify(requestData);
        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
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
            console.log('7b response');
            console.log(result);
            return result;
        } catch (error) {
            console.error('Error during Hugging Face API call:', error);
            res.status(500).send('Error processing request');
            throw new Error('Hugging Face API error');
        }
    }

    try {
        const inputData = {
            "inputs": "generate only 2 recipes given these ingredients. Respond with only the recipes. " + fridgeItems.join(", ") + kitchenBasics + " Return in the format Title: followed by the title, Ingredients: followed by the ingredients list, Instructions: followed by the numbered instructions in this format. " + hobbitArr + " At the end of each recipe, say 'END'.",
        };

        const response = await query(inputData);
        console.log('free 70B', response);
        console.log(response);
        if (response) {
            console.log('llama respones before parsing');
            const llamaRecipes = parseLlamaRecipes(response[0].generated_text);
            
            console.log('parsed llamaRecipes');
            console.log(llamaRecipes);

            res.json({ recipes: llamaRecipes });
        } else {
            res.json({ recipes: [] });
        }
    } catch (error) {
        res.status(500).send('Error processing request');
        // Error already logged and response sent in the query function
    }
});

