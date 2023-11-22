import { getProjects } from '../../handlers/projects'


export async function App() {

    // const projectListQuery = trpc.projectList.useQuery()
    const projects = await getProjects()

    console.log(projects)

    return (
        <div>
            Hi
            {projects.map((i) => i.name)}
        </div>
    );
}
