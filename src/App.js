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
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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


    const callAPI = () => {
        if (fridgeItems.length === 0) return;

        if (fridgeItems.includes("human meat")){
            setRecipes(hobbitArr);
            return;
        }

        const callHFLlama70b = async () => {
            try {
                const response = await axios.post('/api/recipes/huggingface', { fridgeItems, kitchenBasics });
                setLlamaRecipes(response.data.recipes);
            } catch (error) {
                console.log(error.response ? error.response.data : 'Failed to fetch from Llama API');
            }
        };
        
        const callMealDBMult = async () => {
            const response = await axios.post('/api/recipes/mealdb', { fridgeItems, kitchenBasics });
            setMealDBRecipes(response.data.recipes);
        };
    
        const callGPT = async () => {
            setIsLoading(true);
            try {
                const response = await axios.post('/api/recipes/openai', { fridgeItems, kitchenBasics });
                setRecipes(response.data.recipes);
                setIsLoading(false);
            } catch (error) {
                console.log(error.message);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        };

        const callFlax = async () => {
            setIsLoading(true);
            try {
                const response = await axios.post('/api/recipes/flax', { fridgeItems, kitchenBasics });
                console.log(response);
                
                setRecipes(response.data.recipes);
                setIsLoading(false);
            } catch (error) {
                console.log(error.message);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        }

        // callHFLlama70b();
        // callMealDBMult();
        callFlax();
        // callGPT();
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
            {isSubmitted && <RecipeListComponent llamaRecipes={llamaRecipes} mealDBRecipes={mealDBRecipes} recipes={recipes} isLoading={isLoading} />}
        </div>
    );
}

export default App;
