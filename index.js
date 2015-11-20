/** REQUIREMENTS */
var fs = require('fs');
var mongoose = require('mongoose');
var evh = require('express-vhost');
var express = require('express');

// environment & config
var env = process.env.NODE_ENV || 'dev';
var config = require(__dirname + '/config/app')[env];


/** MONGO */
// connect to mongodb
// var maxRetries = 5,
//     retries = 0,
//     mongoEnabled = false;
// var connect = function () {
//   console.log('connecting');
//   var options = {
//     server: {
//       socketOptions: { keepAlive: 1 }
//     }
//   };
//   mongoose.connect(config.db+'root', options);
// };
// if(mongoEnabled){
//     connect();
// }
//
// // Error handler
// mongoose.connection.on('error', function (err) {
//   console.log('Mongo Error: ' + err);
// });
//
// // Reconnect when closed
// mongoose.connection.on('disconnected', function () {
//   if(retries < maxRetries){
//       connect();
//       retries++;
//   }
// });


/** Express */

// vhosts

var createServer = function(name, models, views, routes, db) {
    var svr = express();

    //configure server
    svr.use(express.bodyParser());
    svr.use(express.compress());
    svr.use('/public', express.static(__dirname + '/public/'+name));

    //load models
    var models_path = __dirname + '/models/'+models;
    fs.readdirSync(models_path).forEach(function(file) {
        if(~file.indexOf('.js')) require(models_path + '/' + file);
    });

    //set views, view engine
    svr.set('views', __dirname+'/views/'+views);
    svr.set('view engine', 'ejs');

    //configure database connection
    var conn;
    if(db) {
        conn = mongoose.createConnection(config.db+name);
    }

	//www redirect
	function wwwRedirect(req, res, next) {
		if (req.headers.host.slice(0, 4) === 'www.') {
			var newHost = req.headers.host.slice(4);
			return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
		}
		next();
	};

	svr.set('trust proxy', true);
	svr.use(wwwRedirect);

    //apply routes
    require( __dirname + '/config/'+routes+'/routes')(svr, conn, name);

    return svr;
};


// create main server
// var server = app = express();
// server.use(evh.vhost(app.enabled('trust proxy')));
//
// // configure server
// server.use(express.bodyParser());
// server.use(express.compress());
// server.use('/public', express.static(__dirname + '/public/root'));
//
// // load models
// var models_path = __dirname + '/models'
// fs.readdirSync(models_path).forEach(function (file) {
//   if (~file.indexOf('.js')) require(models_path + '/' + file);
// });
//
// //set views, view engine
// server.set( 'views', __dirname + '/views/root' );
// server.set( 'view engine', 'ejs' );
//
// // apply routes
// require( __dirname + '/config/routes')(server);
//
// // listen to the supplied port
// server.listen(config.ports.server, function() {
//   console.log('listening to port ' + config.ports.server);
// });

//create and register virtual hosts
/**
    the createServer method takes 4 directory names as input params.
    make sure you have these directories (and files) in your file system.

    name = public files dir (/public/[project name]/[your files here])
    models = models dir (/models/[models name]/[your files here])
    views = views dir (/views/[views name]/[your files here])
    routes = routes dir (/config/[routes name]/routes.js)*
    db = enable database connection to [name] database specified previously (true/false)

    this can allow easy sharing of logic between applications if necessary.

    * controllers are imported into routes.js files

    to enable vhosts un-comment the lines below and configure to
    your needs.

    front-end configuration to be added next.
**/

var vhosts = {
    dev: {
        treadwelltraining: 'treadwelltraining.local'
    },
    prod: {
        treadwelltraining: 'treadwelltraining.com'
    }
};

var treadwelltraining = createServer('treadwelltraining', 'treadwelltraining', 'treadwelltraining', 'treadwelltraining', true)

evh.register(vhosts[env].treadwelltraining, treadwelltraining);
evh.register('www.'+vhosts[env].treadwelltraining, treadwelltraining);
