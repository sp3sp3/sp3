import { Button, DialogContent, DialogTitle, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { useEffect, useState } from "react"
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure"


interface MoleculeInputProps {
    moleculeInputType: string
}

// process the input and output a canonicalSMILES and molecular weight to the parent component
// accepts either SMILES or the name of the reagent
const MoleculeInputForm = ({ moleculeInputType }: MoleculeInputProps) => {
    const [moleculeInput, setMoleculeInput] = useState<string>('')
    // const [moleculeInputName, setMoleculeInputName] = useState<string>('')
    const [helperText, setHelperText] = useState<string>()

    // want to pass these things up to parent
    const [canonicalSMILES, setCanonicalSMILES] = useState<string>()
    const [molecularWeight, setMolecularWeight] = useState<number>()


    useEffect(() => {
        // recalculate things whenever input is changed
        // if there is no input
        if (moleculeInput === '') {
            setHelperText('')
            setCanonicalSMILES('')
        } else {
            if (moleculeInputType === 'SMILES') {
                const mol = window.RDKit.get_mol(moleculeInput)
                if (mol?.is_valid) {
                    setCanonicalSMILES(mol.get_smiles())
                    const desc = mol?.get_descriptors()
                    if (desc) {
                        const jsonDesc = JSON.parse(desc)
                        setMolecularWeight(jsonDesc.exactmw)
                        setHelperText(`Calculated MW: ${molecularWeight}`)
                    }
                } else {
                    setHelperText('Invalid SMILES')
                    setMolecularWeight(undefined)
                }
            } else {
                setHelperText(`MW: ${molecularWeight}`)
            }
        }
    }, [moleculeInput, molecularWeight])


    return (
        <>
            <Stack
                direction='row'
            >
                {moleculeInputType === "SMILES" ?
                    <TextField
                        label="Molecule SMILES"
                        autoFocus
                        margin="normal"
                        id="molecule-smiles"
                        fullWidth
                        variant="standard"
                        helperText={helperText}
                        onChange={(event) => { setMoleculeInput(event.target.value) }}
                    />
                    :
                    <TextField
                        label="Molecule name"
                        autoFocus
                        margin="normal"
                        id="molecule-name"
                        fullWidth
                        variant="standard"
                        helperText={helperText}
                        onChange={async (event) => {
                            setMoleculeInput(event.target.value)
                        }}
                    />
                }

                {/* add a button to execute a search on PubChem */}
                {moleculeInputType === "Name"
                    ? <Button
                        onClick={async () => {
                            type PubChemResponse = {
                                "PropertyTable": {
                                    "Properties": {
                                        "CID": string,
                                        "MolecularWeight": string,
                                        "CanonicalSMILES": string
                                    }[]
                                }
                            }
                            const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${moleculeInput}/property/MolecularWeight,CanonicalSMILES/json`,)
                            if (response.status === 404) {
                                setHelperText('Not found in PubChem')
                                setCanonicalSMILES('')
                            }
                            const result: PubChemResponse = await response.json()
                            const pcProperties = result.PropertyTable.Properties[0]
                            const pubchemSMILES = pcProperties.CanonicalSMILES

                            setMolecularWeight(Number(pcProperties.MolecularWeight))
                            const mol = window.RDKit.get_mol(pubchemSMILES)
                            const canonicalized = mol?.get_smiles()
                            if (canonicalized) {
                                setCanonicalSMILES(canonicalized)
                            }
                        }}
                    >Search on PubChem</Button>
                    : null}
                {canonicalSMILES ?
                    <MoleculeStructure
                        id="molecule-structure"
                        structure={canonicalSMILES}
                        width={150}
                        height={150}
                        svgMode
                    />
                    : null
                }
            </Stack>
        </>
    )
}


export const AddReagentDialog = () => {
    const [eq, setEq] = useState<number>()

    const [moleculeInputType, setMoleculeInputType] = useState<string>('SMILES')




    const handleMoleculeInputToggle = (_: React.MouseEvent<HTMLElement>, newInput: string | null) => {
        if (newInput !== null) {
            setMoleculeInputType(newInput)
        }
    }

    return (
        <>
            <DialogTitle>
                Add reagent
            </DialogTitle>
            <DialogContent>
                <ToggleButtonGroup
                    value={moleculeInputType}
                    exclusive
                    onChange={handleMoleculeInputToggle}
                    aria-label="input type for molecule"
                >
                    <ToggleButton value="SMILES" aria-label="SMILES">
                        SMILES
                    </ToggleButton>
                    <ToggleButton value="Name" aria-label="Name">
                        Name
                    </ToggleButton>
                </ToggleButtonGroup>
                <MoleculeInputForm moleculeInputType={moleculeInputType} />
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
