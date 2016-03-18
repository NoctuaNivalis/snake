var d_interval = 10;
var score_per_level = 100;

function Score( grid, target ) {

    this.score = 0;
    this.level = 0;
    this.interval = 100;

    this.loadMap = function() {
        // Trivial.
        $.get( "levels/" + this.level + ".txt", function( result ) {
            var rows = result.split( "\n" );
            for( var r=0; r<grid.height; r++) for( var c=0; c<grid.width; c++) {
                grid.setObstacle( r, c, rows[r].charAt( c ) == 'x' );
            }
        });
    }
    
    this.updateGrid = function( snake ) {
        if( this.score >= ( this.level + 1 ) * score_per_level ) {
            this.level++;
            snake.makeSafe();
            this.loadMap();
            this.interval -= d_interval; // We decrease the interval between to
                                       // update by ten.
        }
    }

    this.add = function( snake, points ) {
        this.score += points;
        target.html( this.score );
        this.updateGrid( snake );
    }

}
