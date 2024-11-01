import React from 'react'
import LoanCalculator from './LoanCalculator'

function App() {
  console.log(import.meta.env.VITE_BACKEND_URL)
  return (
    <div>
      <LoanCalculator />
    </div>
  )
}

export default App
