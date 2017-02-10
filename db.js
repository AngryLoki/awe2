let Promise = require("bluebird");
let sqlite3 = Promise.promisifyAll(require("sqlite3")).verbose();
let fs = require('fs');
var Table = require('cli-table');

let filePath = 'test.db3';

fs.unlinkSync(filePath);
let db = new sqlite3.Database(filePath);

function reload() {
  console.log("reloading db");
  db.close();
  db = new sqlite3.Database(filePath);
}

function createTable(table) {
  console.log(`Creating table "${table}"`);
  return db.runAsync(`
  CREATE TABLE ${table} (
    "id" INTEGER PRIMARY KEY NOT NULL
  )`);
}

function addColumn(table, coldef, type_affinity) {
  console.log(`Adding column "${coldef}"`);
  return db.runAsync(`
  ALTER TABLE "${table}" ADD COLUMN "${coldef}" ${type_affinity};
  `);
}

function renameTable(old_name, new_name) {
  return db.runAsync(`
  ALTER TABLE "${old_name}" RENAME TO "${new_name}";
  `);
}

function runCustomAsync(sql, params) {
  return new Promise(function(resolve, reject) {
    db.run(sql, params, function cb(err) {
      if (err) {
        var responseObj = {
          'error': err
        }
        reject(responseObj);
      } else {
        var responseObj = {
          'statement': this
        }
        resolve(responseObj);
      }
    });
  });
}


function check() {
  console.log("checking db");
  db.run(`PRAGMA integrity_check;`);
}

async function dumpTable(table) {
  console.log(`"${table }" data:`);
  let data = await db.allAsync(`SELECT * FROM "${table}"`);

  let keys = Object.keys(data[0])
  var table = new Table({
    head: keys,
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
  });
  for (var i = 0; i < data.length; i++) {
    table.push(Object.values(data[i]).map(x => '' + x));
  }
  console.log(table.toString());
}

async function dumpSql(sql) {
  console.log('response for ' + sql);
  let data = await db.allAsync(sql);

  let keys = Object.keys(data[0])
  var table = new Table({
    head: keys,
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
  });
  for (var i = 0; i < data.length; i++) {
    table.push(Object.values(data[i]).map(x => '' + x));
  }
  console.log(table.toString());
}

function dumpTableInfo(table) {
  return dumpSql(`PRAGMA table_info("${table}");`)
}

async function deleteColumn(table, col) {
  let tableInfo = await db.allAsync(`PRAGMA table_info("${table}");`);

  let create = `CREATE TABLE "${table}" (`;

  let deleted_idx = 1;
  for (var i = 0; i < tableInfo.length; i++) {
    let match = tableInfo[i].name.match(/^UNUSED_(%d+)$/);
    if (match && match[1] >= deleted_idx) {
      deleted_idx = match[1] + 1;
    }
  }

  for (var i = 0; i < tableInfo.length; i++) {
    if (tableInfo[i].name === col) {
      create += `"UNUSED_${deleted_idx}" UNUSED`;
    } else {
      let { name, type, pk, notnull, dflt_value } = tableInfo[i];

      create += `"${name}"`;

      if (type) {
        create += ' ' + type;
      }
      if (pk) {
        create += ' PRIMARY KEY';
      }
      if (notnull) {
        create += ' NOT NULL';
      }
      if (dflt_value !== null) {
        create += " DEFAULT " + JSON.stringify(dflt_value);
      }
    }

    if (i != tableInfo.length - 1) {
      create += ', '
    }
  }
  create += ');'

  console.log(create);

  await db.runAsync(`PRAGMA writable_schema = 1`);
  await db.runAsync('UPDATE SQLITE_MASTER SET SQL = ? WHERE NAME = ?', [create, table]);
  await db.runAsync(`PRAGMA writable_schema = 0`);

  // check();
  await reload();
}

async function renameColumn(table, oldcol, newcol) {
  let tableInfo = await db.allAsync(`PRAGMA table_info("${table}");`);

  let create = `CREATE TABLE "${table}" (`;

  for (var i = 0; i < tableInfo.length; i++) {
    let { name, type, pk, notnull, dflt_value } = tableInfo[i];

    // continue;
    if (name === oldcol) {
      name = newcol;
      // type = 'UNUSED'
      // continue;
    }

    create += `"${name}"`;

    if (type) {
      create += ' ' + type;
    }
    if (pk) {
      create += ' PRIMARY KEY';
    }
    if (notnull) {
      create += ' NOT NULL';
    }
    if (dflt_value !== null) {
      create += " DEFAULT " + JSON.stringify(dflt_value);
    }
    if (i != tableInfo.length - 1) {
      create += ', '
    }
  }
  create += ');'

  console.log(create);

  await db.runAsync(`PRAGMA writable_schema = 1`);
  await db.runAsync('UPDATE SQLITE_MASTER SET SQL = ? WHERE NAME = ?', [create, table]);
  await db.runAsync(`PRAGMA writable_schema = 0`);

  // check();
  await reload();
}


(async function() {
  await createTable('lorem');

  await addColumn('lorem', 'q', 'TEXT');
  await addColumn('lorem', 'w', 'TEXT');
  await addColumn('lorem', 'e', 'TEXT');

  let stmt = db.prepare("INSERT INTO lorem (q, w, e) VALUES (?, 2, 3)");
  for (var i = 0; i < 2; i++) {
    await stmt.runAsync("v=" + i);
  }
  stmt.finalize();

  await dumpTable('lorem');

  await dumpTableInfo('lorem')
  // dumpTable('SQLITE_MASTER');

  await renameColumn('lorem', 'q', 'a');
  await deleteColumn('lorem', 'e');

  stmt = db.prepare("INSERT INTO lorem (a, w) VALUES (?, 4)");
  for (var i = 2; i < 4; i++) {
    await stmt.runAsync("v=" + i);
  }
  stmt.finalize();

  await dumpTable('lorem');

  await dumpTableInfo('lorem');

  db.close();

  // dumpTable('SQLITE_MASTER');

})();
