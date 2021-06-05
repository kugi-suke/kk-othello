//import logo from './logo.svg';
import './App.css';
import React from "react";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let board = [];
    for (let i=0; i<8; i++) {
      board.push(<div className="board-row" key={i}>
                {[...Array(8).keys()].map((val) => this.renderSquare(i*8+val))}
                </div>);
    }
    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: initBoard(),
      xIsNext: true,
    };
  }

  handleClick(i) {
    const current = this.state.current;
    const squares = current.slice();
    const reverse = this.checkReverse(i);
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    for (let point of reverse) {
      squares[point] = this.state.xIsNext ? "X" : "O";
    }
    this.setState({
      current: squares,
      xIsNext: !this.state.xIsNext
    });
  }

  checkReverse(i) {
    const current = this.state.current;
    let reverseFlag = true;
    let reverseList = [];
    let idCol = i%8;
    let idRow = Math.floor(i/8);
    let putColor = this.state.xIsNext ? "X" : "O";

    for (let j=idRow-1; j>=0; j--) {
      if (reverseFlag) {
        if (current[j*8 + idCol]===putColor || current[j*8 + idCol]==null) {
          //alert('1');
          break;
        } else {
          reverseList.push(j*8 + idCol);
          reverseFlag = !reverseFlag;
          //alert('2');
        }
      } else {
        if (current[j*8 + idCol]===putColor || current[j*8 + idCol]==null) {
          //alert('3');
          if (current[j*8 + idCol]===putColor) {
            reverseFlag = !reverseFlag;
          }
          break;
        } else {
          reverseList.push(j*8 + idCol);
          //alert('4');
        }
     }
    }

    if (!reverseFlag) {
      reverseList =[];
    }

    return reverseList;
  }

  render() {
    const current = this.state.current;
    const winner = calculateWinner(current);

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
        </div>
      </div>
    );
  }
}

function initBoard() {
  let board = Array(8**2).fill(null);

  board[27] = 'X';
  board[28] = 'O';
  board[35] = 'O';
  board[36] = 'X';

  return board;
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default Game;
