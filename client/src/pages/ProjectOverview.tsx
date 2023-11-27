import { useEffect, useState } from 'react'
import { Project } from '@prisma/client'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { CreateProjectHandlerRequest, CreateProjectHandlerResponse } from "../../../server/routes/projects"

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(5),
    textAlign: 'left',
    color: theme.palette.text.primary

}));

export const ProjectOverview = () => {
    const [projects, setProjects] = useState<Project[]>([])

    const addProject = async () => {
        try {
            const body: CreateProjectHandlerRequest = {
                name: 'PROJECT 7',
                base64image: 'data:image/png;base64,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'
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
                    <button onClick={() => addProject()}>Add project</button>
                    {projects.map((i, idx) =>
                        <Item key={idx}>
                            {i.name}
                            {i.base64image ?
                                <img src={i.base64image} alt="image" /> : null}
                        </Item>
                    )}
                </div>
            </Stack>
        </Box>
    )

}
