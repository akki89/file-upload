var hapi = require('hapi'),
    config = require('./config');

exports.register = function (plugin, options, next) {
    require('./routes')(plugin.select('upload')) ;
    return next() ;
} ;

exports.register.attributes = {
    name: 'gr-fileupload',
    version: '1.0.0'
};
