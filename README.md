## Getting started ##

To start the fileupload server write this command in the terminal
 **node index.js**

This will start the server at port **3002** and you can test the running server by writing **http://localhost:3002**. To change the configuration like amazon server keys or port number please see the config folder as needed.

## Purpose ##

The purpose of the globalrockstar-fileupload repository  is to provide the functionality of file upload to **amazon server** and get the file from amazon server 

## Repository Structure ##

The code is divided in to different folder so that it become easy to under the flow of the code
**/config : -** This folder contain the files that contain the different URL  endpoints that are used for establish connection like connection with the amazon server or to other repository  and some other configuration detail.

**/routes : -**  This folder contains modules where all the routes exposed by the API server and their Handler are defined.

**/controller : -** This folder contains the module whose function is to connect to aws server and upload the file to aws server

## Main module in repository ##
In this repository there mainly two module
* getfile
* uploadfile
 
## Short description of each module ##
**getfile -** This module is used to get the file from the amazon server
**uploadfile -** This module is used to upload the file to the amzon server

## Goals ##
To upload and download the file from aws server