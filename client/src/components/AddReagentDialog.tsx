import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { Autocomplete, Button, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { ChangeEvent, Dispatch, SetStateAction, SyntheticEvent, useEffect, useState } from "react"
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure"
import { ReactionSchemeLocation } from "@prisma/client"
import { GetSimilarReagentsByNameHandlerResponse } from "../../../server/routes/reagents"


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
    setCanonicalSMILES,
    setMolecularWeight
}: MoleculeInputProps) => {
    const [moleculeInput, setMoleculeInput] = useState<string>('')
    // const [moleculeInputName, setMoleculeInputName] = useState<string>('')
    const [helperText, setHelperText] = useState<string>()
    const [options, setOptions] = useState<string[]>([])


    const searchReagents = async (query: string) => {
        const response = await fetch(`http://localhost:3000/reagents/getSimilarReagentsByName?name=${query}`)
        const result: GetSimilarReagentsByNameHandlerResponse = await response.json()
        if (result.reagents) {
            setOptions(result.reagents.map((i) => i.name ?? ''))
        } else {
            setOptions([])
        }
    }

    const onInputChange = (_: SyntheticEvent<Element, Event>, value: string) => {
        if (value) {
            searchReagents(value)
        } else {
            setOptions([])
        }
    }

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
                    }
                } else {
                    setHelperText('Invalid SMILES')
                    setMolecularWeight(undefined)
                }
            }
            else {
                setHelperText('')
            }
        }
    }, [moleculeInput])


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
                            <Autocomplete
                                options={options}
                                freeSolo={true}
                                onInputChange={onInputChange}
                                fullWidth
                                id="molecule-name"
                                renderInput={(params) => (
                                    <TextField {...params}
                                        InputLabelProps={{ style: { pointerEvents: "auto" } }}
                                        label={
                                            <Grid
                                                container
                                                spacing={0}
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Typography variant="body1">
                                                    Molecule name
                                                </Typography>
                                                <Tooltip title="Automatically searches your database for reagents with a similar name. ">
                                                    <InfoIcon />
                                                </Tooltip>
                                            </Grid>
                                        }
                                        helperText={helperText}
                                        margin="normal"
                                        autoFocus
                                        fullWidth
                                        onChange={async (event) => {
                                            setMoleculeInput(event.target.value)
                                        }}
                                        variant="standard" />
                                )}
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
                                    } else {
                                        const result: PubChemResponse = await response.json()
                                        const pcProperties = result.PropertyTable.Properties[0]
                                        const pubchemSMILES = pcProperties.CanonicalSMILES

                                        setMolecularWeight(Number(pcProperties.MolecularWeight))
                                        const mol = window.RDKit.get_mol(pubchemSMILES)
                                        const canonicalized = mol?.get_smiles()
                                        if (canonicalized) {
                                            setCanonicalSMILES(canonicalized)
                                        }
                                    }
                                }}
                            >Search on PubChem</Button>
                        </>
                    )
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


interface ReactionSchemeLocationFormProps {
    setReactionSchemeLocation: Dispatch<SetStateAction<ReactionSchemeLocation>>
}
const ReactionSchemeLocationForm = ({ setReactionSchemeLocation }: ReactionSchemeLocationFormProps) => {

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setReactionSchemeLocation(event.target.value as ReactionSchemeLocation)
    }

    return (<FormControl>
        <FormLabel id="reaction-scheme-location-radio-group" sx={{ fontSize: 12 }}>Location of reagent in reaction scheme</FormLabel>
        <RadioGroup
            row
            aria-labelledby="reaction-scheme-location-radio-group"
            name="row-radio-buttons-group"
            onChange={handleChange}
        >
            <FormControlLabel value={ReactionSchemeLocation.LEFT_SIDE} control={<Radio />} label="Left side" />
            <FormControlLabel value={ReactionSchemeLocation.ABOVE_ARROW} control={<Radio />} label="Above arrow" />
            <FormControlLabel value={ReactionSchemeLocation.BELOW_ARROW} control={<Radio />} label="Below arrow" />
            <FormControlLabel value={ReactionSchemeLocation.RIGHT_SIDE} control={<Radio />} label="Right side" />
        </RadioGroup>
    </FormControl>)
}


export const AddReagentDialog = () => {
    const [eq, setEq] = useState<number>()
    const [moleculeInputType, setMoleculeInputType] = useState<string>('SMILES')
    const [canonicalSMILES, setCanonicalSMILES] = useState<string>()
    const [molecularWeight, setMolecularWeight] = useState<number>()
    const [reactionSchemeLocation, setReactionSchemeLocation] = useState<ReactionSchemeLocation>("LEFT_SIDE")

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
                <Stack direction="row" spacing={2}>
                    <Stack direction="column" spacing={2} sx={{ width: '100%' }} >
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
                            setCanonicalSMILES={setCanonicalSMILES}
                            setMolecularWeight={setMolecularWeight}
                        />
                        <EquivalentsInputForm handleSetEq={setEq} />
                        <ReactionSchemeLocationForm setReactionSchemeLocation={setReactionSchemeLocation} />
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
                    </Stack>
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        {canonicalSMILES ?
                            <>
                                <MoleculeStructure
                                    id="molecule-structure"
                                    structure={canonicalSMILES}
                                    width={150}
                                    height={150}
                                    svgMode
                                />
                                {molecularWeight ?
                                    <>
                                        MW: {molecularWeight} g/mol
                                    </> :
                                    null
                                }
                            </>
                            : null
                        }
                    </Grid>
                </Stack>
            </DialogContent>
        </>
    )
}
