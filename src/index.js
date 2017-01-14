const { Network } = require( 'dendryt' );
const trainedNetwork = require( './training/network.json' );

const network = Network.fromJSON( trainedNetwork );



const canvas = document.getElementById( 'drawing' );
const context = canvas.getContext( '2d' );
const tempCanvas = document.createElement( 'canvas' );
const tempContext = tempCanvas.getContext( '2d' );
const targetCanvas = document.createElement( 'canvas' );
targetCanvas.width = 16;
targetCanvas.height = 16;
const targetContext = targetCanvas.getContext( '2d' );
const resetBtn = document.getElementById( 'resetDrawing' );
const infoBox = document.getElementById( 'infoBox' );
const netResponse = document.getElementById( 'netResponse' );

let isMouseDown = false;
let mouseX = 0;
let mouseY = 0;

tempContext.strokeStyle = context.strokeStyle = '#000000';

context.lineWidth = 10;
context.lineJoin = context.lineCap = 'round';

canvas.addEventListener( 'mousedown', function( evt ) {
	isMouseDown = true;

	mouseX = evt.offsetX;
	mouseY = evt.offsetY;

	context.beginPath();
	context.moveTo( mouseX, mouseY );
} );

resetBtn.addEventListener( 'click', function() {
	context.clearRect( 0, 0, canvas.width, canvas.height );
	targetContext.clearRect( 0, 0, targetCanvas.width, targetCanvas.height );
} );

window.addEventListener( 'mouseup', function( evt ) {
	isMouseDown = false;

	if ( evt.target === canvas ) {
		try {
			cropImageFromCanvas( context, canvas );
		} catch ( e ) {

		}
	}
} );

canvas.addEventListener( 'mousemove', function( evt ) {
	if ( isMouseDown ) {
		mouseX = evt.offsetX;
		mouseY = evt.offsetY;

		context.lineTo( mouseX, mouseY );
		context.stroke();
	}
} );

function cropImageFromCanvas( ctx, canvas ) {

	let w = canvas.width,
		h = canvas.height,
		pix = { x: [], y: [] },
		imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height ),
		x, y, index, ww, hh, lpadding = 0;

	for ( y = 0; y < h; y++ ) {
		for ( x = 0; x < w; x++ ) {
			index = (y * w + x) * 4;
			if ( imageData.data[ index + 3 ] > 0 ) {

				pix.x.push( x );
				pix.y.push( y );

			}
		}
	}
	pix.x.sort( ( a, b ) => a - b );

	pix.y.sort( ( a, b ) => a - b );

	const n = pix.x.length - 1;

	ww = pix.x[ n ] - pix.x[ 0 ];
	hh = pix.y[ n ] - pix.y[ 0 ];
	const cut = ctx.getImageData( pix.x[ 0 ], pix.y[ 0 ], w, h );

	w = ww;
	h = hh;

	if ( ww / hh < 0.3 ) {
		lpadding = hh / 2 - ww / 2;
		w = h = hh;
	}

	tempCanvas.width = w;
	tempCanvas.height = h;
	tempContext.putImageData( cut, lpadding, 0 );

	const networkInput = [];

	targetContext.clearRect( 0, 0, targetCanvas.width, targetCanvas.height );

	for ( x = 0; x < 16; x++ ) {
		for ( y = 0; y < 16; y++ ) {
			const imageData = tempContext.getImageData( w / 16 * x, h / 16 * y, w / 16, h / 16 );

			const setPixel = imageData.data.reduce( ( a, b ) => a + b );

			if ( setPixel ) {
				targetContext.fillRect( x, y, 1, 1 );
			}

			networkInput[ x + 16 * y ] = setPixel ? 1 : 0;
		}
	}

	const netResponse = network.forward( networkInput );

	let highestIndex = null, highestValue = -1;

	for ( let i = 0; i < netResponse.length; i++ ) {
		if ( netResponse[ i ] > highestValue ) {
			highestValue = netResponse[ i ];
			highestIndex = i;
		}
	}

	console.log( highestIndex );
	console.log( 'Network response: ', netResponse );

	showInfo( highestIndex, netResponse );
}

function showInfo( digit, response ) {
	infoBox.innerHTML = '<p><strong>Recognized digit:</strong></p>' +
		'<span style="font-size: 7em">' + digit + '</span>';

	response = response.map( n => n.toFixed( 4 ) );

	let responseTable = '<table class="table table-condensed">';

	response.forEach( ( n, i ) => {
		responseTable +=
			`<tr>
				<th>${i}</th>
				<td>${n}</td>
				<td style="width: 100%">
				<div class="progress">
				  <div class="progress-bar progress-bar-success" style="width: ${parseFloat( n ) * 100.0}%">
					<span class="sr-only">40% Complete (success)</span>
				  </div>
				</div>
				</td>
			</tr>`
	} );

	responseTable += '</table>';

	netResponse.innerHTML = '<p><strong>Network response:</strong></p>' +
		responseTable;
}