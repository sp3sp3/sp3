import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { GetProjectByIdHandlerResponse, ProjectWithDataBuffer } from "../../../server/routes/projects"
import { ProjectStack } from "../components/ProjectStack"

export const SubProjectPage = () => {
    let { id } = useParams()
    const [parentProjects, setParentProjects] = useState<{ id: number, name: string }[]>([])
    const [subProjects, setSubProjects] = useState<ProjectWithDataBuffer[]>([])

    useEffect(() => {
        const apiCall = async () => {
            const response = await fetch(`http://localhost:3000/projects/${id}`)
            const result: GetProjectByIdHandlerResponse = await response.json()
            const children = result.project.children ?? []
            setParentProjects([...parentProjects, { id: result.project.id, name: result.project.name }])
            setSubProjects(children)
        }

        apiCall()
    }, [id])

    return (
        <>
            <ProjectStack
                title={`Subprojects`}
                projects={subProjects}
                setProjects={setSubProjects}
                pathToProject={parentProjects ?? undefined} />
        </>
    )
}
