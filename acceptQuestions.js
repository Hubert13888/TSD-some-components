import React from "react"
import QuestionCollector from "../collectors/QuestionCollector"
import SelectCategories from "../elements/selectCategories"
import Timer from "../utilities/Timer"
import DeclineQuestion from "./declineQuestion"

const qstFields = ["Q", "A", "B", "C", "D"]

export const renewIn = {
    min: 2,
    sec: 0
},
acceptIn = {
    min: 5,
    sec: 0
}

export function deleteQuestion(id, parent){
    let q = parent.state.questions
    for(let i = 0; i < q.length; i++) {
        if(q[i]["_id"] == id) {
            parent.setState(prev => ({questions: [
                ...prev.questions.slice(0,i),
                ...prev.questions.slice(i+1)
            ]}))
            break
        }
    }
}

export function setTimerInterval(qstArr, parent) {
    qstArr.map(qst => {
        let s = `_${qst["_id"]}`
        var timer = setInterval(() => {
            let curr = parent.state["timer"+s].getTime()

            if(curr.minutes == 0 && curr.seconds == 0) {
                if(parent.state["qstClosed"+s]) {
                    deleteQuestion(qst["_id"], parent)
                    clearInterval(timer)
                }
                else {
                    parent.setState({["qstClosed"+s]: true})
                    parent.state["timer"+s].setTime(renewIn.min, renewIn.sec)
                }
            }
            else parent.setState({["time"+s]:
                        `${curr.minutes}:${curr.seconds < 10 ? 
                        `0${curr.seconds}` :
                        curr.seconds}`
                    })
        }, 500)
    })
}

export default class AcceptQuestions extends React.Component {
    state = {
        amount: 1,
        questions: []
    }

    //Dorobić później
    disableInputs(mode = true){
        if(mode){

        }
        else {

        }
    }

    render(){
        return(<>
            {this.state.questions.length ? <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Q</th>
                        <th>A</th>
                        <th>B</th>
                        <th>C</th>
                        <th>D</th>
                        <th>Timer</th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.questions.map(qst => {
                        let s = `_${qst["_id"]}`
                        return(<tr>
                                <td>{qst["_id"]}</td>
                                <td>{qst["type"]}</td>
                                <td><SelectCategories 
                                        selected={qst.belongsTo} 
                                        both={true}
                                        change={e => this.setState({['cat'+s]: e.target.value})}/></td>
                                {qstFields.map(letter => {
                                    return(<td>{!(qst.type == '2' && (letter == 'C' || letter == 'D')) ? 
                                    <input type="text" 
                                        name={letter} 
                                        value={this.state[letter+s]}
                                        onChange={e => this.setState({[letter+s]: e.target.value})}
                                    />
                                    : "-"}</td>)
                                })}
                                <td>{this.state["time"+s]}</td>
                                <td><button onClick={e => {
                                    e.preventDefault()
                                    QuestionCollector({
                                        id: qst["_id"], type: qst.type,
                                        Q: this.state['Q'+s],
                                        A: this.state['A'+s], B: this.state['B'+s],
                                        C: this.state['C'+s], D: this.state['D'+s],
                                        cat: this.state['cat'+s],
                                        option: "acceptQuestion"
                                    }).then(
                                        () => {
                                            alert("Question accepted!")
                                            deleteQuestion(qst["_id"], this)
                                        },
                                        err => console.log(err)
                                    )
                                }}>Confirm</button></td>
                                <td><DeclineQuestion 
                                    id={qst["_id"]} 
                                    success={() => {
                                        deleteQuestion(qst["_id"], this)
                                    }}
                                    error={err => {
                                        console.log(err)
                                    }}
                                /></td>
                        </tr>)
                    })}
                </tbody>
            </table> : <></>}
            <QuestionReader parent={this} option={"getNotAccepted"}/>
        </>)
    }
}

export class QuestionReader extends React.Component{
    render() {
        const parent = this.props.parent

        return(<form onSubmit={e => {
            e.preventDefault()

            let qstIdArr = []
            parent.state.questions.map(qst => qstIdArr.push(qst["_id"]))

            QuestionCollector({option: this.props.option, amount: parent.state.amount, qstIdArr,
            additional: parent.state.additional}).then(
                resp => {
                    console.log(resp)
                    if(resp.length < parent.state.amount) alert("End of proposed is reached")
                    if(resp.length == 0) return false
                    parent.setState(prev => ({
                        //set questions array
                        questions: [...prev.questions, ...resp],
                        //set initial values for inputs
                        ...(() => {
                            let initArr = {}
                            resp.map(qst => {
                                Object.keys(qst.translations.en).map(field => {
                                    initArr[`${field}_${qst["_id"]}`] = qst.translations.en[field]
                                })
                                initArr[`cat_${qst["_id"]}`] = qst.belongsTo
                            })
                            return initArr
                        })(),
                        //set timers for new questions
                        ...(() => {
                            let timersArr = {}
                            resp.map(qst => {
                                timersArr[`timer_${qst["_id"]}`] = new Timer(acceptIn.min, acceptIn.sec)
                            })
                            return timersArr
                        })()
                    }))

                    //set intervals for checking timers
                    setTimerInterval(resp, parent)
                },
                err => console.log(err) 
            )
        }}>
            <p>Get </p>
            <select onChange={e => parent.setState({amount: e.target.value})}>{(() => {
                //<Options> to pick a number of questions to get
                let optArr = []
                for(let number of [1, 2, 3, 4, 5])
                optArr.push(<option value={number}>{number} {number == 1 ? "question" : "questions"}</option>)
                return optArr
            })()}</select>
            <button>Submit</button>
        </form>)
    }
}