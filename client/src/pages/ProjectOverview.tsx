import React, { SyntheticEvent, useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box';
import Container from '@mui/material/Paper';
import { CreateProjectHandlerRequest, CreateProjectHandlerResponse, GetProjectsHandlerResponse, ProjectWithDataBuffer } from "../../../server/routes/projects"
import { Button, Dialog, Grid } from '@mui/material';
import { CreateProjectDialog } from '../components/CreateProjectDialog';

export const ProjectOverview = () => {
    const [projects, setProjects] = useState<ProjectWithDataBuffer[]>([])
    const [file, setFile] = useState<File>()
    const [open, setOpen] = useState(false)

    const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = (event.target as HTMLInputElement).files
        if (files && files[0]) {
            setFile(() => files[0])
        }
    }

    const handleClearFile = (event: SyntheticEvent) => {
        event.preventDefault()
        setFile(undefined)
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        const url = 'http://localhost:3000/projects/'
        const formData = new FormData()

        const bodyFieldsForAddingProject: CreateProjectHandlerRequest = {
            name: 'TEST NAME',
            parentId: null,
        }

        if (file) {
            console.log(new Blob([file], { type: 'application/octet-stream' }))

            formData.append('projectImage',
                new Blob(
                    [file], { type: 'application/octet-stream' }
                ))

        }

        for (const [key, value] of Object.entries(bodyFieldsForAddingProject)) {
            formData.append(key, value)
        }


        try {
            const response = await fetch(url, {
                method: "POST",
                body: formData
            })
            const newProject: CreateProjectHandlerResponse = await response.json()
            console.log("STATUS: ", response.status)
            const newP = [...projects, newProject.project]
            console.log(newProject)
            setProjects(newP)
            setOpen(false)
            setFile(undefined)
        } catch (error) {
            console.error("Error: ", error)
        }
    }

    const openCreateProjectDialog = () => {
        setOpen(true)
    }

    const closeCreateProjectDialog = () => {
        setOpen(false)
    }


    useEffect(() => {
        const apiCall = async () => {
            const response = await fetch("http://localhost:3000/projects")
            const result: GetProjectsHandlerResponse = await response.json()
            setProjects(result.projects)
        }

        apiCall()
    }, [])

    return (
        <Box sx={{ width: '100%', padding: 1 }}>
            <div>
                Projects
                <Button variant="outlined"
                    onClick={openCreateProjectDialog}>
                    Create project
                </Button>
                <Dialog open={open} onClose={closeCreateProjectDialog}>
                    <CreateProjectDialog
                        file={file?.name}
                        handleClearFile={handleClearFile}
                        handleFileUploadChange={handleFileUploadChange}
                        handleSubmit={handleSubmit} />
                </Dialog>
                <Stack spacing={1} sx={{ width: '50%' }}>
                    {projects.map((i, idx) => {
                        return <Container key={idx} variant="outlined" sx={{ flexGrow: 1, padding: 2 }}>
                            <Grid container>
                                <Grid item xs={5}>
                                    <Grid>
                                        {i.name}
                                    </Grid>
                                    <Grid>Another info</Grid>
                                </Grid>
                                <Grid>
                                    {i.base64image ?
                                        <img src={`data:image/png;base64,${i.base64image}`} alt="image" /> : null}
                                </Grid>
                            </Grid>
                        </Container>
                    }

                    )}
                </Stack>
            </div>
        </Box >
    )

}
