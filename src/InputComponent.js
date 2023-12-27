import React, { useState } from 'react';

const InputComponent = ({ onAddItem, fridgeItems }) => {
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

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input 
                    id="food-item"
                    type="text" 
                    value={item} 
                    onChange={(e) => { setItem(e.target.value); setIsDuplicate(false); }} 
                    placeholder="Enter food item"
                />
                <button type="submit">Add</button>
            </form>
            {isDuplicate && <p style={{ color: 'red' }}>Item already exists in the fridge.</p>}
            <div style={{ marginTop: '20px' }}>
                {fridgeItems.map((fridgeItem) => (
                    <div key={fridgeItem} style={{ border: '1px solid gray', padding: '10px', margin: '5px', display: 'inline-block' }}>
                        {fridgeItem}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InputComponent;
