import React, { useState } from 'react';

function TestResultLogs() {
    const [fileData, setFileData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [filters, setFilters] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [queryResult, setQueryResult] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [noResults, setNoResults] = useState(false);

    // Handle file upload and parse the .txt file
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const lines = e.target.result.split('\n').map(line => line.trim());
            const parsedData = lines.map(line => {
                const json = JSON.parse(line);

                // Split the timestamp into date and time
                if (json.timestamp) {
                    const [date, time] = json.timestamp.split(' ');
                    json.date = date;
                    json.time = time;
                    delete json.timestamp; // Remove the original timestamp property
                }
                return json;
            });
            setFileData(parsedData);
            setFilteredData(parsedData); // Set initial filtered data to all data
        };

        reader.readAsText(file);
    };

    // Handle filter changes
    const handleFilterChange = (property, value) => {
        const newFilters = { ...filters, [property]: value === 'All' ? '' : value };
        setFilters(newFilters);

        // Apply the filters to the data
        const filtered = fileData.filter(item =>
            Object.keys(newFilters).every(key =>
                newFilters[key] === '' || item[key] === newFilters[key]
            )
        );
        setFilteredData(filtered);
    };

    // Sort the columns
    const handleSort = (columnKey) => {
        let direction = 'asc';
        if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        const sortedData = [...filteredData].sort((a, b) => {
            if (a[columnKey] < b[columnKey]) {
                return direction === 'asc' ? -1 : 1;
            }
            if (a[columnKey] > b[columnKey]) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setFilteredData(sortedData);
        setSortConfig({ key: columnKey, direction });
    };

    // Get unique values for dropdown filters
    const getUniqueValues = (data, property) => {
        if (!data) return [];
        const uniqueValues = new Set(data.map(item => item[property] || ''));
        return ['All', ...uniqueValues]; // Include 'All' to reset the filter
    };

    // Perform query for "FCRA FL EXPECTED"
    const performQueryExpected = () => {
        const queryResults = fileData.filter(item => item.businessRule === "2" && item.jurisdiction === "FL");
        if (queryResults.length === 0) {
            setNoResults(true);
            setShowModal(true);
        } else {
            setQueryResult(queryResults);
            setShowModal(true);
        }
    };

    // Perform query for "FCRA FL NOT EXPECTED"
    const performQueryNotExpected = () => {
        const queryResults = fileData.filter(item => item.businessRule === "2" && item.jurisdiction !== "FL");
        if (queryResults.length === 0) {
            setNoResults(true);
            setShowModal(true);
        } else {
            setQueryResult(queryResults);
            setShowModal(true);
        }
    };

    // Close the modal
    const closeModal = () => {
        setShowModal(false);
        setNoResults(false); // Reset the no results flag
    };

    // Render the table dynamically based on the properties of the objects
    const renderTable = () => {
        if (!filteredData || filteredData.length === 0) return <div>No data available.</div>;

        const columns = Object.keys(filteredData[0] || {});

        return (
            <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', tableLayout: 'auto' }}>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column}>
                                <div onClick={() => handleSort(column)} style={{ cursor: 'pointer' }}>
                                    {column} {sortConfig.key === column ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </div>
                                <select onChange={(e) => handleFilterChange(column, e.target.value)}>
                                    {getUniqueValues(fileData, column).map((value, i) => (
                                        <option key={i} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column) => (
                                <td key={column}>{row[column]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // Render the modal with query results
    const renderModal = () => {
        if (!queryResult && !noResults) return null;

        return (
            <div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', padding: '20px', backgroundColor: 'white', border: '1px solid #ccc', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                {noResults ? (
                    <div>
                        <h3>No Results Found</h3>
                        <button onClick={closeModal}>Close</button>
                    </div>
                ) : (
                    <div>
                        <h3>Query Results</h3>
                        <p>Count of results: {queryResult.length}</p>
                        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', tableLayout: 'auto' }}>
                            <thead>
                                <tr>
                                    {Object.keys(queryResult[0]).map((key) => (
                                        <th key={key}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {queryResult.map((result, idx) => (
                                    <tr key={idx}>
                                        {Object.keys(result).map((key) => (
                                            <td key={key}>{result[key]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={closeModal}>Close</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Main content area for file upload and table */}
            <div style={{ width: '75%' }}>
                <h2>Test Result Logs</h2>
                <form>
                    <label>
                        <input type="file" accept=".txt" onChange={handleFileUpload} style={{ display: 'none' }} />
                        <button type="button" onClick={() => document.querySelector('input[type="file"]').click()}>
                            Upload Test Result Logs (.txt)
                        </button>
                    </label>
                </form>

                {/* Display the table if the fileData is available */}
                {fileData && (
                    <div>
                        <h3>Uploaded Data</h3>
                        {renderTable()}
                    </div>
                )}
            </div>

            {/* Side section for the FCRA buttons */}
            <div style={{ width: '20%', position: 'fixed', right: 0, top: 0, height: '100%', overflowY: 'auto', padding: '20px', backgroundColor: '#f0f0f0' }}>
                <h3>Queries</h3>
                <button type="button" style={{ display: 'block', width: '100%', marginBottom: '10px' }} onClick={performQueryExpected}>
                    FCRA FL EXPECTED
                </button>
                <button type="button" style={{ display: 'block', width: '100%' }} onClick={performQueryNotExpected}>
                    FCRA FL NOT EXPECTED
                </button>
            </div>

            {/* Render the query result modal if it is open */}
            {showModal && renderModal()}
        </div>
    );
}

export default TestResultLogs;
