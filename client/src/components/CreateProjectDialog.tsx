import { Button, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { FormEventHandler, MouseEventHandler } from "react";

interface Props {
    file?: string;
    handleClearFile: MouseEventHandler;
    handleSubmit: FormEventHandler<HTMLFormElement>;
    handleFileUploadChange: React.ChangeEventHandler<HTMLInputElement>
}

export const CreateProjectDialog = ({ file, handleClearFile, handleSubmit, handleFileUploadChange }: Props) => {


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    Create a new project
                </DialogTitle>
                <DialogContent>
                    <TextField label="Project name"
                        autoFocus
                        margin="normal"
                        id="project-name"
                        fullWidth
                        variant="standard" />
                    <Button component="label" variant="contained">
                        {file ?
                            <Button variant="contained"
                                onClick={handleClearFile}>
                                Clear attachment
                            </Button>
                            : 'Attach reaction scheme'}
                        <input type="file"
                            hidden
                            onChange={handleFileUploadChange}
                        />
                    </Button>
                    <div>
                        {file}
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" type="submit">Create project</Button>
                </DialogActions>
            </form>
        </div>
    )
} 
