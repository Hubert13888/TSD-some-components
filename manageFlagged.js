import React from "react"
import QuestionCollector from "../collectors/QuestionCollector"
import {QuestionReader, deleteQuestion} from "./acceptQuestions"
import ModifyQuestions from "./modifyQuestion"

export default class ManageFlagged extends React.Component {
    state = {
        amount: 1,
        questions: []
    }

    render() {
        return(<>
            <table>
                <thead>
                    <tr>
                        <th>Flags</th>
                        <th>Question Data</th>
                        <th>Timer</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.questions.map(qst => {
                        return(<>
                            <tr>
                                <td>{qst.flags.map(flag => {
                                    return(<p>{flag.lang} -- {flag.reason} -- by {flag.user}</p>)
                                })}</td>
                                <td><ModifyQuestions {...this.props} id={qst["_id"]}/></td>
                                <td>{this.state['time_'+qst["_id"]]}</td>
                                <td><button onClick={e => {
                                    e.preventDefault()
                                    QuestionCollector({id: qst["_id"], option: "flaggedModified"}).then(
                                        () => {
                                            alert("Changes have been accepted!")
                                            deleteQuestion(qst["_id"], this)
                                        },
                                        err => console.log(err)
                                    )
                                }}>Accept</button></td>
                                <td><button onClick={e => {
                                    e.preventDefault()
                                    deleteQuestion(qst["_id"], this)
                                }}>Close</button></td>
                            </tr>
                        </>)
                    })}
                </tbody>
            </table>
            <QuestionReader parent={this} option={"getFlagged"}/>
        </>)
    }
}