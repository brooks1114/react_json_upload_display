import React, { useState } from 'react';

function TestPlanGenerator() {
    const [jsonData, setJsonData] = useState(null);
    const [userInput, setUserInput] = useState({});

    // Handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            setJsonData(data);
            initializeUserInput(data); // Initialize user input with the same structure as jsonData with blank values
        };

        reader.readAsText(file);
    };

    // Initialize user input with blank values for each dropdown
    const initializeUserInput = (data) => {
        const inputData = {};
        Object.keys(data).forEach((firstLevelKey) => {
            inputData[firstLevelKey] = {};
            Object.keys(data[firstLevelKey]).forEach((secondLevelKey) => {
                inputData[firstLevelKey][secondLevelKey] = ""; // Initialize all with blank
            });
        });
        setUserInput(inputData);
    };

    // Handle user input changes (for both text inputs and dropdowns)
    const handleInputChange = (firstLevelKey, secondLevelKey, value) => {
        setUserInput((prevInput) => ({
            ...prevInput,
            [firstLevelKey]: {
                ...prevInput[firstLevelKey],
                [secondLevelKey]: value
            }
        }));
    };

    // Render the table based on the uploaded JSON data
    const renderTable = () => {
        if (!jsonData) return null;

        const rows = [];

        // Iterate over the top-level keys (e.g., summaryPage, middleish, backend)
        Object.keys(jsonData).forEach((firstLevelKey) => {
            const nestedObj = jsonData[firstLevelKey];

            // Iterate over the second-level keys (e.g., first, street, sad, fifi)
            Object.keys(nestedObj).forEach((secondLevelKey) => {
                const values = nestedObj[secondLevelKey];

                // Create table rows
                rows.push(
                    <tr key={`${firstLevelKey}-${secondLevelKey}`}>
                        <td>{firstLevelKey}</td>
                        <td>{secondLevelKey}</td>
                        <td>
                            {Array.isArray(values) && values.length > 0 ? (
                                // If the array has values, display a dropdown with a blank option
                                <select
                                    value={userInput[firstLevelKey][secondLevelKey]}
                                    onChange={(e) =>
                                        handleInputChange(firstLevelKey, secondLevelKey, e.target.value)
                                    }
                                >
                                    <option value="">Select an option</option>
                                    {values.map((item, i) => (
                                        <option key={i} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                // If the array is empty, display a text input
                                <input
                                    type="text"
                                    value={userInput[firstLevelKey][secondLevelKey]}
                                    placeholder="Enter value"
                                    onChange={(e) =>
                                        handleInputChange(firstLevelKey, secondLevelKey, e.target.value)
                                    }
                                />
                            )}
                        </td>
                    </tr>
                );
            });
        });

        return (
            <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', tableLayout: 'auto' }}>
                <thead>
                    <tr>
                        <th>First Property (Top Level)</th>
                        <th>Nested Property (Second Level)</th>
                        <th>Input Type</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    };

    // Handle exporting the user input as a JSON file
    const exportDataAsJson = () => {
        const dataStr = JSON.stringify(userInput, null, 2); // Convert userInput to JSON string
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create a link and trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'test-plan-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <h2>Test Plan Generator</h2>
            <form>
                <label>
                    <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <button
                        type="button"
                        onClick={() => document.querySelector('input[type="file"]').click()}
                    >
                        Generate Test Plan Template
                    </button>
                </label>

                {/* New button for exporting the form data */}
                <button type="button" onClick={exportDataAsJson} style={{ marginLeft: '10px' }}>
                    Export Test Plan Data
                </button>
            </form>

            {/* Display the table if the JSON data is available */}
            {jsonData && (
                <div>
                    <h3>Generated Test Plan Template</h3>
                    {renderTable()}
                </div>
            )}
        </div>
    );
}

export default TestPlanGenerator;
