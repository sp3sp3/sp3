import { useParams } from "react-router-dom"

export const SubProjectPage = () => {
    let { id } = useParams()

    return (
        <div>Hello from subproject {id}</div>
    )
}
