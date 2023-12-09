import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { GetProjectByIdHandlerResponse, ProjectWithDataBuffer } from "../../../server/routes/projects"
import { ProjectStack } from "../components/ProjectStack"

export const SubProjectPage = () => {
    let { id } = useParams()
    const [subProjects, setSubProjects] = useState<ProjectWithDataBuffer[]>([])

    useEffect(() => {
        const apiCall = async () => {
            const response = await fetch(`http://localhost:3000/projects/${id}`)
            const result: GetProjectByIdHandlerResponse = await response.json()
            const children = result.project.children ?? []
            setSubProjects(children)
        }

        apiCall()
    }, [])

    return (
        <>
            <ProjectStack title={`Subprojects`} projects={subProjects} setProjects={setSubProjects} />
        </>
    )
}
