import React from 'react';
import './App.css';

function Home() {
    return (
        <div>
            <h1>Welcome to the Test Automation Portal</h1>
            <p>This portal is your gateway to managing and automating test processes.</p>
            <img
                src='./QAfunny.jpg'
                alt="UI Test Automation"
                style={{ width: '100%', height: 'auto', maxWidth: '600px' }}
            />
            <p>Explore the <strong>Business Rules Dictionary</strong> or <strong>Test Result Logs</strong> to get started.</p>
        </div>
    );
}

export default Home;
