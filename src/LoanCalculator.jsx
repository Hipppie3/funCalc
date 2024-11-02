import React, { useState } from 'react';
import axios from 'axios';
import './LoanCalculator.css';

const LoanCalculator = () => {
    const [inputs, setInputs] = useState({
        propertyValue: '',
        ficoScore: '',
        constructionCost: '',
        purchasePrice: '',
        arv: '',
        propertyType: 'residential'
    });
    const [loanAmount, setLoanAmount] = useState(null);
    const [formula, setFormula] = useState('');
    const [explanation, setExplanation] = useState('');

    const ficoRanges = [
        { label: 'Poor (300 - 579)', value: 500 },
        { label: 'Fair (580 - 669)', value: 625 },
        { label: 'Good (670 - 739)', value: 705 },
        { label: 'Very Good (740 - 799)', value: 770 },
        { label: 'Exceptional (800 - 850)', value: 825 }
    ];

    const formatCurrency = (value) => {
        return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = name === "ficoScore" ? value : formatCurrency(value);
        setInputs({ ...inputs, [name]: formattedValue });
    };

    const calculateLoan = async () => {
        const sanitizedInputs = {
            ...inputs,
            propertyValue: parseInt(inputs.propertyValue.replace(/,/g, '')) || 0,
            constructionCost: parseInt(inputs.constructionCost.replace(/,/g, '')) || 0,
            purchasePrice: parseInt(inputs.purchasePrice.replace(/,/g, '')) || 0,
            arv: parseInt(inputs.arv.replace(/,/g, '')) || 0
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/calculate-loan`, sanitizedInputs);
            setLoanAmount(response.data.loanAmount);
            generateFormula(response.data.loanAmount);
        } catch (error) {
            console.error("Error calculating loan:", error);
        }
    };

    const generateFormula = (calculatedLoanAmount) => {
        const { propertyValue, ficoScore, constructionCost, purchasePrice, arv, propertyType } = inputs;
        let baseCalculation = '';
        let multiplier = 1;

        if (ficoScore >= 300 && ficoScore <= 579) multiplier = 0.5;
        else if (ficoScore >= 580 && ficoScore <= 669) multiplier = 0.7;
        else if (ficoScore >= 670 && ficoScore <= 739) multiplier = 0.9;
        else if (ficoScore >= 740 && ficoScore <= 799) multiplier = 1.0;
        else if (ficoScore >= 800 && ficoScore <= 850) multiplier = 1.1;

        switch (propertyType) {
            case 'residential':
                baseCalculation = `0.8 * min(${propertyValue}, ${purchasePrice})`;
                setExplanation(`For residential, we take 80% of the lower between property value ($${propertyValue}) and purchase price ($${purchasePrice}).`);
                break;
            case 'fixAndFlip':
                baseCalculation = `0.7 * ${arv}`;
                setExplanation(`For fix-and-flip, we take 70% of ARV ($${arv}).`);
                break;
            case 'construction':
                baseCalculation = `0.85 * ${constructionCost}`;
                setExplanation(`For construction, we take 85% of construction cost ($${constructionCost}).`);
                break;
            default:
                baseCalculation = '';
                break;
        }

        setFormula(`(${baseCalculation}) * ${multiplier} = ${calculatedLoanAmount.toFixed(2)}`);
        setExplanation((prev) => `${prev} The FICO multiplier is ${multiplier}. Final loan amount is base * multiplier.`);
    };

    return (
        <div className="loan-calculator-container">
            <div className="loan-calculator-form">
                <h2>GOGO BAR LOAN CALCULATOR</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <label>Property Value:</label>
                    <input type="text" name="propertyValue" value={inputs.propertyValue} onChange={handleChange} placeholder="e.g., 300,000" />

                    <label>FICO Score:</label>
                    <select name="ficoScore" value={inputs.ficoScore} onChange={handleChange}>
                        <option value="">Select FICO Range</option>
                        {ficoRanges.map((range) => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                    </select>

                    <label>Construction Cost:</label>
                    <input type="text" name="constructionCost" value={inputs.constructionCost} onChange={handleChange} placeholder="e.g., 100,000" />

                    <label>Purchase Price:</label>
                    <input type="text" name="purchasePrice" value={inputs.purchasePrice} onChange={handleChange} placeholder="e.g., 250,000" />

                    <label>After-Repair Value (ARV):</label>
                    <input type="text" name="arv" value={inputs.arv} onChange={handleChange} placeholder="e.g., 350,000" />

                    <label>Property Type:</label>
                    <select name="propertyType" value={inputs.propertyType} onChange={handleChange}>
                        <option value="residential">Residential (80%)</option>
                        <option value="fixAndFlip">Fix and Flip (70%)</option>
                        <option value="construction">Construction (85%)</option>
                    </select>

                    <button onClick={calculateLoan} className="calculate-button">Calculate Loan</button>
                </form>
                
                {loanAmount !== null && (
                    <div className="result">
                        <h3>Estimated PAYMENT AMOUNT TO GIRLS: ${loanAmount.toLocaleString()}</h3>
                        <p><strong>Calculation Formula:</strong> {formula}</p>
                        <p><strong>Explanation:</strong> {explanation}</p>
                    </div>
                )}
            </div>
            
{/* Notes Section */}
<div className="loan-calculator-notes">
    <h3>Calculation Notes</h3>
    <p><strong>Residential:</strong> The loan is calculated as:
        <br />
        <code>0.8 * min(Property Value, Purchase Price) * FICO Multiplier</code>
        <br />
        - Uses <strong>Property Value</strong> and <strong>Purchase Price</strong>. The lower value between the two is selected.
        <br />
        - <strong>Ignores:</strong> Construction Cost and After-Repair Value (ARV).
    </p>

    <p><strong>Fix and Flip:</strong> The loan is calculated as:
        <br />
        <code>0.7 * ARV * FICO Multiplier</code>
        <br />
        - Uses <strong>ARV (After-Repair Value)</strong>, which estimates the property’s value after renovations.
        <br />
        - <strong>Ignores:</strong> Property Value, Purchase Price, and Construction Cost.
    </p>

    <p><strong>Construction:</strong> The loan is calculated as:
        <br />
        <code>0.85 * Construction Cost * FICO Multiplier</code>
        <br />
        - Uses <strong>Construction Cost</strong> as the basis for calculating loan amount, which covers building expenses.
        <br />
        - <strong>Ignores:</strong> Property Value, Purchase Price, and ARV.
    </p>

    <p><strong>FICO Score Multiplier:</strong>
        <br />
        The loan amount is adjusted by a multiplier based on the FICO score range:
        <ul>
            <li><strong>Poor (300-579):</strong> Multiplier = 0.5</li>
            <li><strong>Fair (580-669):</strong> Multiplier = 0.7</li>
            <li><strong>Good (670-739):</strong> Multiplier = 0.9</li>
            <li><strong>Very Good (740-799):</strong> Multiplier = 1.0</li>
            <li><strong>Exceptional (800-850):</strong> Multiplier = 1.1</li>
        </ul>
        The multiplier adjusts the base calculation to account for credit risk.
    </p>
</div>

        </div>
    );
};

export default LoanCalculator;
