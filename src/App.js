import React, { useState } from 'react';
import InputComponent from './InputComponent';
import RecipeListComponent from './RecipeListComponent';
import './App.css';
import logo from './feastFinderLogo.png';
import axios from 'axios';

const App = () => {
    const [fridgeItems, setFridgeItems] = useState([]);
    const [fridgeItemsForFlax, setFridgeItemsForFlax] = useState([]);

    const [kitchenBasics, setKitchenBasics] = useState(["salt", "pepper", "flour", "baking soda", "olive oil", "sugar", "mayonnaise", "ketchup", "garlic", "onion"]);
    const [kitchenBasicsForFlax, setKitchenBasicsForFlax] = useState(["salt", "pepper", "flour", "baking soda", "olive oil", "sugar", "mayonnaise", "ketchup", "garlic", "onion"]);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [llamaRecipes, setLlamaRecipes] = useState(null);
    const [mealDBRecipes, setMealDBRecipes] = useState([]);

    const [flaxRecipes, setFlaxRecipes] = useState([]);
    const [flaxRecipesTwo, setFlaxRecipesTwo] = useState([]);
    const [flaxRecipesThree, setFlaxRecipesThree] = useState([]);
    const [flaxRecipesFour, setFlaxRecipesFour] = useState([]);

    const [gptRecipes, setGPTRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiCounter, setApiCounter] = useState(false);

    const hobbitArr = [{
        "title": "Looks like meats back on the menu, boys",
        "ingredients": [
            "2 hobbits"
        ],
        "instructions": [
            "1. Boil em\n 2. Mash um\n 3. Stick um in a stew"
        ]
}];

    const updateKitchenBasics = (val) => {
         setKitchenBasics(val)
         setKitchenBasicsForFlax(val)
      }

    const handleAddItem = (item) => {
        setFridgeItems(prevItems => [...prevItems, item]);
        setFridgeItemsForFlax(prevItems => [...prevItems, item]);
    };

    const handleSubmit = () => {
        callAPI()
        setIsSubmitted(true);
    };


    const callAPI = async () => {
        setIsLoading(true);

        if (fridgeItems.length === 0) return;

        if (fridgeItems.includes("human meat")){
            setGPTRecipes(hobbitArr);
            setIsLoading(false);
            return;
        }

        const callHFLlama70b = async () => {
            try {
                const response = await axios.post('/api/recipes/huggingface', { fridgeItems, kitchenBasics });
                setLlamaRecipes(response.data.recipes);
                setIsLoading(false);
            } catch (error) {
                console.log(error.response ? error.response.data : 'Failed to fetch from Llama API');
                setIsLoading(false);
            }
        };
        
        const callMealDBMult = async () => {
            const response = await axios.post('/api/recipes/mealdb', { fridgeItems, kitchenBasics });
            setMealDBRecipes(response.data.recipes);
            setIsLoading(false);
        };
    
        const callGPT = async () => {
            setIsLoading(true);
            try {
                console.time('API callGPT Duration'); // Start the timer with a label
                const response = await axios.post('/api/recipes/openai', { fridgeItems, kitchenBasics, recipeTitles});
                setGPTRecipes(response.data.recipes);
            } catch (error) {
                console.log(error.message);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
                console.timeEnd('API callGPT Duration'); // Stop the timer and log the duration
            }
        };

        const callFlax = async () => {
            try {
                console.time('API callFlax Duration'); // Start the timer with a label
                const response = await axios.post('/api/recipes/flax', { fridgeItemsForFlax, kitchenBasicsForFlax });
                if (kitchenBasicsForFlax.length > 1) {
                    shuffleArray(kitchenBasicsForFlax)
                    kitchenBasicsForFlax.pop();
                    setKitchenBasicsForFlax(kitchenBasicsForFlax)
                }
                if (fridgeItemsForFlax.length > 1) {
                    shuffleArray(fridgeItemsForFlax)
                    fridgeItemsForFlax.pop();
                    setFridgeItemsForFlax(fridgeItemsForFlax)
                }

                if (response) {
                    return response.data;
                }
            } catch (error) {
                console.log(error.message);
                setIsLoading(false);
            } finally {
                console.timeEnd('API callFlax Duration'); // Stop the timer and log the duration
            }
        }

        // callHFLlama70b();
        // callMealDBMult();
        const recipeTitles = [];

        callGPT();

        setKitchenBasicsForFlax(kitchenBasics);

        const recipesOne = await callFlax(recipeTitles);
        setFlaxRecipes(recipesOne); // Assuming setFlaxRecipes can handle the data returned by callFlax
        recipeTitles.push(recipesOne.recipes.title);

        const recipesTwo = await callFlax(recipeTitles);
        if (!recipeTitles.includes(recipesOne)) setFlaxRecipesTwo(recipesTwo);
        recipeTitles.push(recipesTwo.recipes.title);

        const recipesThree = await callFlax(recipeTitles);
        if (!recipeTitles.includes(recipesTwo)) setFlaxRecipesThree(recipesThree);
        recipeTitles.push(recipesThree.recipes.title);

        const recipesFour = await callFlax(recipeTitles);
        if (!recipeTitles.includes(recipesThree)) setFlaxRecipesFour(recipesFour);
        recipeTitles.push(recipesFour.recipes.title);
    }

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    return (
        <div className="App">
            <img src={logo} alt="FeastFinder Logo" style={{ maxWidth: '250px', height: 'auto' }} />
            <InputComponent 
                onAddItem={handleAddItem} 
                fridgeItems={fridgeItems} 
                kitchenBasics={kitchenBasics}
                setKitchenBasics={updateKitchenBasics}
            />
            <button onClick={handleSubmit}>Get Recipes</button>
            {isSubmitted && <RecipeListComponent llamaRecipes={llamaRecipes} mealDBRecipes={mealDBRecipes} flaxRecipes={flaxRecipes} flaxRecipesTwo={flaxRecipesTwo} flaxRecipesThree={flaxRecipesThree} flaxRecipesFour={flaxRecipesFour} gptRecipes={gptRecipes} isLoading={isLoading} />}
        </div>
    );
}

export default App;
