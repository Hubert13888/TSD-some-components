import React from "react"
import DatabaseCollector from '../collectors/DatabaseCollector'

export default class SelectCategories extends React.Component{
    state = {
        categories: []
    }
    componentWillMount(){
        this.setState(prev => ({categories: [...prev.categories, <option value="">Choose {this.props.subcategory ? "subcategory" : "category"}</option>]}))
    }
    constructor(props){
        super()
        let option = props.subcategory ? "subcategories" : "categories"
        if(props.both) {
            DatabaseCollector.find("main", "questions", {$or: [
                {id: "categories"},
                {id: "subcategories"}
            ]}).then( 
                resp => {
                    let catArr = {}, subArr = {}
                    if(resp[0].id == "categories") {
                        catArr = resp[0].categories
                        subArr = resp[1].subcategories
                    }
                    else {
                        catArr = resp[1].categories
                        subArr = resp[0].subcategories
                    }
                    let both = {...catArr, ...subArr}, optArr = []
                    Object.keys(both).map(cath => 
                        optArr.push(<option type="checkbox" value={cath} selected={this.props.selected == cath}>
                            {both[cath].name}
                            {Object.keys(catArr).map(cat => cat == cath ? " (cat)": "")}
                        </option>))
                    this.setState(prev => ({categories: [...prev.categories, ...optArr]}))
                },
                err => console.log(err)
            )
        }
        else DatabaseCollector.findOne("main", "questions", {id: option}).then(
            resp => {
                let optArr = []
                Object.keys(resp[option]).map(cath => 
                    optArr.push(<option type="checkbox" value={cath} selected={this.props.selected == cath}>{resp[option][cath].name}</option>))
                this.setState(prev => ({categories: [...prev.categories, ...optArr]}))
            },
            err => console.log(err)
        )
    }
    render(){
        return(<select name="cat" onChange={e => {
            if(this.props.change) this.props.change(e)
        }}>{this.state.categories}</select>)
    }
}