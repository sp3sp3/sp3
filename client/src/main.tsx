import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { RDKitModule } from '@rdkit/rdkit'


declare global {
    interface Window {
        RDKit: RDKitModule
    }
}

window
    .initRDKitModule()
    .then((instance: RDKitModule) => {
        console.log("RDKit version: ", instance.version())
        window.RDKit = instance;
        return instance;
    })
    .catch((e) => {
        console.error("Error loading RDKit");
        console.error(e)
    });


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
