import React, {Component} from 'react';
import Node from './Node';
import {
  dijkstra,
  getNodesInShortestPathOrder,
  resetNodes,
} from './algorithms/dijkstra';

import './Grid.css';

const START_NODE_ROW = 5;
const START_NODE_COL = 10;
const FINISH_NODE_ROW = 15;
const FINISH_NODE_COL = 40;

export default class Grid extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
    };
  }
  visitedNodesInOrder = undefined;
  nodesInShortestPathOrder = undefined;

  componentDidMount() {
    this.buildGrid();
  }

  buildGrid() {
    const grid = getInitialGrid();
    this.setState({grid}, () => this.initializeMaze());
  }

  resetGrid() {
    resetNodes(this.state.grid);
    this.buildGrid();

    if (this.visitedNodesInOrder) {
      for (let i = 0; i <= this.visitedNodesInOrder.length; i++) {
        const node = this.visitedNodesInOrder[i];
        if (node && !node.isStart && !node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node';
        } else if (node && node.isStart) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-start';
        } else if (node) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-finish';
        }
      }
    }
  }

  handleMouseDown(row, col) {
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid, mouseIsPressed: true});
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
  }

  handleMouseUp() {
    this.setState({mouseIsPressed: false});
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    this.visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    this.nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(
      this.visitedNodesInOrder,
      this.nodesInShortestPathOrder,
    );
  }

  initializeMaze = () => {
    const {grid} = this.state;
    let relevantIds = [grid[0], grid[grid.length]];
    if (grid.object) relevantIds.push(grid.object);
    // Draw the maze border
    grid.forEach(row => {
      row.forEach(node => {
        let r = node.row;
        let c = node.col;
        if (r === 0 || c === 0 || r === 19 || c === 49) {
          node.isWall = true;
          this.setState({grid});
        }
      });
    });
    // Draw maze internal walls
    let possibleRows = [];
    for (let number = 0; number <= 30; number += 2) {
      possibleRows.push(number);
    }
    let possibleCols = [];
    for (let number = 1; number <= 50; number += 2) {
      possibleCols.push(number);
    }

    grid.forEach((row, i) => {
      row.forEach((node, j) => {
        let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
        let randomColIndex = Math.floor(Math.random() * possibleCols.length);

        if (
          (possibleRows.includes(node.row) && node.row % randomRowIndex > 0) ||
          node.row % randomRowIndex < 2
        ) {
          if (
            (possibleCols.includes(node.col) &&
              node.col % randomColIndex > 1) ||
            node.col % randomColIndex < 2
          ) {
            node.isWall = true;
            this.setState({grid});
          }
        }
      });
    });
  };

  render() {
    const {grid, mouseIsPressed} = this.state;

    return (
      <>
        <button className="mazeButton" onClick={() => this.visualizeDijkstra()}>
          Navigate Labyrinth
        </button>
        <button className="resetButton" onClick={() => this.resetGrid()}>
          Reset
        </button>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
