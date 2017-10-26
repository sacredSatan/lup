import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Map, List} from 'immutable';
import './index.css';


class Message extends Component {
    handleClick = () => {
        this.props.handleOnClick();
    }
    render() {
        return(<div className="message"><h1>{this.props.message}</h1><button onClick={this.handleClick}>{this.props.text}</button></div>);
    }
}


class Piece extends Component {

    handleClick = () => {
        if(this.props.handleClick)
        this.props.handleClick(this.props.x, this.props.y, this.props.rotate);
    }

    handleContextMenu = (e) => {
        e.preventDefault();
        if(this.props.handleContextMenu && this.props.type) {
            this.props.handleContextMenu(this.props.x, this.props.y, this.props.rotate);
        }
    }

    render() {
        if(this.props.connected){
            return (
                <span className={`con ${this.props.type}`} style={{transform: `rotate(${this.props.rotate}deg)`, left: `${this.props.x * 45}px`, top: `${this.props.y * 45}px`}} onClick={this.handleClick} onContextMenu={this.handleContextMenu}></span>
            );
        }
        return (
            <span className={this.props.type} style={{transform: `rotate(${this.props.rotate}deg)`, left: `${this.props.x * 45}px`, top: `${this.props.y * 45}px`}} onClick={this.handleClick} onContextMenu={this.handleContextMenu}></span>
        );
    }
}

class Tile extends Component {
    render() {
        return (
            <Piece connected={this.props.connected} x={this.props.x} y={this.props.y} handleClick={this.props.handleClick} handleContextMenu={this.props.handleContextMenu} rotate={this.props.rotate} type={this.props.type} />
        );
    }
}

class Board extends Component {
    constructor(props) {
        super(props);

        let tilesArr = List();

        this.connections = List();

        for(let i=1, l=this.props.tiles.length; i<l; i++) {
            if(tilesArr.has(this.props.tiles[i][0]) && tilesArr.get(this.props.tiles[i][0])) {
                let elem = Map({x: this.props.tiles[i][0], y: this.props.tiles[i][1], rotate: this.props.tiles[i][2], connected: false, type: this.props.tiles[i][4], piece: Map(this.props.tiles[i][3])});
                tilesArr = tilesArr.setIn([this.props.tiles[i][0], this.props.tiles[i][1]], elem);
                this.connections = this.connections.setIn([this.props.tiles[i][0], this.props.tiles[i][1]], false);
            } else {
                tilesArr = tilesArr.set(this.props.tiles[i][0], List().set(this.props.tiles[i][1], Map({x: this.props.tiles[i][0], y: this.props.tiles[i][1], rotate: this.props.tiles[i][2], connected: false, type: this.props.tiles[i][4], piece: Map(this.props.tiles[i][3])})));
                this.connections = this.connections.setIn([this.props.tiles[i][0], this.props.tiles[i][1]], false);
            }
        }

        tilesArr.forEach((r,i) => {
            if(r) r.forEach((c, j) => {
                if(c) {
                    this.connections = this.connections.setIn([i,j],this.checkConnection(i, j, tilesArr));
                }
            });
        });

        this.state = {
            tiles: tilesArr,
        };
    }

    componentWillUpdate(nextProps, nextState) {
        if(!nextState.tiles)
            return;
        let newTiles = nextState.tiles;
        newTiles.forEach((r,i) => {
            if(r) r.forEach((c, j) => {
                if(c) {
                    this.connections = this.connections.setIn([i,j],this.checkConnection(i, j, nextState.tiles));
                }
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.tiles[0] > this.props.tiles[0]) {
            let tilesArr = List();
            this.connections = List();
            for(let i=1, l=nextProps.tiles.length; i<l; i++) {
                if(tilesArr.has(nextProps.tiles[i][0]) && tilesArr.get(nextProps.tiles[i][0])) {
                    let elem = Map({x: nextProps.tiles[i][0], y: nextProps.tiles[i][1], rotate: nextProps.tiles[i][2], connected: false, type: nextProps.tiles[i][4], piece: Map(nextProps.tiles[i][3])});
                    tilesArr = tilesArr.setIn([nextProps.tiles[i][0], nextProps.tiles[i][1]], elem);
                    this.connections = this.connections.setIn([nextProps.tiles[i][0], nextProps.tiles[i][1]], false);
                } else {
                    tilesArr = tilesArr.set(nextProps.tiles[i][0], List().set(nextProps.tiles[i][1], Map({x: nextProps.tiles[i][0], y: nextProps.tiles[i][1], rotate: nextProps.tiles[i][2], connected: false, type: nextProps.tiles[i][4], piece: Map(nextProps.tiles[i][3])})));
                    this.connections = this.connections.setIn([nextProps.tiles[i][0], nextProps.tiles[i][1]], false);
                }
            }
    
            this.setState({
                tiles: tilesArr,
            });
        }
    }

    handleClick = (r, c, rotate) => {
        this.setState(({tiles}) => ({
             tiles: tiles.updateIn([r, c], (c, temp=c.getIn(['piece','_y'])) => c.set('rotate', c.get('rotate')+90).setIn(['piece', '_y'], c.getIn(['piece','x'])).setIn(['piece','x'], c.getIn(['piece','y'])).setIn(['piece','y'], c.getIn(['piece','_x'])).setIn(['piece','_x'], temp))
        }));
    }

    checkConnection = (r, c, tiles) => {
        let x = tiles.getIn([r,c,'piece', 'x'], null);
        let _x = tiles.getIn([r,c,'piece', '_x'], null);
        let y = tiles.getIn([r,c,'piece', 'y'], null);
        let _y = tiles.getIn([r,c,'piece', '_y'], null);
        if(x && x !== tiles.getIn([r+1,c,'piece','_x'], null)) {
            return false;
        }
        if(_x && _x !== tiles.getIn([r-1,c,'piece','x'], null)) {
            return false;
        }
        if(y && y !== tiles.getIn([r,c-1,'piece', '_y'], null)) {
            return false;
        }
        if(_y && _y !== tiles.getIn([r,c+1,'piece', 'y'], null)) {
            return false;
        }
        return true;
    };

    checkLevelClear = () => {
        for(let i=1, l=this.props.tiles.length; i<l; i++) {
            if(!this.connections.getIn([this.props.tiles[i][0], this.props.tiles[i][1]])) {
                return false;
            }
        }
        return true;
    }

    render() {
        let onClick;
        let isLevelClear = this.checkLevelClear();
        if(!isLevelClear) {
            onClick = this.handleClick;
        }

        let tiles = [];
        //creating rows of tiles
        this.state.tiles.forEach((r,i) => {
            if(r) r.forEach((c, j) => {
                if(c) tiles.push(<Tile key={`key_row${i}_col${j}`} connected={this.connections.getIn([i, j])} x={c.get('x')} y={c.get('y')} rotate={c.get('rotate')} handleClick={onClick} type={c.get('type')} />);
            });
        });

        if(isLevelClear) {
            return (
                <div id="board" className="board"><div className="message"><button onClick={this.props.onLevelClear}>Next Level</button></div><div>{tiles}</div></div>
            );
        }

        return (
            <div id="board" className="board"><div className="message"><h1>Level {this.props.level}</h1></div><div>{tiles}</div></div>
        );

    }
}

function WelcomeScreen(props) {
    return (
        <div id="welcome" className="board">
            <div>
                <h3>Lup</h3>
                <p>connect the dots, not really.</p>
                <div>
                    <button onClick={props.play}>Play</button>
                </div>
            </div>
        </div>
    )
}

class Game extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tilesMeta: [
                [
                    0,
                    [3,3,0,{x: null, y: null, _x: 1, _y: 1},"t1"],
                    [3,4,0,{x: null, y: null, _x: null, _y: 1},"t2"],
                    [3,5,0,{x: null, y: null, _x: null, _y: 1},"t2"],
                    [3,6,0,{x: null, y: null, _x: null, _y: 1},"t2"],
                    [4,3,0,{x: null, y: null, _x: 1, _y: 1},"t1"],
                    [4,4,0,{x: 1, y: 1, _x: null, _y: 1},"t4"],
                    [4,5,0,{x: 1, y: 1, _x: 1, _y: 1},"t5"],
                    [4,6,0,{x: 1, y: 1, _x: null, _y: 1},"t4"],
                    [5,3,0,{x: null, y: null, _x: 1, _y: 1},"t1"],
                    [5,4,0,{x: null, y: null, _x: 1, _y: 1},"t1"],
                    [5,5,0,{x: 1, y: 1, _x: null, _y: 1},"t4"],
                    [5,6,0,{x: 1, y: 1, _x: null, _y: 1},"t4"],
                    [6,3,0,{x: null, y: 1, _x: null, _y: 1},"t3"],
                    [6,4,0,{x: null, y: null, _x: 1, _y: 1},"t1"],
                    [6,5,0,{x: 1, y: 1, _x: null, _y: 1},"t4"],
                    [6,6,0,{x: null, y: 1, _x: null, _y: 1},"t3"],
                    [7,3,0,{x: null, y: null, _x: 1, _y: 1},"t1"],
                    [7,4,0,{x: 1, y: 1, _x: null, _y: 1},"t4"],
                    [7,5,0,{x: 1, y: 1, _x: null, _y: 1},"t4"],
                    [7,6,0,{x: null, y: null, _x: 1, _y: 1},"t1"],
                ],
            ],
            level: 0,
        }
        this.gameState = 0;
    }

    handleLevelClear = () => {
        this.setState({level: this.state.level+1});
    }

    resetGame = () => {
        this.setState({level: 0});
    }

    startGame = () => {
        this.gameState = 1;
        this.forceUpdate()
    }

    render() {
        switch(this.gameState) {
            case 1:
                if(this.state.level < this.state.tilesMeta.length)
                return (
                    <Board width="10" height="10" level={this.state.level} tiles={this.state.tilesMeta[this.state.level]} onLevelClear={this.handleLevelClear} />
                );
                return (
                    <div className="board"><Message message="Game Over!" text="Restart" handleOnClick={this.resetGame} /></div>
                );
            default:
                return (
                    <WelcomeScreen play={this.startGame} />
                );
        }
    }
}

ReactDOM.render(<Game />, document.getElementById('Game'));
