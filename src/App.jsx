import React from 'react'
import LoanCalculator from './LoanCalculator'

function App() {
console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);

  return (
    <div>
      <LoanCalculator />
    </div>
  )
}

export default App
