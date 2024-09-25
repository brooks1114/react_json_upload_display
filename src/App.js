import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Home'; // Home page with UI test automation image
import BusinessRulesDictionary from './BusinessRulesDictionary'; // New Business Rules Dictionary page
import TestResultLogs from './TestResultLogs'; // Test Result Logs page
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/business-rules-dictionary">Business Rules Dictionary</Link>
            </li>
            <li>
              <Link to="/test-result-logs">Test Result Logs</Link>
            </li>
          </ul>
        </nav>

        {/* Apply CSS for the navigation */}
        <style jsx="true">{`
          nav {
            background-color: #2c3e50;
            padding: 10px;
          }

          nav ul {
            list-style: none;
            display: flex;
            justify-content: space-around;
          }

          nav ul li {
            margin: 0 15px;
          }

          nav ul li a {
            color: #ecf0f1;
            text-decoration: none;
            font-size: 18px;
            font-weight: bold;
            padding: 5px 10px;
          }

          nav ul li a:hover {
            background-color: #34495e;
            border-radius: 5px;
          }
        `}</style>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/business-rules-dictionary" element={<BusinessRulesDictionary />} />
          <Route path="/test-result-logs" element={<TestResultLogs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
