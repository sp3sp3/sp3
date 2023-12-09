import { Link } from 'react-router-dom';
import { Box, Button, ButtonBase, Card, CardContent, Dialog, Divider, Typography } from '@mui/material';
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Paper';
import { CreateProjectHandlerRequest, CreateProjectHandlerResponse, ProjectWithDataBuffer } from '../../../server/routes/projects';
import React, { Dispatch, SetStateAction, SyntheticEvent, useState } from 'react'
import { CreateProjectDialog } from './CreateProjectDialog';

interface Props {
    projects: ProjectWithDataBuffer[]
    setProjects: Dispatch<SetStateAction<ProjectWithDataBuffer[]>>
    title: string
}


export const ProjectStack = ({ title, projects, setProjects }: Props) => {
    const [file, setFile] = useState<File>()
    const [open, setOpen] = useState(false)

    const openCreateProjectDialog = () => {
        setOpen(true)
    }

    const closeCreateProjectDialog = () => {
        setOpen(false)
    }


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
        }

        if (file) {
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
            const newP = [...projects, newProject.project]
            setProjects(newP)
            setOpen(false)
            setFile(undefined)
        } catch (error) {
            console.error("Error: ", error)
        }
    }

    return (
        <>
            <Stack direction="row" padding={2}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h5" textAlign="center">{title}</Typography>
                    </CardContent>
                    <Divider />
                    <Box padding={2}>
                        <Button variant="outlined"
                            onClick={openCreateProjectDialog}>
                            Create project
                        </Button>
                    </Box>
                </Card>
                <Stack spacing={10} marginRight={2}>
                </Stack>
                <Stack spacing={1} sx={{ width: '50%' }}>
                    {projects.map((i, idx) => {
                        return (
                            <ButtonBase key={idx} component={Link} to={`/projects/${i.id}`} >
                                <Container variant="outlined" sx={{ flexGrow: 1, padding: 2 }}>
                                    <Stack direction="row" spacing={10}>
                                        <Stack spacing={2}>
                                            <Stack>
                                                {i.name}
                                            </Stack>
                                            <Stack>Another info</Stack>
                                        </Stack>
                                        <Stack>
                                            {i.base64image ?
                                                <img src={`data:image/png;base64,${i.base64image}`} alt="image" /> : null}
                                        </Stack>
                                    </Stack>
                                </Container>
                            </ButtonBase>
                        )
                    }

                    )}
                </Stack>
            </Stack >
            <Dialog open={open} onClose={closeCreateProjectDialog}>
                <CreateProjectDialog
                    file={file?.name}
                    handleClearFile={handleClearFile}
                    handleFileUploadChange={handleFileUploadChange}
                    handleSubmit={handleSubmit} />
            </Dialog>
        </>
    )
}
