import { useState } from "react"
import { AddReagentDialog } from "./AddReagentDialog"
import { Button, Dialog } from "@mui/material"


export const ReagentTable = () => {
    const [open, setOpen] = useState(false)

    const openAddReagentDialog = () => {
        setOpen(true)
    }

    const closeAddReagentDialog = () => {
        setOpen(false)
    }

    return (
        <>
            <Button variant="outlined"
                onClick={openAddReagentDialog}>
                ADD REAGENT
            </Button>
            <Dialog
                open={open}
                onClose={closeAddReagentDialog}
                fullWidth={true}
                maxWidth='xl'
            >
                <AddReagentDialog />
            </Dialog>


        </>

    )
}
