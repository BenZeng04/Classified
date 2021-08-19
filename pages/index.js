import {db} from "../utils/firebase/firebase"
import Field from "../utils/components/field"
import Form from "../utils/components/form"
let grid = {
    1: 4
}

function getGrid() {
    return grid;
}

export default function Home() {
    return (<div>
        <Field/>
        <Form/>
    </div>)
}
