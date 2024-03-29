var mysql = require('mysql');

exports.pool  = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'db',
  database: 'test_db'
});

exports.connection = {
  query: function () {
    var queryArgs = Array.prototype.slice.call(arguments),
      events = [],
      eventNameIndex = {};

    exports.pool.getConnection(function (err, conn) {
      if (err) {
        if (eventNameIndex.error) {
            eventNameIndex.error();
        }
      }
      if (conn) { 
        var q = conn.query.apply(conn, queryArgs);
        q.on('end', function () {
            conn.release();
        });

        events.forEach(function (args) {
            q.on.apply(q, args);
        });
      }
    });

    return {
      on: function (eventName, callback) {
          events.push(Array.prototype.slice.call(arguments));
          eventNameIndex[eventName] = callback;
          return this;
      }
    };
  }
};
