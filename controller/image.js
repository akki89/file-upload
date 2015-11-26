/**
*   @description This module is used for providing service releated to get the uploaded file
*   @module controller:getfile
*   @requires module:../config
*   @requires model:fs
*   @requires model:path
*   @requires model:hapi
*   @requires model:gm
**/



var config = require('../config'),
    fs = require('fs'),
    path = require('path'),
    Hapi = require('hapi'),
    gm = require('gm');

/**
*   @method
*   @name controller:getfile.modifyFileName
*   @param {string}name - Name of the image
*   @param {string}ext - image extension
*   @return name <br><br><hr>
*   @desc This method is used to replace or reduce the name of the string of the file
**/
var modifyFileName = function (name, ext) {
    var s = name.split('.'),
        b = s[s.length - 2];

    return name.replace(b, b + '_' + ext);
};

module.exports = {

    /**
    *   @event
    *   @name controller:getfile.get
    *   @param {obj}req - requsest object
    *   @param {fucntion}reply - interface
    *   @return file<br><br><hr>
    *   @desc This events fires to read and get the file from the /files folder
    **/
    get: function (req, reply) {
        if (!config.imageFormats[req.params.size]) {
            return reply('invalid size');
        }

        if (!req.params.file) {
            return reply(Hapi.error.notFound()) ;
        }

        var folder = __dirname.replace('controller', 'files'),
            original = path.join(folder, req.params.file),
            file = path.join(folder, modifyFileName(req.params.file, req.params.size));

        /**@instance**/
        fs.readFile(file, function (err, data) {/**@callback filereadercallback**/
            if (err) {
                fs.readFile(original, function (err, data) {
                    if (err) {
                        return reply(Hapi.error.notFound()) ;
                    }

                    // generate file
                    var stream = gm(original)
                        .resize(config.imageFormats[req.params.size].width * 2, (config.imageFormats[req.params.size].height * 2) + '')
                        .thumbnail(config.imageFormats[req.params.size].width, config.imageFormats[req.params.size].height + '^')
                        .gravity('center')
                        .extent(config.imageFormats[req.params.size].width, config.imageFormats[req.params.size].height)
                        .profile('*')
                        .stream();

                    //                    var stream = fs.createReadStream(original);
                    /**@function**/
                    var writeStream = fs.createWriteStream(file);

                    stream.pipe(writeStream);

                    stream.on('end', function () {
                        reply.file(file);
                    });

                    //response.reply(response);
                });
            } else {
                reply.file(file);
            }
        });
    }
};
