/**
*   @description This module is used for providing service releated to get the uploaded file
*   @module route:uploadFile
*   @requires module:../controller/upload
**/

var UploadController = require('../controller/upload');

module.exports = function (server) {

    /**
    *   @event
    *   @name route:uploadFile./upload
    *   @return array of object <br><br><hr>
    *   @fires module:controller:uploadFile:all
    *   @desc This event fires to get the list of all the uploaded file
    *   <p>HttpMethod POST </p>
    **/
    server.route([{
        method: 'POST',
        path: '/upload',
        config: {
            payload: {
                maxBytes: 209715200,
                output: 'stream',
                parse: false
            }
        },
        handler: UploadController.all
    },

    /**
    *   @event
    *   @name route:uploadFile./upload-background-s3/folder
    *   @param {string}folder - name of the folder
    *   @return stream<br><br><hr>
    *   @fires module:controller:uploadFile:s3background
    *   @desc This event fires to get the list of all the uploaded file of particular folder
    *   <p>HttpMethod POST </p>
    **/
    {
        method: 'POST',
        path: '/upload-background-s3/{folder}',
        config: {
            payload: {
                maxBytes: 209715200,
                output: 'stream',
                parse: false
            }
        },
        handler: UploadController.s3background
    },

    /**
    *   @event
    *   @name route:uploadFile./upload-s3/folder
    *   @param {string}folder - name of the folder
    *   @return stream<br><br><hr>
    *   @fires module:controller:uploadFile:s3
    *   @desc This event fires to get the list of all the uploaded file of particular folder
    *   <p>HttpMethod POST </p>
    **/
    {
        method: 'POST',
        path: '/upload-s3/{folder*}',
        config: {
            payload: {
                maxBytes: 209715200,
                output: 'stream',
                parse: false
            }
        },
        handler: UploadController.s3
    },

    /**
    *   @event
    *   @name route:uploadFile./upload/image
    *   @return stream<br><br><hr>
    *   @fires module:controller:uploadFile:image
    *   @desc This event fires to get the Image
    *   <p>HttpMethod POST </p>
    **/
    {
        method: 'POST',
        path: '/upload/image',
        config: {
            payload: {
                maxBytes: 209715200,
                output: 'stream',
                parse: false
            }
        },
        handler: UploadController.image
    }]);
};
