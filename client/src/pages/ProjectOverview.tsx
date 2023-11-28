import { useEffect, useState } from 'react'
import { Project } from '@prisma/client'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { CreateProjectHandlerRequest, CreateProjectHandlerResponse, GetProjectsHandlerResponse } from "../../../server/routes/projects"
import { Grid } from '@mui/material';

export const ProjectOverview = () => {
    const [projects, setProjects] = useState<GetProjectsHandlerResponse>([])
    const [file, setFile] = useState<File>()

    const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = (event.target as HTMLInputElement).files
        if (files && files[0]) {
            setFile(() => files[0])
        }
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        const url = 'http://localhost:3000/projects/uploadImage'
        const formData = new FormData()
        if (file) {
            console.log(new Blob([file], { type: 'application/octet-stream' }))

            // formData.append('projectImage', file)
            formData.append('projectId', '3')
            formData.append('name', 'TEST NAME')
            formData.append('projectImage', new Blob(
                [file], { type: 'application/octet-stream' }
            ))
            return await fetch(url, {
                method: "POST",
                body: formData
            })

        }

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

    const arrayBufferToBase64 = (buffer: ArrayBufferLike) => {
        let binary = ''
        let bytes = new Uint8Array(buffer)
        let len = bytes.byteLength
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i])
        }

        return btoa(binary)
    }


    useEffect(() => {
        const apiCall = async () => {
            const response = await fetch("http://localhost:3000/projects")
            const result: { "projects": Project[] } = await response.json()
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
                        let base64image: string = ''
                        if (i.image) {
                            const k = arrayBufferToBase64(i.image.data)

                            base64image = `data:image/png;base64,${k}`
                        }

                        return <Paper key={idx} sx={{ flexGrow: 1, padding: 2 }}>
                            <Grid container spacing={1} >
                                <Grid item xs={5}>
                                    {i.name}
                                </Grid>
                                <Grid item xs={7}>
                                    {i.image ?
                                        <img src={base64image} alt="image" /> : null}
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
