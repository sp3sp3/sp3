import { DialogContent, DialogTitle, TextField } from "@mui/material"
import { useEffect, useState } from "react"


export const AddReagentDialog = () => {
    const [eq, setEq] = useState<number>()
    const [molecularWeight, setMolecularWeight] = useState<number>()
    const [smilesInput, setSMILESInput] = useState<string>('')
    const [canonicalSMILES, setCanonicalSMILES] = useState<string>()
    const [helperTextSMILES, setHelperTextSMILES] = useState<string>()

    useEffect(() => {
        // recalculate things whenever input is changed
        // if there is no input
        if (smilesInput === '') {
            setHelperTextSMILES('')
        } else {
            const mol = window.RDKit.get_mol(smilesInput)
            if (mol?.is_valid) {
                setCanonicalSMILES(mol.get_smiles())
                const desc = mol?.get_descriptors()
                if (desc) {
                    const jsonDesc = JSON.parse(desc)
                    setMolecularWeight(jsonDesc.exactmw)
                    setHelperTextSMILES(`Calculated MW: ${molecularWeight}`)
                }
            } else {
                setHelperTextSMILES('Invalid SMILES')
                setMolecularWeight(undefined)
            }
        }
    }, [smilesInput, molecularWeight])

    return (
        <>
            <DialogTitle>
                Add reagent
            </DialogTitle>
            <DialogContent>
                <TextField
                    label="Molecule SMILES"
                    autoFocus
                    margin="normal"
                    id="molecule-smiles"
                    fullWidth
                    variant="standard"
                    helperText={helperTextSMILES}
                    onChange={(event) => { setSMILESInput(event.target.value) }}
                />
                <TextField
                    label="Molecule name"
                    autoFocus
                    margin="normal"
                    id="molecule-name"
                    fullWidth
                    variant="standard"
                    onChange={() => {
                        // TODO: add timeout so it doesn't fire incomplete requests
                        // request from pubchem
                        // get mw 

                    }}
                />
                <TextField
                    label="Equivalents"
                    autoFocus
                    margin="normal"
                    id="equivalents"
                    fullWidth
                    variant="standard"
                    onChange={(event) => {
                        const val = event.target.value
                        let numVal
                        console.log(!Number.isNaN(val))
                        setEq(numVal)
                    }}
                />
            </DialogContent>
        </>
    )
}
