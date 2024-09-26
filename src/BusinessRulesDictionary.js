import React, { useState } from 'react';

function BusinessRulesDictionary() {
    const [jsonData, setJsonData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [filters, setFilters] = useState({});
    const [visibleColumns, setVisibleColumns] = useState([]);

    // Handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            setJsonData(data);
            setFilteredData(data); // Initially set filtered data to full dataset
            reevaluateVisibleColumns(data); // Set visible columns based on the dataset
        };

        reader.readAsText(file);
    };

    // Handle dropdown and text field changes for filters
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value === "All" ? "" : value }); // Update filters
    };

    // Function to flatten nested data from the given, when, and then fields
    const flattenNestedData = (item, section) => {
        const result = {};
        if (!item[section]) return result;

        Object.keys(item[section]).forEach((key) => {
            Object.keys(item[section][key]).forEach((innerKey) => {
                result[`${section}.${key}.${innerKey}`] = item[section][key][innerKey] || '';
            });
        });

        return result;
    };

    // Function to get unique values for dropdown filters
    const getUniqueValues = (data, columnName) => {
        if (!data) return [];
        const uniqueValues = new Set();

        data.forEach((item) => {
            if (columnName.startsWith('given') || columnName.startsWith('when') || columnName.startsWith('then')) {
                const section = columnName.split('.')[0];
                const flattened = flattenNestedData(item, section);
                uniqueValues.add(flattened[columnName] || '');
            } else {
                const keys = columnName.split('.');
                let value = item;
                for (let i = 0; i < keys.length; i++) {
                    value = value?.[keys[i]];
                    if (value === undefined) return;
                }
                uniqueValues.add(value || '');
            }
        });

        return [...uniqueValues].filter((v) => v !== '');
    };

    // Extract column names, including nested columns
    const getColumnNames = (data) => {
        if (!data || data.length === 0) return [];

        const firstItem = data[0];
        let columns = ['businessRuleId'];

        ['given', 'when', 'then'].forEach((section) => {
            const flattened = flattenNestedData(firstItem, section);
            columns = [...columns, ...Object.keys(flattened)];
        });

        return columns;
    };

    // Retrieve value at a given path in a nested object
    const getValueAtPath = (item, path) => {
        const keys = path.split('.');
        let value = item;
        for (let i = 0; i < keys.length; i++) {
            value = value?.[keys[i]];
            if (value === undefined || value === null) return ''; // Return empty string if invalid path
        }
        return value;
    };

    // Function to reevaluate visible columns based on filtered or original data
    const reevaluateVisibleColumns = (data) => {
        const columns = getColumnNames(data);
        const nonEmptyColumns = columns.filter((colName) => {
            const uniqueValues = getUniqueValues(data, colName);
            return uniqueValues.length > 0; // Only include columns with non-blank values
        });

        // If no columns would be shown (i.e., no matching data), show all columns instead
        if (nonEmptyColumns.length === 0) {
            setVisibleColumns(columns); // Show all columns if no data is found
        } else {
            setVisibleColumns(nonEmptyColumns); // Otherwise, show only non-empty columns
        }
    };

    // Apply filters and display only rows that contain the selected dropdown value or text input value in the corresponding column
    const applyFilters = () => {
        if (!jsonData) return;

        // Apply the filters to the data
        const filtered = jsonData.filter((item) => {
            return Object.keys(filters).every((key) => {
                const filterValue = filters[key];
                if (!filterValue) return true; // If no filter is applied, include all rows

                const itemValue = getValueAtPath(item, key); // Correctly fetch nested values
                return itemValue?.toString().toLowerCase().includes(filterValue.toLowerCase()); // Compare the value with the filter (case-insensitive match)
            });
        });

        // Update filtered data and reevaluate columns
        setFilteredData(filtered);
        reevaluateVisibleColumns(filtered);
    };

    // Clear all filters and reset the table to the original state
    const clearFilters = () => {
        setFilters({}); // Reset filters
        setFilteredData(jsonData); // Reset filtered data to the full dataset
        reevaluateVisibleColumns(jsonData); // Reset visible columns
        document.querySelectorAll('select').forEach((select) => (select.value = 'All')); // Reset dropdowns
        document.querySelector('input[name="businessRuleId"]').value = ''; // Clear text input
    };

    return (
        <div>
            <h2>Business Rules Dictionary</h2>
            <input type="file" accept=".json" onChange={handleFileUpload} />

            {/* New div for buttons */}
            <div style={{ marginTop: '20px' }}>
                <button onClick={applyFilters} style={{ marginRight: '10px' }}>
                    Apply Filters
                </button>
                <button onClick={clearFilters}>
                    Clear Filters
                </button>
            </div>

            {/* Always display the table and buttons */}
            {visibleColumns.length > 0 && (
                <div>
                    <h3>Filtered Data</h3>
                    <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', tableLayout: 'auto' }}>
                        <thead>
                            <tr>
                                {visibleColumns.map((colName) => (
                                    <th key={colName} style={{ whiteSpace: 'nowrap', minWidth: '150px', textAlign: 'center' }}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <span>{colName}</span> {/* Display the property name from JSON */}
                                        </div>
                                        <div>
                                            {colName === 'businessRuleId' ? (
                                                // Add a text input for the businessRuleId filter
                                                <input
                                                    type="text"
                                                    name={colName}
                                                    placeholder="Type Business Rule ID"
                                                    onChange={handleFilterChange}
                                                    style={{ width: '100%' }}
                                                />
                                            ) : (
                                                // Dropdown for other columns
                                                <select name={colName} onChange={handleFilterChange} style={{ width: '100%' }}>
                                                    <option value="All">All</option>
                                                    {getUniqueValues(jsonData, colName).map((value) => (
                                                        <option key={value} value={value}>
                                                            {value}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Show a message if no data matches the filter */}
                            {filteredData && filteredData.length > 0 ? (
                                filteredData.map((item, idx) => (
                                    <tr key={idx}>
                                        {visibleColumns.map((colName) => {
                                            let value;
                                            if (colName.includes('given') || colName.includes('when') || colName.includes('then')) {
                                                const section = colName.split('.')[0];
                                                const flattened = flattenNestedData(item, section);
                                                value = flattened[colName];
                                            } else {
                                                value = getValueAtPath(item, colName);
                                            }
                                            return (
                                                <td key={colName} style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>
                                                    {value || ''}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={visibleColumns.length} style={{ textAlign: 'center' }}>
                                        No data available or matching filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>
            )}
        </div>
    );
}

export default BusinessRulesDictionary;
