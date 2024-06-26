import React, { useState } from 'react';
import './InputComponent.css';

const InputComponent = ({ onAddItem, onDeleteItem, fridgeItems, kitchenBasics, setKitchenBasics }) => {
    const [item, setItem] = useState('');
    const [isDuplicate, setIsDuplicate] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (item && !fridgeItems.includes(item)) {
            onAddItem(item);
            setItem('');
            setIsDuplicate(false);
        } else if (fridgeItems.includes(item)) {
            setIsDuplicate(true);
        }
    };

    const handleDeleteBasic = (basic) => {
        setKitchenBasics(kitchenBasics.filter(item => item !== basic));
    };

    const handleClick = (e, fridgeItem) => {
        const targetRect = e.target.getBoundingClientRect();
        const xRightEdge = targetRect.right;
        const xLeftEdge = xRightEdge - 40;
        if (e.clientX >= xLeftEdge && e.clientX <= xRightEdge) {
            onDeleteItem(fridgeItem);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input 
                    id="food-item"
                    type="text" 
                    value={item} 
                    onChange={(e) => { setItem(e.target.value); setIsDuplicate(false); }} 
                    placeholder="Enter your food item"
                />
                <button type="submit">Add</button>
            </form>
            {isDuplicate && <p style={{ color: 'red' }}>Item already exists in the fridge.</p>}
                <div style={{ marginTop: '20px' }}>
                    {kitchenBasics.map((basic) => (
                        <div 
                            key={basic}
                            className="kitchen-basic"
                            onClick={() => handleDeleteBasic(basic)}
                        >
                            {basic}
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '20px' }}>
                {fridgeItems.map((fridgeItem) => (
                    <div 
                        key={fridgeItem} 
                        className="fridgeItem"
                        onClick={(e) => handleClick(e, fridgeItem)}
                    >
                        {fridgeItem}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InputComponent;
