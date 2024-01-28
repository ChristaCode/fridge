import React, { useState } from 'react';
import InputComponent from './InputComponent';
import RecipeListComponent from './RecipeListComponent';
import './App.css';
import logo from './feastFinderLogo.png';
import axios from 'axios';

const App = () => {
    const [fridgeItems, setFridgeItems] = useState([]);
    const [kitchenBasics, setKitchenBasics] = useState(["salt", "pepper", "flour", "baking soda", "olive oil", "vegetable oil", "sugar", "mayonnaise", "ketchup", "garlic", "onion"]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [llamaRecipes, setLlamaRecipes] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
      }

    const handleAddItem = (item) => {
        setFridgeItems(prevItems => [...prevItems, item]);
    };

    const handleSubmit = () => {
        callAPI()
        setIsSubmitted(true);
    };

    const callAPI = async () => {
        setIsLoading(true);

        if (fridgeItems.length === 0) return;

        if (fridgeItems.includes("human meat")){
            setLlamaRecipes(hobbitArr);
            setIsLoading(false);
            return;
        }

        const callHFLlama7b = async () => {
            try {
                console.time('API llama7b Duration'); // Start the timer with a label
                const response = await axios.post('/api/recipes/huggingface', { fridgeItems, kitchenBasics });
                setLlamaRecipes(response.data.recipes);
            } catch (error) {
                console.log(error.response ? error.response.data : 'Failed to fetch from Llama API');
                setIsLoading(false);
            } finally {
                console.timeEnd('API llama70b Duration'); // Stop the timer and log the duration
            }
        };

        await callHFLlama7b();
        setIsLoading(false);
    }

    return (
        <div className="App">
        <span className="Recipe Wrapper">
            <img src={logo} alt="FeastFinder Logo" style={{ maxWidth: '250px', height: 'auto' }} />
            <InputComponent 
                onAddItem={handleAddItem} 
                fridgeItems={fridgeItems} 
                kitchenBasics={kitchenBasics}
                setKitchenBasics={updateKitchenBasics}
            />
            <button onClick={handleSubmit}>Get Recipes</button>
            {isSubmitted && <RecipeListComponent llamaRecipes={llamaRecipes} isLoading={isLoading} />}
        </span>
        </div>
    );
}

export default App;
