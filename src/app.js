import React, {Component} from "react";
import Portfolio from './portfolio';
import Scene from "./scene";

class App extends Component {

    constructor(props){
        super(props);
        this.state = {

        };
    }

    render() {
        return(
            <div>
                <div>
                    <Scene/>
                </div>
                <div>
                    <Portfolio/>
                </div>
            </div>

        );
    }
}

export default App