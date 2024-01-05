import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { Autocomplete, Button, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Stack, TextField, Typography } from "@mui/material"
import { ChangeEvent, Dispatch, SetStateAction, SyntheticEvent, useEffect, useState } from "react"
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure"
import { ReactionSchemeLocation } from "@prisma/client"
import { GetSimilarReagentsByNameHandlerResponse } from "../../../server/routes/reagents"


interface NameInputFormProps {
    setReagentName: Dispatch<SetStateAction<string | undefined>>
    setCanonicalSMILES: Dispatch<SetStateAction<string | undefined>>
    setMolecularWeightString: Dispatch<SetStateAction<string | undefined>>
}

const NameInputForm = ({ setReagentName, setCanonicalSMILES, setMolecularWeightString }: NameInputFormProps) => {
    const [inputName, setInputName] = useState<string>()
    const [NameHelperText, setNameHelperText] = useState<string>()
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
            setInputName(value)
        } else {
            setOptions([])
        }
    }

    useEffect(() => {
        // recalculate things whenever input is changed
        // if there is no input
        if (inputName === '') {
            setNameHelperText('')
            setCanonicalSMILES('')
            setReagentName('')
        }
        setReagentName(inputName)


    }, [inputName])

    return (
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
                        helperText={NameHelperText}
                        margin="normal"
                        autoFocus
                        fullWidth
                        FormHelperTextProps={{
                            error: true
                        }}
                        variant="standard" />
                )}
            />
            <Button
                variant='contained'
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
                    const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${inputName}/property/MolecularWeight,CanonicalSMILES/json`,)
                    if (response.status === 404) {
                        setNameHelperText('Not found in PubChem')
                        setCanonicalSMILES('')
                        setMolecularWeightString('')
                    } else {
                        const result: PubChemResponse = await response.json()
                        const pcProperties = result.PropertyTable.Properties[0]
                        const pubchemSMILES = pcProperties.CanonicalSMILES

                        setMolecularWeightString(pcProperties.MolecularWeight)
                        const mol = window.RDKit.get_mol(pubchemSMILES)
                        const canonicalized = mol?.get_smiles()
                        if (canonicalized) {
                            setCanonicalSMILES(canonicalized)
                        }
                        setNameHelperText('')
                    }
                }}
            >Search name on PubChem</Button>
        </>
    )
}


interface SMILESInputProps {
    canonicalSMILES?: string
    setCanonicalSMILES: Dispatch<SetStateAction<string | undefined>>
    setMolecularWeightString: Dispatch<SetStateAction<string | undefined>>
}

// process the input and output a canonicalSMILES and molecular weight to the parent component
// accepts either SMILES or the name of the reagent
// if SMILES is entered, MW is calculated with RDKit
// if name is entered, the molecule can be searched for on PubChem, and the MW populated from PubChem's response
const SMILESInputForm = ({
    canonicalSMILES,
    setCanonicalSMILES,
    setMolecularWeightString
}: SMILESInputProps) => {
    const [inputSMILES, setInputSMILES] = useState<string>()
    const [SMILESHelperText, setSMILESHelperText] = useState<string>()


    useEffect(() => {
        // recalculate things whenever input is changed
        // if there is no input
        if (inputSMILES === '') {
            setSMILESHelperText('')
            setCanonicalSMILES('')
        } else {
            if (inputSMILES) {
                const mol = window.RDKit.get_mol(inputSMILES)
                if (mol?.is_valid) {
                    setCanonicalSMILES(mol.get_smiles())
                    const desc = mol?.get_descriptors()
                    if (desc) {
                        const jsonDesc = JSON.parse(desc)
                        setMolecularWeightString(jsonDesc.exactmw)
                    }
                } else {
                    setSMILESHelperText('Invalid SMILES')
                    setMolecularWeightString(undefined)
                }
            }
            else {
                setSMILESHelperText('')
            }
        }
    }, [inputSMILES])


    return (
        <>
            <Stack>
                <TextField
                    label="Molecule SMILES"
                    value={canonicalSMILES}
                    InputLabelProps={{ shrink: canonicalSMILES ? true : false }}
                    autoFocus
                    margin="normal"
                    id="molecule-smiles"
                    fullWidth
                    variant="standard"
                    helperText={SMILESHelperText}
                    onChange={(event) => { setInputSMILES(event.target.value) }}
                />
            </Stack>
        </>
    )
}

interface MolecularWeightInputFormProps {
    molecularWeight?: string;
    setMolecularWeight: Dispatch<SetStateAction<string | undefined>>
}
const MolecularWeightInputForm = ({ molecularWeight, setMolecularWeight }: MolecularWeightInputFormProps) => {
    const [mwHelperText, setMWHelperText] = useState<string>()
    return (
        <>
            <TextField
                label="Molecular Weight (g/mol)"
                value={molecularWeight}
                autoFocus
                InputLabelProps={{ shrink: molecularWeight ? true : false }}
                helperText={mwHelperText}
                margin="normal"
                id="mw"
                fullWidth
                variant='standard'
                onChange={(event) => {
                    const val = event.target.value
                    console.log("val: ", typeof val)
                    const numVal = Number(val)
                    console.log(numVal)
                    if (isNaN(numVal)) {
                        setMWHelperText("Please enter a valid number without commas, and use a decimal point if needed")
                    } else {
                        setMWHelperText("")
                    }
                    setMolecularWeight(val)
                }}
            />
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
    setReactionSchemeLocation: Dispatch<SetStateAction<ReactionSchemeLocation | undefined>>
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
    const [reagentName, setReagentName] = useState<string>()
    const [canonicalSMILES, setCanonicalSMILES] = useState<string>()
    // set this as string because populating the value of textfield programatically 
    // can end up switching up the types from number to string. This causes decimal
    // points not able to be typed in after user types something that is NaN
    const [molecularWeightString, setMolecularWeightString] = useState<string>()
    const [reactionSchemeLocation, setReactionSchemeLocation] = useState<ReactionSchemeLocation>()

    //TODO: remove toggle. THe user should be able to input name and SMILES for things that are not in pubchem
    // right now, if they put smiles, they cannot assign a name
    // the pubchem search should populate the fields
    // but pubchem may not have the compound of interest
    // also allow user to input MW
    // and density
    useEffect(() => { }, [molecularWeightString])
    return (
        <>
            <DialogTitle>
                Add reagent
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    If the molecule has a well known name, try search for it on PubChem and automatically get the SMILES and molecular weight.
                    Otherwise, you can manually enter the values you need for your reagent.
                </DialogContentText>
                <Stack direction="row" spacing={2}>
                    <Stack direction="column" spacing={2} sx={{ width: '100%' }} >
                        <NameInputForm
                            setReagentName={setReagentName}
                            setCanonicalSMILES={setCanonicalSMILES}
                            setMolecularWeightString={setMolecularWeightString} />
                        <SMILESInputForm
                            canonicalSMILES={canonicalSMILES}
                            setCanonicalSMILES={setCanonicalSMILES}
                            setMolecularWeightString={setMolecularWeightString}
                        />
                        <MolecularWeightInputForm
                            molecularWeight={molecularWeightString}
                            setMolecularWeight={setMolecularWeightString}
                        />
                        <EquivalentsInputForm handleSetEq={setEq} />
                        <ReactionSchemeLocationForm setReactionSchemeLocation={setReactionSchemeLocation} />
                        {
                            eq && molecularWeightString && reactionSchemeLocation ?
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        console.log(`name: ${reagentName}, SMILES: ${canonicalSMILES}, eq: ${eq}, mw: ${molecularWeightString}, loc: ${reactionSchemeLocation}`)
                                    }}
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
                                    width={300}
                                    height={300}
                                    svgMode
                                />
                                {molecularWeightString ?
                                    <>
                                        MW: {molecularWeightString} g/mol
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
