import React, { useState } from 'react';
import InputComponent from './InputComponent';
import RecipeListComponent from './RecipeListComponent';
import './App.css';
import logo from './feastFinderLogo.png';
import axios from 'axios';

const App = () => {
    const [fridgeItems, setFridgeItems] = useState([]);
    const [kitchenBasics, setKitchenBasics] = useState(["salt", "pepper", "flour", "baking soda", "olive oil", "sugar", "mayonnaise", "ketchup", "garlic", "onion"]);
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
        "title": "looks like meats back on the menu, boys",
        "ingredients": [
            "2 hobbits"
        ],
        "instructions": "Boil em\nMash um\nStick um in a stew"
}];

    const handleAddItem = (item) => {
        setFridgeItems(prevItems => [...prevItems, item]);
    };

    const handleSubmit = () => {
        callAPI()
        setIsSubmitted(true);
    };


    const callAPI = async () => {
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
                const response = await axios.post('/api/recipes/openai', { fridgeItems, kitchenBasics });
                setGPTRecipes(response.data.recipes);
            } catch (error) {
                console.log(error.message);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        };

        const callFlax = async () => {
            try {
                const response = await axios.post('/api/recipes/flax', { fridgeItems, kitchenBasics });
                if (kitchenBasics.length > 1) {
                    shuffleArray(kitchenBasics)
                    kitchenBasics.pop();
                    setKitchenBasics(kitchenBasics)
                }
                if (fridgeItems.length > 1) {
                    shuffleArray(fridgeItems)
                    fridgeItems.pop();
                    setFridgeItems(fridgeItems)
                }

                if (response) {
                    return response.data;
                }
            } catch (error) {
                console.log(error.message);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        }

        // callHFLlama70b();
        // callMealDBMult();
        const recipesOne = await callFlax();
        setFlaxRecipes(recipesOne); // Assuming setFlaxRecipes can handle the data returned by callFlax
    
        const recipesTwo = await callFlax();
        setFlaxRecipesTwo(recipesTwo);
    
        const recipesThree = await callFlax();
        setFlaxRecipesThree(recipesThree);
    
        const recipesFour = await callFlax();
        setFlaxRecipesFour(recipesFour);

        setIsLoading(false);
        // callGPT();
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
            />
            <button onClick={handleSubmit}>Get Recipes</button>
            {isSubmitted && <RecipeListComponent llamaRecipes={llamaRecipes} mealDBRecipes={mealDBRecipes} flaxRecipes={flaxRecipes} flaxRecipesTwo={flaxRecipesTwo} flaxRecipesThree={flaxRecipesThree} flaxRecipesFour={flaxRecipesFour} gptRecipes={gptRecipes} isLoading={isLoading} />}
        </div>
    );
}

export default App;
