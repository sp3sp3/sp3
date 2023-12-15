import { useEffect, useState } from 'react'
import { GetTopLevelProjectsHandlerResponse, ProjectWithDataBuffer } from "../../../server/routes/projects"
import { ProjectStack } from '../components/ProjectStack';

export const ProjectOverview = () => {
    const [projects, setProjects] = useState<ProjectWithDataBuffer[]>([])

    useEffect(() => {
        const apiCall = async () => {
            const response = await fetch("http://localhost:3000/projects")
            const result: GetTopLevelProjectsHandlerResponse = await response.json()
            setProjects(result.projects)
        }

        apiCall()
    }, [])

    return (
        <>
            <ProjectStack
                title={'Projects'}
                projects={projects}
                setProjects={setProjects} />
        </>
    )
}
