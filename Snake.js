var dirs = new Array(4);
dirs[0] = 0; dirs[1] = -1; dirs[2] = 0; dirs[3] = 1;
var points_for_one_mouse = 20;
var safe_time = 10;

function Snake( grid, score ) {

    this.row = Math.floor( grid.height/2 )
    this.col = 10;
    this.dir = 0;
    this.safe = 0;
    
    // I'm using a body where each part remembers the previous, then only one
    // part has to change place on moving.
    this.head = new Bodypart( grid.getCell( this.row, this.col ),
                              null, this.row, this.col );
    this.tail = this.head;

    this.grow = function() {
        // We double the tail, then one is left behind one movement.
        this.tail = new Bodypart( this.tail.cell, this.tail,
                                  this.tail.row, this.tail.col );
    }

    this.move = function() {
        // If the tail is alone on his cell, this cell has to be unblocked.
        if( this.tail.row != this.tail.previous.row || this.tail.col !=
            this.tail.previous.col ) grid.clearObstacle( this.tail.row,
            this.tail.col );
        // We determine the next position. (The plus width/height is because
        // javascript does not seem to understand that -1 modulo n equals n-1.
        // Seriously.
        this.row += dirs[ this.dir ] + grid.height;
        this.col += dirs[ (this.dir+3) % 4 ] + grid.width;
        this.row %= grid.height;
        this.col %= grid.width;
        // If the snake is safe, we don't check for obstacles. The safety time
        // decreases with one every time, though.
        // If this position is an obstacle, we return false.
        if( 0 >= this.safe-- && grid.hasObstacle( this.row, this.col ) ) {
            return false;
        }
        // We put the tail (last part) in front of the head. That's only one
        // movement.
        this.head.previous = this.tail;
        this.tail = this.tail.previous;
        this.head = this.head.previous;
        this.head.previous = null;
        // And we reposition the tail (now head).
        this.head.cell = grid.getCell( this.row, this.col );
        this.head.row = this.row; this.head.col = this.col;
        // The place where the head came is now blocked.
        grid.addObstacle( this.head.row, this.head.col );
        // If the head has collided with the mouse, we grow, the mouse respawns
        // and we increase the score.
        if( grid.mouse.row == this.row && grid.mouse.col == this.col ) {
            this.grow();
            grid.mouse.respawn();
            score.add( this, points_for_one_mouse );
        }
        // Move succesful, we return true.
        return true;
    }

    // The snake gets a length of 5 to begin with.
    for( var i = 0; i < 5; i++ ) {
        this.grow();
        this.move();
    }

    this.draw = function() {
        // We clear the previous snake of the board.
        $(".bodypart").removeClass( "bodypart" );
        $("#head").attr( "id", "" );
        // And we redraw it by cycling backwards through the snake.
        var cycler = this.tail;
        while( cycler.previous ) {
            cycler.cell.addClass( "bodypart" );
            cycler = cycler.previous;
        }
        // We didn't pas through the head, because the head doesn't have a
        // previous. We id the head.
        this.head.cell.attr( "id", "head" );
    }

    this.turnLeft = function() {
        // Trivial.
        this.dir = ( this.dir + 1 ) % 4;
    }

    this.turnRight = function() {
        // Trivial.
        this.dir = ( this.dir + 3 ) % 4;
    }

    this.makeSafe = function() {
        // We set the safety time on 10. This should give the player enough time
        // to get reoriented after changing level.
        this.safe = safe_time;
    }

}

function Bodypart( cell, previous, row, col ) {

    // Trivial

    this.cell = cell;
    this.previous = previous;
    this.row = row;
    this.col = col;

}

function Mouse( grid ) {

    var grid = grid;
    this.row = 0; this.col = 0; this.dir = 0;

    // We place the mouse at a random place on the grid.
    this.respawn = function() {
        // We remove the mouse from the previous location.
        grid.getCell( this.row, this.col ).removeClass( "mouse" );
        // We create a new random position and direction.
        this.row = Math.floor( grid.height * Math.random() );
        this.col = Math.floor( grid.width * Math.random() );
        this.dir = Math.floor( 4 * Math.random() );
        // We make sure the location isn't blocked.
        while( grid.hasObstacle( this.row, this.col ) ) {
            this.row = Math.floor( grid.height * Math.random() );
            this.col = Math.floor( grid.width * Math.random() );
        }
        // And we add the mouse to the grid.
        grid.getCell( this.row, this.col ).addClass( "mouse" );
    }

    this.move = function() {
        // We remove the mouse from the previous location.
        grid.getCell( this.row, this.col ).removeClass( "mouse" );
        // Calculating the next location.
        this.row = ( this.row + dirs[this.dir] + grid.height )%grid.height;
        this.col = ( this.col + dirs[(this.dir+3)%4] + grid.width )%grid.width;
        // If the mouse is blocked, we change the direction 180 degrees, and
        // move the mouse out of the blockade.
        if( grid.hasObstacle( this.row, this.col ) ) {
            this.dir = (this.dir+2) % 4;
            this.move(); this.move();
        } else {
            // There's a 1 in 10 chance the mouse will turn left or right.
            if( Math.random() < 0.1 ) {
                if( Math.random() < 0.5 ) this.dir = (this.dir+3)%4;
                else this.dir = (this.dir+1)%4;
            }
            // We add the mouse to the new position.
            grid.getCell( this.row, this.col ).addClass( "mouse" );
        }
    }

}

function Grid( width, height ) {

    this.width = width;
    this.height = height;

    // Creating the grid for the snake.

    var table = $( document.createElement( "table" ) );
    var grid = new Array( height );
    for( var r = 0; r < height; r++ ) {
        var row = $( document.createElement( "tr" ) );
        var gridrow = new Array( width )
        for( var c = 0; c < width; c++ ) {
            var cell = $( document.createElement( "td" ) );
            cell.addClass( "gridcell" );
            row.append( cell );
            gridrow[c] = cell;
        }
        table.append( row );
        grid[r] = gridrow;
    }
    $("#snake").append( table );

    this.getCell = function( row, col ) {
        // Trivial.
        return grid[ row ][ col ];
    }

    // Creating obstacles for the snake. In the beginning, the grid was empty.
    var obstacles = new Array( height );
    for( var i = 0; i < height; i++ ) {
        obstacles[i] = new Array( width );
        for( var j = 0; j < width; j++ ) obstacles[i][j] = false;
    }

    this.addObstacle = function( row, col ) {
        // Trivial.
        obstacles[ row ][ col ] = true;
        grid[ row ][ col ].addClass( "obstacle" );
    }

    this.hasObstacle = function( row, col ) {
        // Trivial.
        return obstacles[ row ][ col ];
    }

    this.clearObstacle = function( row, col ) {
        // Trivial.
        obstacles[ row ][ col ] = false;
        grid[ row ][ col ].removeClass( "obstacle" );
    }

    this.setObstacle = function( row, col, blocked ) {
        // Trivial.
        if( ! blocked ) this.clearObstacle( row, col );
        else this.addObstacle( row, col );
    }

    // Adding the foodstuff.

    this.mouse = new Mouse( this );
    this.mouse.respawn();
    this.newFood = function() {
        // Trivial.
        this.mouse.respawn();
    }

}


