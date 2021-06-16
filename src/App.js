import black from './black.png';
import white from './white.png';
import './App.css';
import React from "react";
import firebase from 'firebase/app';
import "firebase/firestore";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "xxxxx",
  authDomain: "xxxxx",
  projectId: "xxxxx",
  storageBucket: "xxxxx",
  messagingSenderId: "xxxxx",
  appId: "xxxxx",
  measurementId: "xxxxx"
};

let db = firebase.firestore(firebase.initializeApp(firebaseConfig));
let uid = null;
firebase.auth().signInAnonymously();
firebase.auth().onAuthStateChanged(function (user) {
  if (user) uid = user.uid;
});

let field = initBoard();
let currentIsBlack = true;
let counterX = 2;
let counterO = 2;

function Square(props) {
  let value=null;
  if (props.value==='O') {
    value = <img src={white} className="stone" alt="stone" />;
  } else if (props.value==='X'){
    value = <img src={black} className="stone" alt="stone" />;
  }
  return (
    <button className="square" onClick={props.onClick}>
      {value}
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
      current: field,
      bIsNext: true,
      numX: 2,
      numO: 2,
    };
  }

  componentDidMount() {
    db.collection("actions").orderBy("createdAt", "desc").limit(1).onSnapshot((querySnapshot) =>  {
      querySnapshot.forEach(function(doc) {
          var data = doc.data();
          field = JSON.parse(data.field);
          currentIsBlack = data.nextIsBlack;
          counterX = data.x;
          counterO = data.o;
      });
      this.setState({
        bIsNext: currentIsBlack,
        current: field,
        numX: counterX,
        numO: counterO,
      });
    })
  }

  handleClick(i) {
    const current = this.state.current;
    const winner = this.judgeWinner(current, this.state.numX, this.state.numO);
    const squares = current.slice();
    const color = this.state.bIsNext ? "X" : "O";
    const nextColor = this.state.bIsNext ? "O" : "X";
    const reverse = this.reverse(i, squares, color);

    let counter = 0;
    let numX = this.state.numX;
    let numO = this.state.numO;

    if (winner || squares[i]) {
      return;
    }

    if (reverse[0][0]===undefined && reverse[1][0]===undefined && reverse[2][0]===undefined && reverse[3][0]===undefined) {
      alert("You can't put here!");
      return;
    }
    squares[i] = color;

    for (let j=0; j<4; j++) {
      for (let point of reverse[j]) {
        squares[point] = squares[i];
        counter++;
      }
    }

    this.setState({
      current: squares,
    });

    if (color==='X') {
      numX += counter+1;
      numO -= counter;
    } else {
      numX -= counter;
      numO += counter+1;
    }
    this.setState({
      numX: numX,
      numO: numO,
    });

    if (!this.isPass(squares, nextColor)) {
      this.setState({
        bIsNext: !this.state.bIsNext,
      });
    }

    db.collection("actions").add({
      field: JSON.stringify(squares),
      user: uid,
      nextIsBlack: !this.state.bIsNext,
      x: numX,
      o: numO,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
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
    let reverseList = [];
    reverseList.push(this.reversePoint(current, color, i, 0, -1));
    reverseList.push(this.reversePoint(current, color, i, -1, 0));
    reverseList.push(this.reversePoint(current, color, i, -1, 1));
    reverseList.push(this.reversePoint(current, color, i, -1, -1));

    return reverseList;
  }

  isPass(current, color) {
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
        if (current[i*8+j]) {
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

  judgeWinner(current, numX, numO) {
    if (this.isPass(current, 'X') && this.isPass(current, 'O')){
      return numX>numO ? 'Black' : 'White';
    } else {
      return null;
    }
  }

  setField(field) {
    this.setState({
      current: field,
    });
  }

  render() {
    const current = this.state.current;
    const winner = this.judgeWinner(current, this.state.numX, this.state.numO);

    let status;
    let statusB;
    let statusW;
    if (winner) {
      status = "Winner: " + winner;
      statusB = "Black: " + this.state.numX;
      statusW = "White: " + this.state.numO;
    } else {
      status = "Next player: " + (this.state.bIsNext ? "Black" : "White");
      statusB = "Black: " + this.state.numX;
      statusW = "White: " + this.state.numO;
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
          <div>{statusB}</div>
          <div>{statusW}</div>
        </div>
      </div>
    );
  }
}

function initBoard() {
  let board = Array(8**2).fill(null);

  board[27] = 'O';
  board[28] = 'X';
  board[35] = 'X';
  board[36] = 'O';

  return board;
}

export default Game;
