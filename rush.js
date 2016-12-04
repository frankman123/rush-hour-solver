// Rush Hour© game solver (6x6 grid regular version)
// See: https://en.wikipedia.org/wiki/Rush_Hour_(board_game)

// Written in javascript. 
// Run using NodeJS on the command line, e.g: node rush.js
// Output goes to STDOUT

// This algorithm uses a brute force Breath First Search using a queue.
// 'Child' nodes (moves) are discovered by iterating on every car on the board 
// and checking if it can move in a particular direction.
// Every visited node is stored in a dictionary (hash list) so we don't visit
// it again.


// Ok, we start with some form of data representation of a game state

// I'm using a list of the cars and their properties: 
// dir(ection): H = Horizontal, V = Vertical
// len(gth)   : Nimber of squares they occupy. (2 or 3)
// pos(ition) : [row,col] of the first square of the car (the 'trunk'). 
// Upper left corner of the board is [1,1].
// "Your" car is the first one in the list. Index 0.

// The following data set corresponds to level 1 (easiest)
var card_1 = [
        {   
            dir : "H",    
            len : 2,      
            pos : [3,2],   
        },
        {   
            dir : "H",
            len : 2,
            pos : [1,1],
        },
        {
            dir : "V",
            len : 3,
            pos : [1,6],
        },
        {
            dir : "V",
            len : 3,
            pos : [2,1],
        },
        {
            dir : "V",
            len : 3,
            pos : [2,4],
        },
        {
            dir : "V",
            len : 2,
            pos : [5,1],
        },
        {
            dir : "H",
            len : 2,
            pos : [5,5],
        },
        {
            dir : "H",
            len : 3,
            pos : [6,3],
        }
]

// this data corresponds to level 40 of the game (hardest!)
var card_40 = [   
        {   
            dir : "H",
            len : 2,
            pos : [3,4],
        },
        {   
            dir : "V",
            len : 3,
            pos : [1,1],
        },
        {
            dir : "H",
            len : 2,
            pos : [1,2],
        },
        {
            dir : "V",
            len : 2,
            pos : [1,5],
        },
        {
            dir : "V",
            len : 2,
            pos : [2,2],
        },
        {
            dir : "V",
            len : 2,
            pos : [2,3],
        },
        {
            dir : "V",
            len : 3,
            pos : [2,6],
        },
        {
            dir : "H",
            len : 3,
            pos : [4,1],
        },
        {
            dir : "V",
            len : 2,
            pos : [4,4],
        },

        {
            dir : "V",
            len : 2,
            pos : [5,3],
        },
        {
            dir : "H",
            len : 2,
            pos : [5,5],
        },
        {
            dir : "H",
            len : 2,
            pos : [6,1],
        },
        {
            dir : "H",
            len : 2,
            pos : [6,4],
        }
]

// choose which puzzle to solve
var cars = card_40

// we know that dir and len of a car never change in a game, 
// so we can define a game state by simply listing the car positions
var positions = [];

// here we'll store the nodes (positions) we have visited
var nodes = {};

// this 2D matrix is used to find empty spaces to move to
var matrix = new Array(7);
for (var i=1; i<7; i++) {
	matrix[i] = new Array(7);
}

// populate 'positions' with initial config.
get_positions(cars, positions);

// we define the root (starting) node
root = { pos: positions,
         parent: null,
         play: '',
         };

// length of solution (for statistics only)
var solLen = 0;

// main function (breath first search)
function bfs(root) {
    // for statistics only
    var maxQueueLength = 0;
    
    // the queue 
    var Q = [];

    // put root node in queue
    Q.unshift(root)                      

    while (Q.length > 0) {        

        if (Q.length > maxQueueLength) {
           maxQueueLength = Q.length 
        }

        var current = Q.pop()

        // is this a winning position?
        if (checkWin(current)) {
            console.log("+++++++++++++++++");
            console.log("    SUCCESS!");
            console.log("+++++++++++++++++");
            printWinningSequence(current)
            console.log("               ")
            console.log("---- Stats ----")
            console.log("Max Queue Length : " + maxQueueLength)
            console.log("Nodes Examined   : " + Object.keys(nodes).length)
            console.log("Solution Length  : " + solLen)

            return
        }

		// find a child node (i.e: a car we can move)

        // this populates the 2D matrix so we can easily find empty spaces 
        createSpaceMatrix(current);

        // iterate over cars and for each possible move create a node and put it in the Queue 
        for (var c = 0; c < cars.length; c++) {
			if (cars[c].dir == "V") {  // it's vertically oriented
				// can we move it up? 
				if ( current.pos[c][0]-1 >= 1) { // there's no wall blocking 
					if (matrix[ current.pos[c][0]-1 ] [ current.pos[c][1] ] < 0) { // there's no car blocking 
                        // great! create new child node by cloning current one and moving car up 1 square
						var newPos = {}; 
						clone(current, newPos);
						newPos.pos[c][0]--;   
                        // check if we already visited this node before putting in queue
						if (!marked(newPos)) {
                            newPos.parent = current;
                            newPos.play = "Move "+String.fromCharCode(c+65)+" up." // this string describes the move
                            mark(newPos) // mark as visited (also stores node and links it to its parent)
							Q.unshift(newPos) // queue it
						} 
					} 
                } 
			    // same thing but for downwards movement 
                if ( current.pos[c][0]+cars[c].len <= 6 ) { 
                    if (matrix[ current.pos[c][0]+cars[c].len ] [ current.pos[c][1] ] < 0) { 
                        var newPos = {};
                        clone(current, newPos);
                        newPos.pos[c][0]++;
                        if (!marked(newPos)) {
                            newPos.parent = current;
                            newPos.play = "Move "+String.fromCharCode(c+65)+" down."
                            mark(newPos)
                            Q.unshift(newPos)
                        }
                    }
                }
             }
             // all over again but for horizontal cars
			 else if (cars[c].dir == "H") {  
				if ( current.pos[c][1]-1 >= 1) { 
					if (matrix[ current.pos[c][0] ] [ current.pos[c][1]-1 ] < 0) { 
						var newPos = {}
						clone(current, newPos);
						newPos.pos[c][1]--;
						if (!marked(newPos)) {
                            newPos.parent = current;
                            newPos.play = "Move "+String.fromCharCode(c+65)+" left."
                            mark(newPos)
							Q.unshift(newPos)
						} 
					} 
				} 
                if ( current.pos[c][1]+cars[c].len <=6 ) { 
                    if (matrix[ current.pos[c][0] ] [ current.pos[c][1]+cars[c].len ] < 0) { 
                        var newPos = {}
                        clone(current, newPos);
                        newPos.pos[c][1]++;
                        if (!marked(newPos)) {
                            newPos.parent = current;
                            newPos.play = "Move "+String.fromCharCode(c+65)+" right."
                            mark(newPos)
                            Q.unshift(newPos)
                        }
                    }
                }
             }
        } // end for car
    } // end while queue
} // end bfs


// helper functions

// Check if this is a winning position
// i.e: red car (car indexed 0) is next to exit (column position is 5)
function checkWin(p) {
    return (p.pos[0][1] == 5)

}


// print winning sequence by following child to parent chain
function printWinningSequence(p) {
    solLen++;
    if (p == null)
        return
    printWinningSequence(p.parent)
    console.log("---------------");
    console.log(p.play);
    console.log("---------------");
    printPosition(p);
    return 
}

// clone a node and link it to its parent
function clone(c, new_c) {
    new_c.pos = new Array(c.pos.length);
    for (var i=0; i < c.pos.length; i++) {
        new_c.pos[i] = new Array(2);
    }

	for (var i=0; i < c.pos.length ; i++) {
		new_c.pos[i][0] = c.pos[i][0];	
		new_c.pos[i][1] = c.pos[i][1];	
    }
    new_c.parent = c.parent
} 

// Add node to a hash list.
// This simultaneously serves to mark the node as visited and stores it for 
// future printout of winning sequence 
function mark(s) {
    nodes[get_hash(s)] = s;
}

// Check if node is marked (visited)
function marked(s) {
    return (nodes[get_hash(s)])
}

// Create a hash that id's node. Simply a string of all car positions in order.
function get_hash(s) {
    var hash = '';
    for (var i=0; i < s.pos.length; i++) {
        hash = hash + s.pos[i][0] + "x" + s.pos[i][1]+"-"
    }
    return hash;
}

// This function fills an array of positions given an array of cars
function get_positions (c, p) {
	var numberOfCars = c.length;
	for (var i = 0; i < numberOfCars; i++) {
		p[i] = c[i].pos	
	}
}


// Fills 2D matrix to make finding empty spaces easier
function createSpaceMatrix(p) {
    var i = 1;
    var j = 1;
    // iterate over cells
    for (i = 1; i <= 6; i++) {
        for (j = 1; j <= 6; j++) {
            var found = 0;
            // iterate over cars to see if it one covers this cell
            for (var c = 0; c < cars.length; c++) {
                var pos = p.pos[c]
                if (cars[c].dir == "H" && pos[0] == i) { // is horizontal and on this row?
                    if (pos[1]+cars[c].len-1 >= j && pos[1] <= j) { // does it cover this cell?
                        matrix[i][j]=c;
                        found = 1;
                        break;
                    } 
                }
                if (cars[c].dir == "V" && pos[1] == j) { // is vertical and on this col?                    
                    if (pos[0]+cars[c].len-1 >= i && pos[0] <= i) { // does it cover this cell?
                        matrix[i][j]=c;
                        found = 1;
                        break;
                    }
                }
            }
            if (found == 0) {
            	matrix[i][j]=-1;
            }
        }
    }
}

// function that prints out a position/state in human readable form
function printPosition(p) {
    var i = 1;
    var j = 1;
    for (i = 1; i <= 6; i++) {
        var line = "";
        for (j = 1; j <= 6; j++) {
            var found = 0;
            for (var c = 0; c < cars.length; c++) {
                if (p==null) {
                    console.log("p is null?!")
                    return
                }
                var pos = p.pos[c];

                if (cars[c].dir == "H" && pos[0] == i) { // is horizontal and on this row?
                    if (pos[1]+cars[c].len-1 >= j && pos[1] <= j) { // does it cover this cell?
                        line = line + String.fromCharCode(c+65); // put an alphabet character id for the car
                        found = 1;
                        break;
                    } 
                }
                // same for vertical
                if (cars[c].dir == "V" && pos[1] == j) {
                    if (pos[0]+cars[c].len-1 >= i && pos[0] <= i) {
                        line = line + String.fromCharCode(c+65);
                        found = 1;
                        break;
                    }
                }
            }
            if (!found) {
                line = line + "."
            }
        }
        if (i == 3) {
            line = line + " -> exit"
        }
        console.log(line);
    }
}


// kickstart the whole thing 
bfs(root)
