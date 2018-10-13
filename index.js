const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const config = require('./config');

// Function to get the Trimmed path from Requested URL
// In <- URL, (Boolean QueryString needed?)
// Return -> TrimmedURL
function getTrimmedPath(parsedUrl) {

  // Get the pathName from the request
  var path = parsedUrl.pathname;

  // Trimmed the path
  var trimmedUrl = path.replace(/^\/+|\/+$/g, '');
  return trimmedUrl;
}

// Get Data function.
// Get the request and return
// PATH, QUERYSTRING, METHOD and HEADERS
function getDataFromRequest(req) {
  // Parsing the URL with Query string
  var parsedUrl = url.parse(req.url, true);

  // Get the trimmedURL from parsedString
  var trimmedPath = getTrimmedPath(parsedUrl);

  // Get the query string as object
  var queryString = parsedUrl.query;

  // Request method
  var method = req.method.toUpperCase();

  // Get the headers from the request as an object
  var headers = req.headers;
  
  // return Object
  var outData = {};
  outData.trimmedUrl = trimmedPath;
  outData.queryString = queryString;
  outData.method = method;
  outData.headers = headers;

  return outData;
}

const server = http.createServer(function(req, res) {  

  // Get data object
  var dataObject = getDataFromRequest(req);

  var buffer = '';
  var decoder = new StringDecoder('utf-8');

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // Selecting the handler from the trimmedURL
    // Checking whether trimmedUrl is defined on the router object
    // If not defined notFound Handler
    var chosedHandler = (typeof(router[dataObject.trimmedUrl]) !== 'undefined') ? router[dataObject.trimmedUrl] : handlers.notFound;

    // Add payload to data object
    dataObject.payload = buffer;

    chosedHandler(dataObject, function(statusCode = 200, payload = {}){
      var payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'JSON');
      res.writeHead(statusCode);
      res.end(payloadString);
    });

  });
});

server.listen(config.port, function(){
  console.log(`Listening on: ${config.port}, ENV: ${config.envName}`);
});


// Handlers object
const handlers = {}

// Add /hello handler 
handlers.hello = function(data, callback) {
  callback(200, {'welcome': 'Hello from the Server'});
}

// Not found handler
handlers.notFound = function(data, callback) {
  callback(404);
}

// Request router
const router = {
  'hello': handlers.hello
}
