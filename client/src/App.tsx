import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [darkMode, setDarkMode] = useState(false)

  // Add/remove dark class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center text-center">
      {/* Logos */}
      <div className="flex gap-6 mb-6">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Vite + React
      </h1>

      {/* Counter Card */}
      <div className="card bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          count is {count}
        </button>
        <p className="text-gray-700 dark:text-gray-300 mt-4">
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      {/* Docs link */}
      <p className="read-the-docs text-gray-600 dark:text-gray-400 mt-6">
        Click on the Vite and React logos to learn more
      </p>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mt-6 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        {darkMode ? "🌞 Switch to Light" : "🌙 Switch to Dark"}
      </button>
    </div>
  )
}

export default App
