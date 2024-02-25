// Node.js Express server
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const pool = require('./db');

const app = express();
const NodeCache = require('node-cache');

const secondsInAMonth = 30 * 24 * 60 * 60;
const twoMonthsInSeconds = 2 * secondsInAMonth;
const myCache = new NodeCache({ stdTTL: twoMonthsInSeconds, checkperiod: 120 });

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors());
app.use(express.json());

const path = require('path');

app.use(express.static(path.join(__dirname, 'build')));

app.get('/ingredients', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM ingredients');
    res.json(rows);
  });

app.get('/recipes', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM recipes');
    res.json(rows);
});

app.post('/recipes', async (req, res) => {
    try {
      const { title, ingredients, instructions, timestamp } = req.body;
      
      await pool.query('BEGIN');
      
      const ingredientsString = JSON.stringify(ingredients);
      const instructionsString = JSON.stringify(instructions);
      
      const recipeResult = await pool.query(
        'INSERT INTO recipes (title, ingredients, instructions, created_at) VALUES ($1, $2, $3, $4) RETURNING recipe_id',
        [title, ingredientsString, instructionsString, timestamp]
      );
      const recipeId = recipeResult.rows[0].recipe_id;
      
      for (const ingredientName of ingredients) {
        const ingredientId = await getOrInsertIngredient(ingredientName);
        
        await pool.query(
          'INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES ($1, $2)',
          [recipeId, ingredientId]
        );
      }
      await pool.query('COMMIT');
      
      res.json({ recipeId: recipeId });
    } catch (err) {
      await pool.query('ROLLBACK');
      
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

async function getOrInsertIngredient(ingredientName) {
    let result = await pool.query(
        'SELECT ingredient_id FROM ingredients WHERE name = $1',
        [ingredientName]
    );

    if (result.rows.length === 0) {
        result = await pool.query(
        'INSERT INTO ingredients (name) VALUES ($1) RETURNING ingredient_id',
        [ingredientName]
        );
    }

    return result.rows[0].ingredient_id;
}
  
app.get('/recipes/search', async (req, res) => {
    try {
      const ingredientNames = req.query.ingredients.split(',');
  
      const recipes = await pool.query(
        `SELECT DISTINCT r.recipe_id, r.title, r.ingredients, r.instructions, r.created_at
         FROM recipes r
         JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
         JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
         WHERE i.name = ANY($1)
         ORDER BY r.title;`,
        [ingredientNames]
      );
  
      res.json(recipes.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
});
  
app.get('/users', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
});

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
        const titleMatch = section.match(/(?<=[1].|Title:|[1]. Title:)\s*(.*?)\s*,\s*(?!Ingredients:)/g);
        const title = titleMatch ? titleMatch[0].trim() : 'Unknown Title';

        // Extract the ingredients
        const ingredientsMatch = section.match(/(?<=Ingredients:)(([\s\S]*?)(?=Instructions))/);
        const ingredients = ingredientsMatch ? ingredientsMatch[1].trim().split(',').map(ingredient => ingredient.trim()) : [];

        // Extract the instructions
        const instructionsMatch = section.match(/Instructions:\n([\s\S]*?)$/);
        const instructions = instructionsMatch ? instructionsMatch[1].trim().split('\n').map(step => step.trim()) : [];

        return { title, ingredients, instructions };
    });

    return recipes;
};

app.post('/api/recipes/huggingface', async (req, res) => {
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
            "inputs": "generate only 2 recipes given these ingredients. The recipe must contain  exclusively ONLY the ingredients given DO NOT ADD ANY OTHER INGREDIENTS BESIDES THE INGREDIENTS PROVIDED please. Prioritize gastronomically synergistic ingredients to maximize tastiness of the recipes. The recipes must be meals, snacks, or desserts. Prioritize the most popular recipes people enjoy. Respond with only the recipes. " + fridgeItems.join(", ") + kitchenBasics + " Return in the format Title: 'Recipe Title', Ingredients: (List of ingredients), Instructions: (Numbered List of Instructions) followed by " + hobbitArr + " At the end of each recipe, print the word 'END'.",
        };

        const response = await query(inputData);
        if (response) {
            const llamaRecipes = parseLlamaRecipes(response[0].generated_text);
            res.json({ recipes: llamaRecipes });
        } else {
            res.json({ recipes: [] });
        }
    } catch (error) {
        res.status(500).send('Error processing request');
    }
});
