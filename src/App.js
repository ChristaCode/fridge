import React, { useState } from 'react';
import InputComponent from './InputComponent';
import RecipeListComponent from './RecipeListComponent';
import './App.css';
import logo from './feastFinderLogo.png';
import axios from 'axios';
import sidebarImage from './veggies.png'; // Import the sidebar image

const App = () => {
    const [fridgeItems, setFridgeItems] = useState([]);
    const [activeItemIndex, setActiveItemIndex] = useState(null);
    const [kitchenBasics, setKitchenBasics] = useState(["salt", "pepper", "flour", "baking soda", "oil", "sugar"]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [llamaRecipes, setLlamaRecipes] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDeleteItem = (item) => {
        setFridgeItems(fridgeItems.filter(fridgeItem => fridgeItem !== item));
    };

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
        setFridgeItems(prevItems => {
            const updatedItems = [...prevItems, item];
            setActiveItemIndex(updatedItems.length - 1);
            return updatedItems;
        });
    };

    const handleSubmit = async () => {
        setLlamaRecipes(null)
        const dbRecipes = await checkDBRecipes()

        if(dbRecipes) {
            console.log('calling API')
            callAPI()
        }
        setIsSubmitted(true);
    };

    const checkDBRecipes = async () => {
        try {
            const response = await axios.post('/recipes/search', {
                fridgeItems
            });

            setLlamaRecipes(response.data);
            console.log(response.data);
            return response.data;
        } catch (error) {   
            console.log(error.response ? error.response.data : 'Failed to fetch from DB');
            setIsLoading(false);
        }
    }

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
                console.time('API llama7b Duration');
                const response = await axios.post('/api/recipes/huggingface', { fridgeItems, kitchenBasics });
                console.log(response.data.recipes);
                setLlamaRecipes(response.data.recipes);
            } catch (error) {
                console.log(error.response ? error.response.data : 'Failed to fetch from Llama API');
                setIsLoading(false);
            } finally {
                console.timeEnd('API llama70b Duration');
            }
        };

        await callHFLlama7b();
        setIsLoading(false);
    }

    return (
        <div className="App">
            <div className="content-wrapper">
            <div className="Top">
                <img src={logo} alt="FeastFinder Logo" style={{ maxWidth: '250px', height: 'auto' }} />
                <div>
                <InputComponent 
                    onAddItem={handleAddItem} 
                    onDeleteItem={handleDeleteItem}
                    fridgeItems={fridgeItems}
                    kitchenBasics={kitchenBasics}
                    setKitchenBasics={updateKitchenBasics}
                />
                <button onClick={handleSubmit}>Get Recipes</button>
            </div>
            </div>
            {isSubmitted && <RecipeListComponent llamaRecipes={llamaRecipes} isLoading={isLoading} activeItemIndex={activeItemIndex} />}
            </div>
        </div>
    );
}

export default App;