var axios = require('axios');

export function harperSaveMessage(text, author, roomId) {
  const dbUrl = "user";
  const dbPw = "root";
  if (!dbUrl || !dbPw) return null;

  var data = JSON.stringify({
    operation: 'insert',
    schema: 'final_project_db',
    table: 'message',
    records: [
      {
        text,
        author,
        roomId,
      },
    ],
  });

  var config = {
    method: 'post',
    url: dbUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: dbPw,
    },
    data: data,
  };

  return new Promise((resolve, reject) => {
    axios(config)
      .then(function (response) {
        resolve(JSON.stringify(response.data));
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

module.exports = harperSaveMessage;