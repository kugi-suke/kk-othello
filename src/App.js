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
    const color = this.state.xIsNext ? "X" : "O";
    const reverse = this.reverse(i, squares, color);

    if (squares[i]) {
      return;
    }

    if (false) {
      alert("You can't put here!");
    } else {
      squares[i] = color;
      for (let j=0; j<4; j++) {
        for (let point of reverse[j]) {
          squares[point] = squares[i];
        }
      }

      this.setState({
        current: squares,
        //xIsNext: !this.state.xIsNext
      });

      if (this.nextIsPass(squares)) {
        alert('pass!!');
      } else {
        this.setState({
          xIsNext: !this.state.xIsNext,
        });
      }
    }
    /*if (calculateWinner(squares) || squares[i]) {
      return;
    }*/
    //squares[i] = this.state.xIsNext ? "X" : "O";

    /*for (let j=0; j<4; j++) {
      for (let point of reverse[j]) {
        squares[point] = squares[i];
      }
    }*/

    /*this.setState({
      current: squares,
      xIsNext: !this.state.xIsNext
    });*/
  }

  reversePoint(current, color, point, vStep, hStep) {
    let reverseList = [];
    let tmpList = [];

    reverseList = this.checkReverse(current, color, point, vStep, hStep);

    vStep*=-1;
    hStep*=-1;

    tmpList = this.checkReverse(current, color, point, vStep, hStep);

    for (let val of tmpList) reverseList.push(val);

    return reverseList;
  }

  checkReverse(current, color, point, vStep, hStep) {
    let reverseFlag = true;
    let reverseList = [];
    let vPoint=(Math.floor(point/8))+vStep;
    let hPoint=(point%8)+hStep;

    while (vPoint>=0 && vPoint<8 && hPoint>=0 && hPoint<8) {
      if (current[8*vPoint+hPoint]===color) {
        if (!reverseFlag) {
          reverseFlag = !reverseFlag;
        }
        break;
      } else if (current[8*vPoint+hPoint]==null) {
        break;
      } else {
        reverseList.push(8*vPoint+hPoint);
        reverseFlag = false;
      }

      vPoint+=vStep;
      hPoint+=hStep;
    }

    if (!reverseFlag) reverseList = [];
    return reverseList;
  }

  reverse(i, current, color) {
    //const current = this.state.current;
    //let putColor = this.state.xIsNext ? "X" : "O";

    let reverseList = [];
    /*reverseList.push(this.reversePoint(current, putColor, i, 0, -1));
    reverseList.push(this.reversePoint(current, putColor, i, -1, 0));
    reverseList.push(this.reversePoint(current, putColor, i, -1, 1));
    reverseList.push(this.reversePoint(current, putColor, i, -1, -1));*/
    reverseList.push(this.reversePoint(current, color, i, 0, -1));
    reverseList.push(this.reversePoint(current, color, i, -1, 0));
    reverseList.push(this.reversePoint(current, color, i, -1, 1));
    reverseList.push(this.reversePoint(current, color, i, -1, -1));

    return reverseList;
  }

  nextIsPass(current) {
    const color = this.state.xIsNext ? "O" : "X";
    let putMap = Array(8**2).fill(null);
    let reverse;

    for (let i=0; i<8; i++) {
      for (let j=0; j<8; j++) {
        if (current[i*8+j]!=null) {
          putMap[i*8+j] = true;
        }
      }
    }

    for (let i=1; i<7; i++) {
      for (let j=1; j<7; j++) {
        if (current[i*8+j]!=null) {
          for (let v=i-1; v<i+2; v++) {
            for (let h=j-1; h<j+2; h++) {
              if (!putMap[v*8+h]) {
                reverse = this.reverse(v*8+h, current, color);
                if (reverse[0][0]===undefined && reverse[1][0]===undefined && reverse[2][0]===undefined && reverse[3][0]===undefined) {
                  putMap[v*8+h] = true;
                } else {
                  return false;
                }
              }
            }
          }
        }
      }
    }
    return true;
  }

  render() {
    const current = this.state.current;
    const winner = calculateWinner(current);

    let status;
    if (false) {
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
