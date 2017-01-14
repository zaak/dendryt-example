const { Network, Trainer, costFunction } = require( 'dendryt' );
const chalk = require( 'chalk' );
const path = require( 'path' );
const fs = require( 'fs' );

const network = Network.create( [
	{ type: 'input', size: 256 },
	{ type: 'sigmoid', size: 32 },
	{ type: 'softmax', size: 10 }
] );

const trainSets = require( './semeion.set' );

const trainer = new Trainer( network, {
	costFunction: costFunction.CE,
	learningRate: 0.01,
	iterations: 1000,
	shuffle: true,
	error: 0.03,
	logging: true
} );

console.log( chalk.green( `Starting training (with ${chalk.cyan(trainSets.length)} training sets...)` ) );

const { error, iterations } = trainer.train( trainSets );


console.log( chalk.green( `Training finished after ${chalk.cyan(iterations)} iterations with net error of ${chalk.cyan(error)}.` ) );

console.log( chalk.green( `Saving trained network...` ) );

const networkPath = path.join( __dirname, 'network.json' );

fs.writeFileSync( networkPath, JSON.stringify( network ) );

console.log( chalk.green( `Trained network saved to ${chalk.cyan(networkPath)}.` ) );