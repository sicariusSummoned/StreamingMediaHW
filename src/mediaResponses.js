const fs = require('fs'); // pull in the file system module
const path = require('path');


const checkError = (err, response) => {
  if (err) {
    if (err.code === 'ENOENT') {
      response.writeHead(404);
    }
    return response.end(err);
  }
  return 0;
};

const getPositions = (request) => {
  let range = request.headers.range;

  if (!range) {
    range = 'bytes=0-';
  }

  return range.replace(/bytes=/, '').split('-');
};

const getChunkSize = (start, end) => {
  const chunksize = (end - start) + 1;

  return chunksize;
};

const runStream = (file, response, start, end) => {
  const stream = fs.createReadStream(file, {
    start,
    end,
  });

  stream.on('open', () => {
    stream.pipe(response);
  });

  stream.on('error', (streamErr) => {
    response.end(streamErr);
  });


  return stream;
};

const loadFile = (request, response, filePath, fileType) => {
  const file = path.resolve(__dirname, filePath);

  fs.stat(file, (err, stats) => {
    checkError();

    const positions = getPositions();
    const total = stats.size;
    let start = parseInt(positions[0], 10);
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    if (start > end) {
      start = end - 1;
    }


    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': getChunkSize(start, end),
      'Content-Type': fileType,
    });

    return runStream(file, response, start, end);
  });
};


const getParty = (request, response) => {
  loadFile(request, response, '../client/party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  loadFile(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  loadFile(request, response, '../client/bird.mp4', 'video/mp4');
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
