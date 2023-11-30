import { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { CreateProjectHandlerRequest, CreateProjectHandlerResponse, GetProjectsHandlerResponse, ProjectWithDataBuffer } from "../../../server/routes/projects"
import { Grid } from '@mui/material';

export const ProjectOverview = () => {
    const [projects, setProjects] = useState<ProjectWithDataBuffer[]>([])
    const [file, setFile] = useState<File>()

    const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = (event.target as HTMLInputElement).files
        if (files && files[0]) {
            setFile(() => files[0])
        }
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

        return await fetch(url, {
            method: "POST",
            body: formData
        })

    }

    const addProject = async () => {
        try {
            const body: CreateProjectHandlerRequest = {
                name: 'PROJECT 7',

            }
            const response = await fetch("http://localhost:3000/projects/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            })

            const newProject: CreateProjectHandlerResponse = await response.json()
            console.log("STATUS: ", response.status)
            const newP = [...projects, newProject.project]
            console.log(newProject)
            setProjects(newP)
        } catch (error) {
            console.error("Error: ", error)
        }
    }

    useEffect(() => {
        const apiCall = async () => {
            const response = await fetch("http://localhost:3000/projects")
            const result: GetProjectsHandlerResponse = await response.json()
            console.log(result)
            setProjects(result.projects)
        }

        apiCall()
    }, [])

    return (
        <Box sx={{ width: '100%' }}>
            <Stack spacing={2}>
                <div>Hello from Project Overview
                    <form onSubmit={handleSubmit}>
                        <input name="projectImage" type="file" onChange={handleFileUploadChange} />
                        <button type="submit">Upload</button>
                    </form>
                    <button onClick={() => addProject()}>Add project</button>
                    {projects.map((i, idx) => {
                        return <Paper key={idx} sx={{ flexGrow: 1, padding: 2 }}>
                            <Grid container spacing={1} >
                                <Grid item xs={5}>
                                    {i.name}
                                </Grid>
                                <Grid item xs={7}>
                                    {i.base64image ?
                                        <img src={`data:image/png;base64,${i.base64image}`} alt="image" /> : null}
                                </Grid>
                            </Grid>
                        </Paper>
                    }

                    )}
                </div>
            </Stack>
        </Box >
    )

}
