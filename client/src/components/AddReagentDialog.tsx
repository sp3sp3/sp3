import LaunchIcon from '@mui/icons-material/Launch';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { Alert, Autocomplete, Button, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Snackbar, Stack, TextField, Typography } from "@mui/material"
import { ChangeEvent, Dispatch, SetStateAction, SyntheticEvent, useEffect, useState } from "react"
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure"
import { ReactionSchemeLocation } from "@prisma/client"
import { AddReagentHandlerRequest, AddReagentHandlerResponse, GetReagentHandlerResponse, GetSimilarReagentsByNameHandlerResponse } from "../../../server/routes/reagents"
import { AssignReagentToExperimentHandlerRequest, AssignReagentToExperimentHandlerResponse } from "../../../server/routes/experiments"

const NUMBER_INPUT_ERROR_MSG = "Please enter a valid number without commas, and use a decimal point if needed"

interface NameInputFormProps {
    setReagentName: Dispatch<SetStateAction<string | undefined>>
    setCanonicalSMILES: Dispatch<SetStateAction<string | undefined>>
    setMolecularWeightString: Dispatch<SetStateAction<string | undefined>>
    setDensityFoundInPubChem: Dispatch<SetStateAction<boolean>>
    setDensity: Dispatch<SetStateAction<string | undefined>>
}

const NameInputForm = ({ setReagentName, setCanonicalSMILES, setMolecularWeightString, setDensityFoundInPubChem, setDensity }: NameInputFormProps) => {
    const [inputName, setInputName] = useState<string>()
    const [NameHelperText, setNameHelperText] = useState<string>()
    const [options, setOptions] = useState<string[]>([])
    const [queryResults, setQueryResults] = useState<GetSimilarReagentsByNameHandlerResponse>()

    const searchReagents = async (query: string) => {
        const response = await fetch(`http://localhost:3000/reagents/getSimilarReagentsByName?name=${query}`)
        const result: GetSimilarReagentsByNameHandlerResponse = await response.json()
        if (result.reagents) {
            setOptions(result.reagents.map((i) => i.name ?? ''))
            setQueryResults(result)
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
            setInputName('')
        }
    }

    const checkIfDensityInPubChem = async (cid: string) => {
        const pugViewResponse = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON`)
        const pugViewJSON = await pugViewResponse.json()
        const chemPhysProps = pugViewJSON.Record.Section.find((i: any) => i.TOCHeading === "Chemical and Physical Properties")
        const experimentalProperties = chemPhysProps.Section.find((i: any) => i.TOCHeading === "Experimental Properties")
        if (!experimentalProperties) {
            return false
        }
        if (experimentalProperties.Section.find((i: any) => i.TOCHeading === "Density")) {
            return true
        }
        return false

    }

    useEffect(() => {
        // recalculate things whenever input is changed
        // if there is no input
        if (inputName === '') {
            // reset the fields
            setNameHelperText('')
            setCanonicalSMILES('')
            setReagentName('')
            setMolecularWeightString('')
            setDensity('')
            setDensityFoundInPubChem(false)
        }
        setReagentName(inputName)


    }, [inputName])

    return (
        <>
            <Tooltip
                title="Automatically searches your database for reagents with a similar name. 
                Alternatively, the program can search PubChem for a compound by this name."
                placement="right"
            >
                <Autocomplete
                    options={options}
                    freeSolo={true}
                    onInputChange={onInputChange}
                    fullWidth
                    id="molecule-name"
                    onChange={(_, value) => {
                        const match = queryResults?.reagents.find((i) => i.name === value)
                        setCanonicalSMILES(match?.canonicalSMILES)
                        setReagentName(match?.name ?? undefined)
                        setMolecularWeightString(match?.molecularWeight.toString())
                        setDensity(match?.density?.toString())
                    }}
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
                                    <InfoIcon />
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
            </Tooltip>
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
                    setDensity('')
                    if (response.status === 404) {
                        setNameHelperText('Not found in PubChem')
                        setCanonicalSMILES('')
                        setMolecularWeightString('')
                    } else {
                        const result: PubChemResponse = await response.json()
                        const pcProperties = result.PropertyTable.Properties[0]
                        const pubchemSMILES = pcProperties.CanonicalSMILES
                        const cid = pcProperties.CID
                        // check if there is a density in its pub chem properties 
                        // if there is, just make a link for the user to click and inspect the data
                        setDensityFoundInPubChem(await checkIfDensityInPubChem(cid))
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
    setMolecularWeightFormValid: Dispatch<SetStateAction<boolean>>
}
const MolecularWeightInputForm = ({ molecularWeight, setMolecularWeight, setMolecularWeightFormValid }: MolecularWeightInputFormProps) => {
    const [mwHelperText, setMWHelperText] = useState<string>()

    useEffect(() => {
        if (molecularWeight && isNaN(Number(molecularWeight))) {
            setMWHelperText(NUMBER_INPUT_ERROR_MSG)
        } else {
            setMolecularWeightFormValid(true)
        }

    }, [molecularWeight])
    return (
        <>
            <TextField
                label="Molecular Weight (g/mol)"
                error={mwHelperText === NUMBER_INPUT_ERROR_MSG ? true : false}
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
                    const numVal = Number(val)
                    if (isNaN(numVal)) {
                        setMWHelperText(NUMBER_INPUT_ERROR_MSG)
                        setMolecularWeightFormValid(false)
                    } else {
                        setMWHelperText("")
                        setMolecularWeightFormValid(true)
                    }
                    setMolecularWeight(val)
                }}
            />
        </>
    )
}

interface DensityInputFormProps {
    setDensity: Dispatch<SetStateAction<string | undefined>>
    setDensityFormValid: Dispatch<SetStateAction<boolean>>
    densityFoundInPubChem: boolean
    reagentName?: string
    density?: string
}
const DensityInputForm = ({ setDensity, setDensityFormValid, densityFoundInPubChem, reagentName, density }: DensityInputFormProps) => {
    const [densityHelperText, setDensityHelperText] = useState<string>('')
    return (
        <>
            <Tooltip
                title="PubChem can be searched for experimental values of density for this compound using the chemical name."
            >
                <TextField
                    value={density ?? ''}
                    InputLabelProps={{ shrink: density ? true : false }}
                    label={
                        <Grid
                            container
                            spacing={0}
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                        >

                            <Typography variant="body1">
                                Density (g/mL)
                            </Typography>
                            <InfoIcon />
                        </Grid>
                    }
                    autoFocus
                    margin="normal"
                    error={densityHelperText === NUMBER_INPUT_ERROR_MSG ? true : false}
                    id="density"
                    fullWidth
                    variant="standard"
                    helperText={densityHelperText}
                    onChange={(event) => {
                        const val = event.target.value
                        const numVal = Number(val)
                        if (isNaN(numVal)) {
                            setDensityHelperText(NUMBER_INPUT_ERROR_MSG)
                            setDensityFormValid(false)
                        } else {
                            setDensityFormValid(true)
                            setDensityHelperText("")
                        }

                        setDensity(val)
                    }}
                />
            </Tooltip>
            {densityFoundInPubChem && reagentName ?
                <Button target="_blank" href={`https://pubchem.ncbi.nlm.nih.gov/compound/${reagentName}#section=Density`} >
                    <Tooltip title="View density info on PubChem">
                        <LaunchIcon></LaunchIcon>
                    </Tooltip>
                </Button>
                :
                null}
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
        error={eqHelperText === NUMBER_INPUT_ERROR_MSG ? true : false}
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
                setEqHelperText(NUMBER_INPUT_ERROR_MSG)
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


interface AddReagentDialogProps {
    setOpen: Dispatch<SetStateAction<boolean>>
}
export const AddReagentDialog = ({ setOpen }: AddReagentDialogProps) => {
    const [eq, setEq] = useState<number>()
    const [reagentName, setReagentName] = useState<string>()
    const [canonicalSMILES, setCanonicalSMILES] = useState<string>()
    // set mw and density as string because populating the value of textfield programatically 
    // can end up switching up the types from number to string. This causes decimal
    // points not able to be typed in after user types something that is NaN
    const [molecularWeightString, setMolecularWeightString] = useState<string>()
    const [density, setDensity] = useState<string>()
    // because mw is a string, need to flag if it is ok as a number. If ok, then allow save
    const [molecularWeightFormValid, setMolecularWeightFormValid] = useState<boolean>(false)
    // need a flag for if density if valid because density is optional
    // equivalents are mandatory, so if eq becomes NaN, then the boolean check for 
    // saving fails there because NaN is falsey
    const [densityFormValid, setDensityFormValid] = useState<boolean>(true)
    const [densityFoundInPubChem, setDensityFoundInPubChem] = useState<boolean>(false)
    const [reactionSchemeLocation, setReactionSchemeLocation] = useState<ReactionSchemeLocation>()
    const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false)
    const [successfulAdd, setSuccessfulAdd] = useState<boolean>()
    const [errorMsg, setErrorMsg] = useState<string>()

    const saveReagentToBackend = async () => {
        // check if this reagent exists already
        const reagentResponse = await fetch(`http://localhost:3000/reagents/?smiles=${canonicalSMILES}`)
        const reagentResult: GetReagentHandlerResponse = await reagentResponse.json()

        let reagentId: number
        if (!reagentResult.reagent) {
            const reagentToAdd: AddReagentHandlerRequest = {
                reagentName: reagentName,
                canonicalSMILES: canonicalSMILES,
                molecularWeight: Number(molecularWeightString),
                density: density ? Number(density) : undefined
            }
            // if the reagent does not yet exist in the DB, need to create it
            const addReagentResponse = await fetch(`http://localhost:3000/reagents/addReagent`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reagentToAdd)
            })

            const addReagentResult: AddReagentHandlerResponse = await addReagentResponse.json()
            reagentId = addReagentResult.reagent.id
        } else {
            reagentId = reagentResult.reagent.id
        }

        // assign the reagent to the experiment
        // the form has been validated by the SAVE button logic, 
        // here the check is to typeguard
        if (reactionSchemeLocation && eq) {
            const reagentToAssign: AssignReagentToExperimentHandlerRequest = {
                reagentId: reagentId.toString(),
                experimentId: "1",
                reactionSchemeLocation: reactionSchemeLocation,
                equivalents: eq,
            }

            const assignReagentToExptAPIReq = await fetch(`http://localhost:3000/experiments/assignReagentToExperiment`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reagentToAssign)
            })

            // console.log(assignReagentToExptAPIReq)
            const assignResponse: AssignReagentToExperimentHandlerResponse = await assignReagentToExptAPIReq.json()
            if (assignReagentToExptAPIReq.status === 200) {
                setSuccessfulAdd(true)
            } else {
                if (assignResponse.toString().includes(`Reagent ${reagentId} already assigned to experiment`)) {
                    setErrorMsg(`${reagentName} already assigned to this experiment`)
                }
                setSuccessfulAdd(false)
            }
            setSnackBarOpen(true)
        }
    }

    useEffect(() => { }, [molecularWeightString])
    return (
        <>
            <DialogTitle>
                Add reagent
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Typography variant="body2">
                        If the molecule has a well known name, try search for it on PubChem and automatically get the SMILES and molecular weight.
                        Otherwise, you can manually enter the values you need for your reagent.
                    </Typography>
                </DialogContentText>
                <Stack direction="row" spacing={2}>
                    <Stack direction="column" spacing={2} sx={{ width: '100%' }} >
                        <NameInputForm
                            setReagentName={setReagentName}
                            setCanonicalSMILES={setCanonicalSMILES}
                            setMolecularWeightString={setMolecularWeightString}
                            setDensityFoundInPubChem={setDensityFoundInPubChem}
                            setDensity={setDensity}
                        />
                        <SMILESInputForm
                            canonicalSMILES={canonicalSMILES}
                            setCanonicalSMILES={setCanonicalSMILES}
                            setMolecularWeightString={setMolecularWeightString}
                        />
                        <Stack direction="row" spacing={3}>
                            <MolecularWeightInputForm
                                molecularWeight={molecularWeightString}
                                setMolecularWeight={setMolecularWeightString}
                                setMolecularWeightFormValid={setMolecularWeightFormValid}
                            />
                            <DensityInputForm
                                setDensity={setDensity}
                                setDensityFormValid={setDensityFormValid}
                                densityFoundInPubChem={densityFoundInPubChem}
                                reagentName={reagentName}
                                density={density}
                            />
                        </Stack>
                        <EquivalentsInputForm handleSetEq={setEq} />
                        <ReactionSchemeLocationForm setReactionSchemeLocation={setReactionSchemeLocation} />
                        {
                            (canonicalSMILES || reagentName) && densityFormValid && eq && molecularWeightString && molecularWeightFormValid && reactionSchemeLocation ?
                                <Button
                                    variant="outlined"
                                    onClick={async () => await saveReagentToBackend()}
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
                <Snackbar open={snackBarOpen}>
                    {
                        successfulAdd ?
                            <Alert
                                onClose={() => setOpen(false)}
                                severity="success">Reagent successfully added!</Alert>
                            :
                            <Alert
                                onClose={() => setSnackBarOpen(false)}
                                severity="error">Error adding reagent: {errorMsg}</Alert>
                    }
                </Snackbar>
            </DialogContent>
        </>
    )
}
