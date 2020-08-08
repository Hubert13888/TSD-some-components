import React, {Component} from 'react'
import Validators, {inputLengthRange} from "./collectors/Validators"
import Database from "./collectors/DatabaseCollector"
import Lang from "./collectors/LangCollector"
import axios from "axios/index"

export default class PanelToChangeUserData extends Component {
    state = {
        profilePictureChange: false,

        confirmationPanel: {
            show: false,
            inputVal: undefined,
            inputType: undefined
        },

        inputValues: {
            username: this.props.userData.username,
            email: this.props.userData.email
        },

        disableInputs: {
            username: false,
            email: false,
            password: false,
            confirmation: false
        },

        disableSubmit: {
            profilePicture: true,
            username: true,
            email: true,
            password: true,
            confirmation: true
        },

        exceptions: {
            username: this.props.predefined.username,
            email: this.props.predefined.email,
            password: this.props.predefined.password,
            confirmation: this.props.predefined.confirmation,
            fatal: false
        },
        exceptionsToShow: {}
    }

    setObjectInState(inStateObjectName, toSave) {
        let inStateObject = this.state[inStateObjectName]
        Object.assign(inStateObject, toSave)
        this.setState({[inStateObjectName]: inStateObject})
    }

    render() {
        return(
            <div>
                <h>Change your profile picture</h>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    this.setState({profilePictureChange: true})
                    this.setObjectInState("confirmationPanel", {show: true, inputType: e.target[0].name, inputVal: e.target[0].files[0]})
                }}>
                    <img id={"preview"} src={this.props.userData.profilePictureExt != "" ?
                        `/files/users/${this.props.userData.clientId}/profile_picture.${this.props.userData.profilePictureExt}`:
                        '/files/users/default_profile_picture.png'
                    } height={100}
                    />
                    <br/>
                    <label>
                        <input name={"profilePicture"} type={"file"} onChange={(e) => {
                            this.setObjectInState("exceptionsToShow", {profilePicture: ""})

                            document.getElementById("profilePictureError").textContent = ""
                            e.persist()
                            return new Promise((resolve, reject) => {
                                let goodTypes = ["image/bmp", "image/png", "image/jpeg"], typeFlag = false
                                for(let type of goodTypes)
                                    if(type == e.target.files[0].type.toLowerCase()) typeFlag = true
                                if(!typeFlag) return(reject("type"))

                                if(Math.round(e.target.files[0].size / 1024 / 1024 * 100) / 100 > 10) return(reject("size"))

                                resolve()
                            }).then(
                                () => {
                                    var preview = document.getElementById("preview")
                                    let reader = new FileReader()
                                    reader.onloadstart = (evt) => {
                                        this.setObjectInState("exceptionsToShow", {profilePicture: "Preparing to upload!"})
                                    }
                                    reader.onprogress = (evt) => {
                                        this.setObjectInState("exceptionsToShow", {profilePicture: `Loaded ${Math.round(evt.loaded / 1024 / 1024 * 100) / 100} of ${Math.round(evt.total / 1024 / 1024 * 100) / 100} MB`})
                                    }
                                    reader.onload = (evt) => {
                                        this.setObjectInState("disableSubmit", {profilePicture: false})
                                        this.setObjectInState("exceptionsToShow", {profilePicture: "Uploading completed!"})
                                        preview.src = reader.result
                                    }
                                    reader.onerror = (err) => {
                                        //Need to log error on
                                        this.setObjectInState("exceptionsToShow", {profilePicture: "Sorry, but your upload crashed!"})
                                    }
                                    reader.readAsDataURL(e.target.files[0])
                                },
                                (err) => {
                                    this.props.userData.hasProfilePicture ?
                                        preview.src = `/files/users/${this.props.userData.clientId}/profile_picture.${this.props.userData.profilePictureExt}`:
                                        preview.src = '/files/users/default_profile_picture.png'

                                    e.target.value = ''
                                    if (!/safari/i.test(navigator.userAgent)) {
                                        e.target.type = ''
                                        e.target.type = 'file'
                                    }
                                    if (err == "type") this.setObjectInState("exceptionsToShow", {profilePicture: "The valid picture extensions are: bmp, jpg and png!"})
                                    else if (err == "size") this.setObjectInState("exceptionsToShow", {profilePicture: "Your file should not run above 10 MB"})
                                }
                            )
                        }}/>
                    </label>
                    <p id={"profilePictureError"}>{this.state.exceptionsToShow.profilePicture}</p>
                    <button disabled={this.state.disableSubmit.profilePicture}>Confirm</button>
                </form>
                <br/>

                <b>Change your password</b>

                <form onSubmit={(e) => {
                    e.preventDefault()
                    this.setObjectInState("confirmationPanel", {show: true, inputType: e.target[0].name, inputVal: e.target[0].value})
                }}>

                    <input name={"password"} type={"password"} disabled={this.state.disableInputs.password}
                           onChange={async (e) => {
                               e.persist()
                               await this.setObjectInState("disableSubmit", {[e.target.name]: true})
                               await this.setObjectInState("exceptions", {[e.target.name]: Validators[e.target.name](this.props.query.lang, this.props.langPack[e.target.name], e.target.value)})
                               Promise.all([this.state.exceptions[e.target.name]]).then(exc => {
                                   if(!exc[0]) this.setObjectInState("disableSubmit", {[e.target.name]: false})
                               })
                           }}
                           onBlur={(e) => {
                               e.persist()
                               if (this.state.exceptions[e.target.name]) Promise.all([this.state.exceptions[e.target.name]]).then(exc => this.setObjectInState("exceptionsToShow", {[e.target.name]: exc[0]}))
                           }}
                           onFocus={(e) => {
                               if (this.state.exceptionsToShow[e.target.name] != "") this.setObjectInState("exceptionsToShow", {[e.target.name]: ""})
                           }}
                           placeholder={this.props.langPack.password}/>
                    <div id={"passwordError"}>{this.state.exceptionsToShow.password}</div>
                    <button disabled={this.state.disableSubmit.password}>Confirm</button>
                </form>
            <br/>
                <b>Change your e-mail</b>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    this.setObjectInState("confirmationPanel", {show: true, inputType: e.target[0].name, inputVal: e.target[0].value})
                }}>
                    <input name={"email"} disabled={this.state.disableInputs.email}
                           onChange={async (e) => {
                               e.persist()
                               this.setObjectInState("disableSubmit", {[e.target.name]: true})
                               this.setObjectInState("inputValues", {[e.target.name]: e.target.value})
                               if(e.target.value.toLowerCase().trim() == this.props.userData[e.target.name])
                                   this.setObjectInState("exceptions", {[e.target.name]: Lang.getFunctionPack("SAME", [this.props.langPack[e.target.name].toLowerCase()], this.props.query.lang)})
                               else this.setObjectInState("exceptions", {[e.target.name]: Validators[e.target.name](this.props.query.lang, this.props.langPack[e.target.name], e.target.value)})
                           }}
                           value={this.state.inputValues.email}
                           onBlur={async (e) => {
                               e.persist()
                               Promise.all([this.state.exceptions[e.target.name]]).then(exc => {
                                   if(!exc[0])
                                       new Promise((resolve) => {
                                           Database.findOne("main", "users", {["email"]: e.target.value.trim().toLowerCase()}).then(
                                               async (resp) => {
                                                   if (resp) {
                                                       await this.setObjectInState("exceptions", {email: Lang.getFunctionPack("ALREADYEXISTS", [this.props.langPack["email"].toLowerCase()], this.props.query.lang)})
                                                       this.setObjectInState("exceptionsToShow", {[e.target.name]: await Lang.getFunctionPack("ALREADYEXISTS", [this.props.langPack["email"].toLowerCase()], this.props.query.lang)})
                                                   }
                                                   else this.setObjectInState("disableSubmit", {[e.target.name]: false})
                                                   resolve()
                                               },
                                               () => {
                                                   this.setObjectInState("exceptionsToShow", {fatal: "Unexpected error!"})
                                                   resolve()
                                               }
                                           )
                                       })
                                   else this.setObjectInState("exceptionsToShow", {[e.target.name]: exc[0]})
                               })
                           }}
                           onFocus={(e) => {
                               if (this.state.exceptionsToShow[e.target.name] != "") this.setObjectInState("exceptionsToShow", {[e.target.name]: ""})
                           }}/>

                    <div id={"emailError"}>{this.state.exceptionsToShow.email}</div>
                    <button disabled={this.state.disableSubmit.email}>Confirm</button>
                </form>
            <br/>
                <b>Change your username</b>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    this.setObjectInState("confirmationPanel", {show: true, inputType: e.target[0].name, inputVal: e.target[0].value})
                }}>
                    <input name={"username"} disabled={this.state.disableInputs.username}
                           onChange={(e) => {
                               e.persist()
                               this.setObjectInState("disableSubmit", {[e.target.name]: true})
                               this.setObjectInState("inputValues", {[e.target.name]: e.target.value})
                               if(e.target.value.toLowerCase().trim() == this.props.userData[e.target.name])
                                   this.setObjectInState("exceptions", {[e.target.name]: Lang.getFunctionPack("SAME", [this.props.langPack[e.target.name].toLowerCase()], this.props.query.lang)})
                               else this.setObjectInState("exceptions", {[e.target.name]: Validators[e.target.name](this.props.query.lang, this.props.langPack[e.target.name], e.target.value)})
                           }}
                           value={this.state.inputValues.username}
                           onBlur={async (e) => {
                               e.persist()
                               Promise.all([this.state.exceptions[e.target.name]]).then(exc => {
                                   if(!exc[0])
                                       new Promise((resolve) => {
                                           Database.findOne("main", "users", {["username"]: e.target.value.trim().toLowerCase()}).then(
                                               async (resp) => {
                                                   if (resp) {
                                                       await this.setObjectInState("exceptions", {username: Lang.getFunctionPack("ALREADYEXISTS", [this.props.langPack["username"].toLowerCase()], this.props.query.lang)})
                                                       this.setObjectInState("exceptionsToShow", {[e.target.name]: await Lang.getFunctionPack("ALREADYEXISTS", [this.props.langPack["username"].toLowerCase()], this.props.query.lang)})

                                                   }
                                                   else this.setObjectInState("disableSubmit", {[e.target.name]: false})
                                                   resolve()
                                               },
                                               () => {
                                                   this.setObjectInState("exceptionsToShow", {fatal: "Unexpected error!"})
                                                   resolve()
                                               }
                                           )
                                       })
                                   else this.setObjectInState("exceptionsToShow", {[e.target.name]: exc[0]})
                               })
                           }}
                           onFocus={(e) => {
                               if (this.state.exceptionsToShow[e.target.name] != "") this.setObjectInState("exceptionsToShow", {[e.target.name]: ""})
                           }}/>

                    <div id={"usernameError"}>{this.state.exceptionsToShow.username}</div>
                    <button disabled={this.state.disableSubmit.username}>Confirm</button>
                </form>
                <div id={"fatalError"}>{this.state.exceptionsToShow.fatal}</div>

                {this.state.confirmationPanel.show ?
                    <form onSubmit={async (e) => {
                        e.persist()
                        e.preventDefault()

                        let formData = new FormData()
                        formData.append(this.state.confirmationPanel.inputType, this.state.confirmationPanel.inputVal)
                        formData.append(e.target[0].name, e.target[0].value)

                        await this.setObjectInState("confirmationPanel", {inputVal: formData})
                        this.submitForm()
                    }}>
                        <div onClick={() => this.setObjectInState("confirmationPanel", {show: false, inputType: undefined, inputVal: undefined})}>Hide</div>
                        <h1>Please, confirm changes by entering your recent pasword</h1>
                        <input name={"confirmation"} type={"password"} placeholder={"Your recent password"}
                               id={"confirmation"}
                               disabled={this.state.disableInputs.confirmation}
                               onChange={async (e) => {
                                   e.persist()
                                   await this.setObjectInState("disableSubmit", {[e.target.name]: true})
                                   await this.setObjectInState("exceptions", {[e.target.name]: Validators[e.target.name](this.props.query.lang, this.props.langPack[e.target.name], e.target.value)})
                                   Promise.all([this.state.exceptions[e.target.name]]).then(exc => {
                                       if(!exc[0]) this.setObjectInState("disableSubmit", {[e.target.name]: false})
                                   })
                               }}
                               onBlur={(e) => {
                                   e.persist()
                                   if (this.state.exceptions[e.target.name]) Promise.all([this.state.exceptions[e.target.name]]).then(exc => this.setObjectInState("exceptionsToShow", {[e.target.name]: exc[0]}))
                               }}
                               onFocus={(e) => {
                                   if (this.state.exceptionsToShow[e.target.name] != "") this.setObjectInState("exceptionsToShow", {[e.target.name]: ""})
                               }}
                               placeholder={"Your recent password"} />
                        <div id={"confirmationError"}>{this.state.exceptionsToShow.confirmation}</div>
                        <button disabled={this.state.disableSubmit.confirmation}>Confirm</button>
                    </form>
                : false}
            </div>
        )
    }

    submitForm() {
        let inputType = this.state.confirmationPanel.inputType,
            inputVal = this.state.confirmationPanel.inputVal

        this.setObjectInState("disableInputs", {[inputType]: true})
        this.setObjectInState("disableSubmit", {[inputType]: true})

        this.setObjectInState("disableInputs", {confirmation: true})
        this.setObjectInState("disableSubmit", {confirmation: true})

        return new Promise(async (resolve, reject) => {
            await axios({
                method: "POST",
                url: this.state.profilePictureChange ? "/changeUserPicture" : "/changeUserData",
                data: inputVal
            }).then(res => res.data)
                .then(async (response) => {
                    if(response.err) {
                        if(response.validations) {
                            for(let field in response.validations){
                                if(response.validations[field]) {
                                    if(field != "confirmation")
                                        this.setObjectInState("confirmationPanel", {show: false, inputVal: undefined})
                                    let errorContent = await Lang.getFunctionPack(response.validations[field], [field, inputLengthRange[field].min, inputLengthRange[field].max], this.props.query.lang)
                                    if(!this.state.profilePictureChange) this.setObjectInState("exceptions", {[field]: errorContent})
                                    this.setObjectInState("exceptionsToShow", {[field]: errorContent})
                                }
                            }
                        }
                        else this.setObjectInState("exceptionsToShow", {fatal: "Sample message"})

                        reject()
                    }
                    else resolve()
                }).catch((err) => {
                    //Need to log err
                    this.setObjectInState("exceptionsToShow", {"fatal": this.props.langPack.E1002})
                    return reject()
                })
        }).then(
            () => {
                this.setObjectInState("confirmationPanel", {show: false, inputType: undefined, inputVal: undefined})
                alert("New data have been set successfully!")
                location.reload()
            },
            () => {
                this.setObjectInState("disableInputs", {confirmation: false})
                this.setObjectInState("disableSubmit", {confirmation: false})
                document.getElementById("confirmation").value = "";
            }
        ).finally(() => {
            this.setObjectInState("disableInputs", {[inputType]: false})
            this.setObjectInState("disableSubmit", {[inputType]: false})
        })
    }
}