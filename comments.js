// Create web server
// Start the server: node comments.js
// Test with: curl -i http://localhost:8080/comments
// Test with: curl -i http://localhost:8080/comments/1

// Load the http module to create an http server.
var http = require('http');
var fs = require('fs');
var url = require('url');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
    var path = url.parse(request.url).pathname;
    var method = request.method;
    if (path == '/comments' && method == 'GET') {
        fs.readFile('comments.json', 'utf8', function (err, data) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(data);
        });
    }
    else if (path == '/comments' && method == 'POST') {
        var requestBody = '';
        request.on('data', function (data) {
            requestBody += data;
        });
        request.on('end', function () {
            var comment = JSON.parse(requestBody);
            fs.readFile('comments.json', 'utf8', function (err, data) {
                if (err) {
                    console.log('Error: ' + err);
                    return;
                }
                var comments = JSON.parse(data);
                comments.push(comment);
                fs.writeFile('comments.json', JSON.stringify(comments), function (err) {
                    if (err) {
                        console.log('Error: ' + err);
                        return;
                    }
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(comment));
                });
            });
        });
    }
    else if (path.match(/^\/comments\/(\d+)$/)) {
        var commentId = parseInt(path.match(/^\/comments\/(\d+)$/)[1], 10);
        fs.readFile('comments.json', 'utf8', function (err, data) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }
            var comments = JSON.parse(data);
            var comment = comments.filter(function (comment) { return comment.id == commentId; });
            if (comment.length == 0) {
                response.writeHead(404, { 'Content-Type':