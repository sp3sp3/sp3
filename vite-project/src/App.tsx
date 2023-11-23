import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Project } from './db/types'
import { getProjects } from './handlers/projects'
// import { Project } from './db/types'
// import { getProjects } from './handlers/projects'

function App() {
    const [count, setCount] = useState(0)
    const [projects, setProjects] = useState<Project[]>([])

    useEffect(() => {
        console.log(projects)

        const handlerCall = async () => {
            const p = await getProjects()
            setProjects(p)
        }
        handlerCall()
    }, [count])
    //
    // console.log(projects)

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React HI</h1>
            <div>{['hi', 'hi']}</div>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
