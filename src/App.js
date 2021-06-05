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
    for (let point of reverse[0]) {
      squares[point] = squares[i];
    }
    for (let point of reverse[1]) {
      squares[point] = squares[i];
    }
    for (let point of reverse[2]) {
      squares[point] = squares[i];
    }
    for (let point of reverse[3]) {
      squares[point] = squares[i];
    }
    this.setState({
      current: squares,
      xIsNext: !this.state.xIsNext
    });
  }

  reversePoint(current, color, idCol, idRow, direction) {
    let reverseFlag = true;
    let reverseList = [];
    let downer = [];
    let stepJ;
    let stepK;

    if (direction==='col') {
      stepJ=0;
      stepK=-1;
    } else if (direction==='row') {
      stepJ=-1;
      stepK=0;
    } else if (direction==='right') {
      stepJ=-1;
      stepK=1;
    } else {
      stepJ=-1;
      stepK=-1;
    }
    let j=idRow+stepJ;
    let k=idCol+stepK;
    while (j>=0 && j<8 && k>=0 && k<8) {
      if (current[8*j+k]===color) {
        if (!reverseFlag) {
          reverseFlag = !reverseFlag;
        }
        break;
      } else if (current[8*j+k]==null) {
        break;
      } else {
        reverseList.push(8*j+k);
        reverseFlag = false;
      }

      j+=stepJ;
      k+=stepK;
    }
    if (!reverseFlag) reverseList = [];
    reverseFlag = true;

    stepJ*=-1;
    stepK*=-1;
    j=idRow+stepJ;
    k=idCol+stepK;
    while (j>=0 && j<8 && k>=0 && k<8) {
      if (current[8*j+k]===color) {
        if (!reverseFlag) {
          reverseFlag = !reverseFlag;
        }
        break;
      } else if (current[8*j+k]==null) {
        break;
      } else {
        downer.push(8*j+k);
        reverseFlag = false;
      }
      j+=stepJ;
      k+=stepK;
    }
    if (!reverseFlag) downer = [];

    for (let val of downer) {
      reverseList.push(val);
    }

    return reverseList;
  }

  checkReverse(i) {
    const current = this.state.current;
    let idCol = i%8;
    let idRow = Math.floor(i/8);
    let putColor = this.state.xIsNext ? "X" : "O";

    let reverseList = [];
    reverseList.push(this.reversePoint(current, putColor, idCol, idRow, 'col'));
    reverseList.push(this.reversePoint(current, putColor, idCol, idRow, 'row'));
    reverseList.push(this.reversePoint(current, putColor, idCol, idRow, 'right'));
    reverseList.push(this.reversePoint(current, putColor, idCol, idRow, 'left'));

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
