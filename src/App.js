import React, { useState } from 'react';
import InputComponent from './InputComponent';
import RecipeListComponent from './RecipeListComponent';
import './App.css';
import logo from './feastFinderLogo.png';

const App = () => {
    const [fridgeItems, setFridgeItems] = useState([]);
    const [kitchenBasics, setKitchenBasics] = useState(["salt", "pepper", "flour", "baking soda", "olive oil", "sugar", "mayonnaise", "ketchup", "garlic", "onion"]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleAddItem = (item) => {
        setFridgeItems(prevItems => [...prevItems, item]);
    };

    const handleDeleteBasic = (basic) => {
        setKitchenBasics(kitchenBasics.filter(item => item !== basic));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
    };

    return (
        <div className="App">
            <img src={logo} alt="FeastFinder Logo" style={{ maxWidth: '250px', height: 'auto' }} />
            <div style={{ marginTop: '20px' }}>
                {kitchenBasics.map((basic) => (
                    <div 
                        key={basic}
                        className="kitchen-basic" // Use the CSS class
                        onClick={() => handleDeleteBasic(basic)}
                    >
                        {basic}
                    </div>
                ))}
            </div>
            <InputComponent 
                onAddItem={handleAddItem} 
                fridgeItems={fridgeItems} 
            />
            <button onClick={handleSubmit}>Get Recipes</button>
            {isSubmitted && <RecipeListComponent fridgeItems={fridgeItems} kitchenBasics={kitchenBasics} />}
        </div>
    );
}

export default App;
