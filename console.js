import axios from "axios"
import {useState} from "react"

const console_ = (props) => {
    let [winCont, setWinCont] = useState([
        <p>Welcome to the asynchronous console </p>,
        <p>Type "help" for help or "command -h" for help to specific command</p>, 
        <br/>
    ]);

    function addToConsole(content, prompt){
        setWinCont(prev => ([...prev, 
            prompt ? 
                <p>{props.userData.username} > {content}</p> : 
                <p>{content}</p>,
            <br/>]))
    }

    return(<>
        <div style={{whiteSpace: "pre-wrap"}}>
            {winCont}
        </div>
        <label>
            {props.userData.username} > <div>
                <form onSubmit={e => {
                    e.preventDefault()
                    if(e.target[0].value.trim() == "clear") setWinCont([])
                    addToConsole(e.target[0].value, true)
                    if(e.target[0].value.trim() == "clear") return false
                    axios({
                        method: 'post',
                        url: `/console`,
                        withCredentials: true,
                        data: new FormData(e.target)
                    }).then(res => res.data).then(
                        res => {
                            console.log(res)
                            addToConsole(res.msg.split("/$n").join("\n"), false)
                        }
                    ).catch((err) => console.log(err))
                }}>
                    <input name="command" type="text"/>
                </form>
            </div>
        </label>
    </>)
}
export default console_