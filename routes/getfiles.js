/**
*   @description This module is used for providing service releated to get the uploaded file
*   @module route:getImage
*   @requires module:../controller/upload
*   @requires model:../controller/image
**/

var ImageController = require('../controller/image');

module.exports = function (server) {

    /**
    *   @event
    *   @name route:getImage./path*
    *   @param {string}path - Path to the file
    *   @return file <br><br><hr>
    *   @desc This event fires to get the file using the path param
    *   <p>HttpMethod GET </p>
    **/
    server.route([{
        method: 'GET',
        path: '/{path*}',
        handler: {
            directory: { path: './files', listing: false, index: true }
        }
    },

    /**
    *   @event
    *   @name route:getImage./avatars/path*
    *   @param {string}path - Path to the file
    *   @return file<br><br><hr>
    *   @desc This event fires to get the file of avatars
    *   <p>HttpMethod GET </p>
    **/
    {
        method: 'GET',
        path: '/avatars/{path*}',
        handler: {
            directory: { path: './files/avatars', listing: false, index: true }
        }
    },

    /**
    *   @event
    *   @name route:getImage./size/file*
    *   @param {string}file - name of the file
    *   @param {string}size - size of the file
    *   @return file<br><br><hr>
    *   @desc This event fires to get the file of avatars
    *   @fire module:controller:getImage:get
    *   <p>HttpMethod GET </p>
    **/
    {
        method: 'GET',
        path: '/{size}/{file*}',
        handler: ImageController.get
    }]);
};
