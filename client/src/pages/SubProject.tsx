import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { GetPathToProjectHandlerResponse, GetProjectByIdHandlerResponse, ProjectWithDataBuffer } from "../../../server/routes/projects"
import { ProjectStack } from "../components/ProjectStack"

export const SubProjectPage = () => {
    let { id } = useParams()
    const [path, setPath] = useState<{ id: number, name: string, parentId: number }[]>([])
    const [subProjects, setSubProjects] = useState<ProjectWithDataBuffer[]>([])
    const [title, setTitle] = useState('')

    useEffect(() => {
        const apiCall = async () => {
            const responseProject = await fetch(`http://localhost:3000/projects/${id}`)
            const responsePath = await fetch(`http://localhost:3000/projects/pathToProject/${id}`)
            const resultProject: GetProjectByIdHandlerResponse = await responseProject.json()
            const resultPath: GetPathToProjectHandlerResponse = await responsePath.json()
            const children = resultProject.project.children ?? []
            setSubProjects(children)
            // path comes as leaf to root -- reverse it for the component so that it renders
            // with the root at the top and leaf at the bottom
            // don't show the current project
            setPath(resultPath.path.reverse().slice(0, -1))
            setTitle(resultProject.project.name)
        }

        apiCall()
    }, [id])

    return (
        <>
            <ProjectStack
                parentProjectId={id}
                title={title}
                projects={subProjects}
                setProjects={setSubProjects}
                pathToProject={path ?? undefined} />
        </>
    )
}
