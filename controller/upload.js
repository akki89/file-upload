/**
*   @description This module is used for providing service related to file upload
*   @module controller:uploadFile
*   @requires module:hapi
*   @requires module:fs
*   @requires module:multiparty
*   @requires module:crypto
*   @requires module:gm
*   @requires module:../config
*   @requires module:path
*   @requires module:node-redis-pubsub
*   @requires module:slug
*   @requires module:aws-sdk
**/

var Hapi = require('hapi'),
    fs = require('fs'),
    multiparty = require('multiparty'),
    crypto = require('crypto'),
    gm = require('gm').subClass({ imageMagick: true }),
    config = require('../config'),
    path = require('path'),
    slug = require('slug'),
    AWS = require('aws-sdk');

AWS.config.update(config.s3);
var s3 = new AWS.S3();


/**
*   @method
*   @name controller:uploadFile.uniqueFilename
*   @param {string}name - name of the file
*   @return filename <br><br><hr>
*   @desc This method is used to change the name of the file and add the todaydate at the end of the string
**/
var uniqueFilename = function (name) {
    var shasum = crypto.createHash('sha1'),
        filename;

    name = name.replace('.' + getExtension(name), '');
    name = slug(name.toLowerCase(), {
        replacement: '-',
        symbols: true
    });

    shasum.update(name + new Date());
    filename = shasum.digest('hex');
    filename += '_';
    filename += name;

    return filename;
};

/**
*   @method
*   @name controller:uploadFile.getExtension
*   @param {string}filename - name of the file
*   @return file extension <br><br><hr>
*   @desc This method is used to change the name of the file
**/
var getExtension = function (filename) {
    var ext = path.extname(filename || '').split('.');
    ext = ext[ext.length - 1];
    ext = ext.replace('jpeg', 'jpg');
    return ext;
};

/**
*   @method
*   @name controller:uploadFile.createFilename
*   @param {string}slug - remove special character from name
*   @param {string}filename - name of the file
*   @return filename <br><br><hr>
*   @desc This method is used to remove the special character from the file name
**/
var createFilename = function (slug, filename) {
    if (!filename) {
        filename = slug;
    }

    var newFilename = uniqueFilename(slug || filename);
    newFilename += '.' + getExtension(filename);
    return newFilename;
};

/**
*   @method
*   @name controller:uploadFile.doUpload
*   @param {string}filepath - path to the file
*   @param {string}newpath - new path of the file
*   @param {string}newFilename - new name of the file
*   @param {interface}reply - interface to reply
*   @return stream <br><br><hr>
*   @desc This method is used to create the copy of the file and return the copy of the file and new path
**/
var doUpload = function (filepath, newpath, newFilename, reply) {
    fs.ReadStream(filepath)
        .pipe(fs.createWriteStream(newpath));

    reply({
        path: newpath,
        filename: newFilename
    });
};

/**
*   @method
*   @name controller:uploadFile.doS3BackgroundUpload
*   @param {string}filepath - path to the file
*   @param {string}newpath - new path of the file
*   @param {string}newFilename - new name of the file
*   @param {string}folder - folder name
*   @param {interface}reply - interface to reply
*   @return stream <br><br><hr>
*   @desc This method is used to upload Background file to aws server
**/
var doS3BackgroundUpload = function (filepath, newpath, newFilename, folder, reply) {


    [1400, 1200, 1000, 800, 600, 400].forEach(function (size) {
        var stream = gm(filepath)
        .resize(size)
        .stream() ;

        var filename = filepath + "_" + size ;

        var wws = fs.createWriteStream(filename);
        wws.on('finish', function () {
            console.log(filename);

            var key = 'sponsors/' + size + '/' + path.basename(newFilename);

            s3.putObject({
                Bucket: config.bucket,
                Key: key,
                Body: fs.createReadStream(filename),
                ACL: 'public-read'
            }, function (resp) {
                console.log(bucket);
                console.log('done ' + key) ;
                console.log(filepath);
            }) ;

        });

        stream.pipe(wws);



    }) ;

    reply({
        path: newpath,
        filename: newFilename
    }) ;

};

/**
*   @method
*   @name controller:uploadFile.doS3Upload
*   @param {string}filepath - path to the file
*   @param {string}newpath - new path of the file
*   @param {string}newFilename - new name of the file
*   @param {string}folder - folder name
*   @param {interface}reply - interface to reply
*   @return stream <br><br><hr>
*   @desc This method is used to upload file to aws server
**/
var doS3Upload = function (filepath, newpath, newFilename, folder, reply) {
    var rs = fs.createReadStream(filepath);
    var key = folder + "/" + newFilename;

    var now = new Date() ;
    console.log("" + now + " : " + filepath + " -> " + key) ;

    s3.putObject({
        Bucket: config.bucket,
        Key: key,
        Body: rs,
        ACL: 'public-read'
    }, function (err, resp) {
        if (err) {
            console.error(err) ;
            console.error("" + now + " s3upload-error: " + filepath + " -> " + key) ;
            return ;
        }

        fs.unlink(filepath, function (err) {});
        console.log('successfully uploadded ' + key);
    });

    reply({
        path: newpath,
        filename: newFilename
    });
};

/**
*   @method
*   @name controller:uploadFile.doImageUpload
*   @param {string}filepath - path to the file
*   @param {string}newpath - new path of the file
*   @param {string}newFilename - new name of the file
*   @param {interface}reply - interface to reply
*   @return stream <br><br><hr>
*   @desc This method is used to upload image to AWS server
**/
var doImageUpload = function (filepath, newpath, newFilename, reply) {
    var rs = fs.ReadStream(filepath);
    var ws = fs.createWriteStream(newpath);

    ws.on('finish', function () {

        Object.keys(config.imageFormats).forEach(function (key) {
            var size = config.imageFormats[key];
            var wws;
            var workerPayload;
            var filename = path.dirname(newpath) + "/" + path.basename(newFilename, path.extname(
                newFilename)) + "_" + key + path.extname(newFilename);

            var stream = gm(filepath)
                .resize(size.width * 2, (size.height *
                    2) + '')
                .thumbnail(size.width, size.height +
                    '^')
                .gravity('center')
                .extent(size.width, size.height)
                .profile('*')
                .stream();

            wws = fs.createWriteStream(filename);
            wws.on('finish', function () {
                var key = 'profiles/' + path.basename(filename);

                s3.putObject({
                    Bucket: config.bucket,
                    Key: key,
                    Body: fs.createReadStream(filename),
                    ACL: 'public-read'
                }, function (resp) {
                    console.log(resp);
                    console.log('done + ' + key);
                    fs.unlink(filename, function (err) {});
                });

            });

            stream.pipe(wws);
        });

        fs.unlink(newpath, function(err){});
        reply({
            path: newpath,
            filename: newFilename
        }) ;

    });

    rs.pipe(ws);

};

module.exports = {

    /**
    *   @event
    *   @name controller:uploadFile.s3background
    *   @param {object}req - req object
    *   @param {interface}reply - used to reply
    *   @desc Used to upload CMS PICTURES
    **/
    s3background: function (req, reply) {
        var form = new multiparty.Form();
        form.parse(req.payload, function (err, fields, files) {

            if (fields.originalFilename) {
                files.file[0].originalFilename = fields.originalFilename[0];
            }

            var newpath = __dirname.split('controller')[0] + "files/",
                filepath = files.file[0].path,
                newFilename = createFilename(files.file[0].originalFilename);

            newpath += newFilename;

            return doS3BackgroundUpload(filepath, newpath, newFilename, req.params.folder, reply);
        });

    },

    /**
    *   @event
    *   @name controller:uploadFile.s3
    *   @param {object}req - req object
    *   @param {interface}reply - used to reply
    *   @return stream<br><br><hr>
    *   @desc Used to upload VIDEO and AUDIO files
    **/
    s3: function (req, reply) {
        var form = new multiparty.Form();

        form.parse(req.payload, function (err, fields, files) {
            // another hack to upload mp3s from frontend app
            if (fields.originalFilename) {
                files.file[0].originalFilename = fields.originalFilename[0];
            }

            var newpath = __dirname.split('controller')[0] + "files/",
                filepath = files.file[0].path,
                newFilename = createFilename(files.file[0].originalFilename);

            newpath += newFilename;

            return doS3Upload(filepath, newpath, newFilename, req.params.folder, reply);
        });
    },

    /**
    *   @event
    *   @name controller:uploadFile.all
    *   @param {object}req - req object
    *   @param {interface}reply - used to reply
    *   @return stream <br><br><hr>
    *   @desc Used to upload everything in /profile folder on S3
    **/
    all: function (req, reply) {
        var form = new multiparty.Form();

        form.parse(req.payload, function (err, fields, files) {
            // another hack to upload mp3s from frontend app
            if (fields.originalFilename) {
                files.file[0].originalFilename = fields.originalFilename[0];
            }

            var newpath = __dirname.split('controller')[0] + "files/",
                filepath = files.file[0].path,
                newFilename = createFilename(files.file[0].originalFilename);

            newpath += newFilename;

            return doS3Upload(filepath, newpath, newFilename, 'profiles', reply);
        });
    },

    /**
    *   @event
    *   @name controller:uploadFile.image
    *   @param {object}req - req object
    *   @param {interface}reply - used to reply
    *   @return stream<br><br><hr>
    *   @desc Used to upload PROFILE PICTURES
    **/
    image: function (req, reply) {
        var form = new multiparty.Form();

        form.parse(req.payload, function (err, fields, files) {
            if (!fields || files.length < 1) {
                return reply(Hapi.error.badRequest('invalid payload!'));
            }
            fs.exists(__dirname.split('controller')[0] + "files/",function(exists){
                if(!exists){
                    console.log('Folder not found');
                    fs.mkdirSync(__dirname.split('controller')[0] + "files/");
                    console.log('Creating Folder');
                }
                // hack to allow images from frontend app
                // this really needs a better handling
                if (files.file[0].headers['content-type'].indexOf('octet-stream') > -1) {
                    files.file[0].headers['content-type'] = fields.mimetype[0];
                    files.file[0].originalFilename = 'stream.' + fields.mimetype[0].split('/')[1];
                }

                var slug = fields.slug && fields.slug.length > 0 ? fields.slug[0] : files.file[0].originalFilename,
                    newpath = __dirname.split('controller')[0] + "files/",
                    allowedFiletypes = ['jpg', 'jpeg', 'png', 'gif'],
                    filepath = files.file[0].path,
                    mimetype = files.file[0].headers['content-type'].split('/'),
                    newFilename = createFilename(slug, files.file[0].originalFilename);

                // TODO: allow only images
                if (mimetype[0] != 'image' && mimetype[1].indexOf(allowedFiletypes) < 0) {
                    return reply(Hapi.error.badRequest('only images are allowed'));
                }

                newpath += newFilename;

                return doImageUpload(filepath, newpath, newFilename, reply);
            });
        });
    }
};
