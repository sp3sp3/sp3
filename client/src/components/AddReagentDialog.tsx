import { Button, DialogContent, DialogTitle, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure"


interface MoleculeInputProps {
    moleculeInputType: string
    canonicalSMILES?: string
    setCanonicalSMILES: Dispatch<SetStateAction<string | undefined>>
    molecularWeight?: number
    setMolecularWeight: Dispatch<SetStateAction<number | undefined>>
}

// process the input and output a canonicalSMILES and molecular weight to the parent component
// accepts either SMILES or the name of the reagent
// if SMILES is entered, MW is calculated with RDKit
// if name is entered, the molecule can be searched for on PubChem, and the MW populated from PubChem's response
const MoleculeInputForm = ({ moleculeInputType,
    canonicalSMILES,
    setCanonicalSMILES,
    molecularWeight,
    setMolecularWeight
}: MoleculeInputProps) => {
    const [moleculeInput, setMoleculeInput] = useState<string>('')
    // const [moleculeInputName, setMoleculeInputName] = useState<string>('')
    const [helperText, setHelperText] = useState<string>()

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
                    (
                        <>
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
                            <Button
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
                        </>
                    )
                }

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


interface EquivalentsInputFormProps {
    handleSetEq: Dispatch<SetStateAction<number | undefined>>
}
const EquivalentsInputForm = ({ handleSetEq }: EquivalentsInputFormProps) => {
    const [eqHelperText, setEqHelperText] = useState<string>('')
    return (<TextField
        label="Equivalents"
        autoFocus
        margin="normal"
        id="equivalents"
        fullWidth
        variant="standard"
        helperText={eqHelperText}
        onChange={(event) => {
            const val = event.target.value
            const numVal = Number(val)
            if (isNaN(numVal)) {
                setEqHelperText("Please enter a valid number without commas, and use a decimal point if needed")
            } else {
                setEqHelperText("")
            }

            handleSetEq(numVal)
        }}
    />)

}


export const AddReagentDialog = () => {
    const [eq, setEq] = useState<number>()
    const [moleculeInputType, setMoleculeInputType] = useState<string>('SMILES')
    const [canonicalSMILES, setCanonicalSMILES] = useState<string>()
    const [molecularWeight, setMolecularWeight] = useState<number>()

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
                <MoleculeInputForm
                    moleculeInputType={moleculeInputType}
                    canonicalSMILES={canonicalSMILES}
                    setCanonicalSMILES={setCanonicalSMILES}
                    molecularWeight={molecularWeight}
                    setMolecularWeight={setMolecularWeight}
                />
                <EquivalentsInputForm handleSetEq={setEq} />
                {
                    eq && molecularWeight ?
                        <Button
                            variant="outlined"
                            onClick={() => { console.log("Saved: ", eq, molecularWeight) }}
                        >
                            SAVE
                        </Button>
                        :
                        <Button
                            disabled
                            variant="outlined"
                        >
                            SAVE
                        </Button>

                }
            </DialogContent>
        </>
    )
}
