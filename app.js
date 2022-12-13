const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

module.exports = app;
//API ONE
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const getSearchQuery = `SELECT * FROM todo WHERE status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND todo LIKE '%${search_q}%';`;

  const array = await db.all(getSearchQuery);
  response.send(array);
});

//API TWO

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getSearchQuery = `SELECT * FROM todo WHERE id=${todoId};`;

  const array = await db.get(getSearchQuery);
  response.send(array);
});

//API THREE
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const insertQuery = `INSERT INTO todo(id,todo,priority,status) VALUES(${id},'${todo}','${priority}','${status}');`;
  const object = await db.run(insertQuery);
  response.send("Todo Successfully Added");
});

//API FOUR
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo = null, priority = null, status = null } = request.body;

  let method = null;
  let value = null;
  let message = null;

  if (todo !== null) {
    method = "todo";
    value = todo;
    message = "Todo Updated";
  } else if (priority !== null) {
    method = "priority";
    value = priority;
    message = "Priority Updated";
  } else {
    method = "status";
    value = status;
    message = "Status Updated";
  }
  const updateQuery = `UPDATE todo SET ${method}='${value}' WHERE id=${todoId};`;
  const result = await db.run(updateQuery);
  response.send(message);
});

//API FIVE
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM 
      todo 
    WHERE
      id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
