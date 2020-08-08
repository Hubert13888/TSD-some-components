"use strict"
import React, {Component} from 'react'
import axios from 'axios'

import Validators from "./collectors/Validators"
import LoginOffline from './elements/loginOffline'

export default class LoginForm extends Component {
    state = {
        disableSubmit: true,

        disableInputs: false,
        disableButton: false,

        exceptions: {
            email: this.props.predefined.email,
            password: this.props.predefined.password
        },
        exceptionsToShow: {}
    }

    async submitForm(e) {
        e.preventDefault()
        var target = e.target
        Promise.all([this.state.exceptions.email, this.state.exceptions.password]).then(
            resps => {
                let accept = true
                for(let resp of resps) if(resp) accept = false
                if(accept) {
                    let formData = new FormData(target)
                    this.setState({disableButton: true, disableInputs: true})

                    return new Promise((resolve, reject) => {
                        grecaptcha.ready(() => {
                            grecaptcha.execute(this.props.serverData.siteKey).then(async (token) => {
                                formData.append("token", token)
                                await axios({
                                    method: "POST",
                                    url: "/login",
                                    data: formData
                                }).then(res => res.data)
                                    .then((response) => {
                                        if (response.err) {
                                            this.setObjectInState("exceptionsToShow", {"fatal": this.props.langPack[response.msg]})
                                            return reject()
                                        }
                                        return resolve()
                                    }).catch((err) => {
                                        //Need to log err
                                        this.setObjectInState("exceptionsToShow", {"fatal": this.props.langPack.E1002})
                                        return reject()
                                    })
                            })
                        })
                    }).then(
                        () => {
                            location.reload()
                        },
                        () => {
                            for (let input of target) {
                                if (!input.type) return (false)
                                if (input.type == "password") input.value = ""
                                if (input.type == "checkbox") input.checked = false

                                this.setState({disableButton: false, disableInputs: false})
                            }
                        }
                    )
                }
                else {
                    this.setObjectInState("exceptionsToShow", {"fatal": this.props.langPack.WRONGEMAILORPASSWORD})
                    for (let input of target) {
                        if (!input.type) return (false)
                        if (input.type == "password") input.value = ""
                        if (input.type == "checkbox") input.checked = false
                    }
                }
            }
        )
    }

    setObjectInState(inStateObjectName, toSave) {
        let inStateObject = this.state[inStateObjectName]
        Object.assign(inStateObject, toSave)
        this.setState({[inStateObjectName]: inStateObject})
    }

    checkIfExceptions() {
        for (let exc in this.state.exceptions) if (this.state.exceptions[exc]) return (true)
        return false
    }

    render() {
        return (
            <>
                <div>{this.props.userData.type}</div>
                <script src={`https://www.google.com/recaptcha/api.js?render=${this.props.serverData.siteKey}`}></script>
                <form onSubmit={(e) => this.submitForm(e)}>
                    <label>
                        <input name={"email"} disabled={this.state.disableInputs}
                               onChange={async (e) => {
                                   await this.setObjectInState("exceptions", {[e.target.name]: Validators[e.target.name](this.props.query.lang, this.props.langPack[e.target.name], e.target.value)})
                               }}
                               onFocus={() => {this.setObjectInState("exceptionsToShow", {fatal: ""})}}
                               placeholder={this.props.langPack.email}/>
                    </label>
                    <label>
                        <input name={"password"} type={"password"} disabled={this.state.disableInputs}
                               onChange={async (e) => {
                                   await this.setObjectInState("exceptions", {[e.target.name]: Validators[e.target.name](this.props.query.lang, this.props.langPack[e.target.name], e.target.value)})
                               }}
                               onFocus={() => {this.setObjectInState("exceptionsToShow", {fatal: ""})}}
                               placeholder={this.props.langPack.password}/>
                    </label>

                    <label>
                        <div id={"fatalError"}>{this.state.exceptionsToShow.fatal}</div>
                        <button disabled={this.state.disableButton}> {this.props.langPack.LoginConfirm}</button>
                    </label>
                </form>
                <LoginOffline/>
            </>
        )
    }
}