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
                name: 'PROJECT 7'
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
                        </Item>
                    )}
                </div>
            </Stack>
        </Box>
    )

}
