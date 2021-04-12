//server.js
//2021/4/12
//Andrew Hein
//from https://nodejs.org/en/knowledge/HTTP/servers/how-to-serve-static-files/

var fs = require('fs'),
    http = require('http');

http.createServer(function (req, res) {
  if(req.url == "/"){
    req.url = "index.html";
  }

  fs.readFile(__dirname + "/webroot/" + req.url, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(8080);