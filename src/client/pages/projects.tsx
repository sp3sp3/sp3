import { useEffect, useState } from "react";
import { getProjects } from "../../handlers/projects";
import { Project } from "@prisma/client";



export default function ProjectPage() {
    const [projects, setProjects] = useState<Project[]>([])

    useEffect(() => {
        const apiCall = async () => {
            const projectsInDB = await getProjects();
            console.log(projectsInDB);
            setProjects(projectsInDB)
        }

        apiCall()
    }, [])



    return (<div>{projects.map((i) => i.name)}</div>)


};

