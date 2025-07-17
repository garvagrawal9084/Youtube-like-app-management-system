import { useState , useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from "axios"

function App() {
  const [jokes, setjokes] = useState([])
  useEffect(() => {
    axios.get("/api/jokes")
    .then((response)=>{
        setjokes(response.data)
    })
    .catch((error)=>{
      console.log(error)
    })
  })
  

  return (
    <>
      <h1>Full Stack</h1>
      <p>JOKES: {jokes.length}</p>

      {
        jokes.map((joke , index)=>(
          <div key={joke.id}>
            <h3>Title :- {joke.title}</h3>
            <p>Content :- {joke.content}</p>
          </div>
        ))
      }
    </>
  )
}

export default App
