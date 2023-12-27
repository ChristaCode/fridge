import React, { useState } from 'react';
import InputComponent from './InputComponent';
import RecipeListComponent from './RecipeListComponent';
import './App.css';

const App = () => {
    const [fridgeItems, setFridgeItems] = useState([]); // Initialize as an empty array
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleAddItem = (item) => {
        setFridgeItems(prevItems => [...prevItems, item]);
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        console.log(isSubmitted)
    };

    return (
        <div className="App">
            <InputComponent 
                onAddItem={handleAddItem} 
                fridgeItems={fridgeItems} 
            />
            <button onClick={handleSubmit}>Get Recipes</button>
            {isSubmitted && <RecipeListComponent fridgeItems={fridgeItems} />}
        </div>
    );
}

export default App;
