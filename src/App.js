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
    const [gptRecipes, setGPTRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [doneAllLoading, setDoneAllLoading] = useState(0);
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


    const callAPI = () => {
        if (fridgeItems.length === 0) return;

        if (fridgeItems.includes("human meat")){
            setGPTRecipes(hobbitArr);
            setIsLoading(false);
            setDoneAllLoading(4);
            return;
        }

        const callHFLlama70b = async () => {
            try {
                const response = await axios.post('/api/recipes/huggingface', { fridgeItems, kitchenBasics });
                setLlamaRecipes(response.data.recipes);
                setIsLoading(false);
                const temp = doneAllLoading + 1;
                setDoneAllLoading(temp)
            } catch (error) {
                console.log(error.response ? error.response.data : 'Failed to fetch from Llama API');
                setIsLoading(false);
                const temp = doneAllLoading + 1;
                setDoneAllLoading(temp)
            }
        };
        
        const callMealDBMult = async () => {
            const response = await axios.post('/api/recipes/mealdb', { fridgeItems, kitchenBasics });
            setMealDBRecipes(response.data.recipes);
            setIsLoading(false);
            const temp = doneAllLoading + 1;
            setDoneAllLoading(temp)
        };
    
        const callGPT = async () => {
            setIsLoading(true);
            try {
                const response = await axios.post('/api/recipes/openai', { fridgeItems, kitchenBasics });
                setGPTRecipes(response.data.recipes);
            } catch (error) {
                console.log(error.message);
                setIsLoading(false);
                const temp = doneAllLoading + 1;
                setDoneAllLoading(temp)
            } finally {
                setIsLoading(false);
                const temp = doneAllLoading + 1;
                setDoneAllLoading(3)
            }
        };

        const callFlax = async () => {
            setIsLoading(true);
            try {
                const response = await axios.post('/api/recipes/flax', { fridgeItems, kitchenBasics });
                if (response) {
                    setFlaxRecipes(response.data);
                }
            } catch (error) {
                console.log(error.message);
                setIsLoading(false);
                const temp = doneAllLoading + 1;
                setDoneAllLoading(temp)
            } finally {
                setIsLoading(false);
                const temp = doneAllLoading + 1;
                setDoneAllLoading(temp)
            }
        }

        // callHFLlama70b();
        // callMealDBMult();
        callFlax();
        callGPT();
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
            {isSubmitted && <RecipeListComponent llamaRecipes={llamaRecipes} mealDBRecipes={mealDBRecipes} flaxRecipes={flaxRecipes} gptRecipes={gptRecipes} isLoading={isLoading} doneAllLoading={doneAllLoading} />}
        </div>
    );
}

export default App;
