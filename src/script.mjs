import express from "express";

const app = express();

app.use(express.json());

const loggingMiddleware = (request, response, next) => {
  console.log(`${request.method} = ${request.url}`);
  next();
};
app.use(loggingMiddleware);

const PORT = process.env.PORT || 3000;

const mockUsers = [
  { id: 1, username: "jam wuju", displayName: "Mother Cocker" },
  { id: 2, username: "dalniy vostok", displayName: "Jack Vorobey" },
  { id: 3, username: "ewe popitka", displayName: "Krutaya Morkovcha" },
];

const resolveIndexByUserId = (request, response, next) => {
  const {
    params: { id },
  } = request;
  const parsedId = parseInt(id);
  if (isNaN(parsedId))
    return response.status(400).send({ msg: "bad request. not parsed" });
  const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);

  if (findUserIndex === -1) return response.sendStatus(404);
  request.findUserIndex = findUserIndex;
  next();
};

app.get(
  "/",
  (request, response, next) => {
    console.log("base url");
    next();
  },
  (request, response) => {
    response.send({ msg: "hello" });
  }
);

app.get("/users", (request, response) => {
  console.log("routed to /users");
  console.log(request.query);
  const {
    query: { filter, value },
  } = request;
  if (!filter && !value) return response.send(mockUsers);

  if (filter && value)
    if (filter == "id") {
      return response.send(
        mockUsers.filter((user) => user[filter] === Number(value))
      );
    }
  return response.send(
    mockUsers.filter((user) => user[filter].includes(value))
  );
});
app.use(loggingMiddleware, (request, response, next) => {
  console.log("finished logging..");
  next();
});
app.get("/users/:id", (request, response) => {
  console.log(request.params);
  const parsedId = parseInt(request.params.id);
  if (isNaN(parsedId)) return response.send({ msg: "bad request. 400" });
  const findId = mockUsers.find((user) => user.id === parsedId);
  if (findId) return response.send(findId);
});

app.get("/products", (request, response) => {
  response.send([
    { product1: "vanilla js" },
    { product2: "node js" },
    { product3: "python flask" },
  ]);
});

///////////////////////// POST REQUEST CREATES KEYS AND VALUES
app.post("/users", (request, response) => {
  console.log(request.body);
  const { body } = request;
  // response.send("data recieved");
  const newUser = { id: mockUsers[mockUsers.length - 1].id + 1, ...body };
  mockUsers.push(newUser);
  return response.status(201).send(newUser);
});
/////////////////////////////////PUT REQUEST UPDATES EVERY VALUE IF NOT PROVIDED OVERRIDES WITH NULLS
app.put("/users/:id", resolveIndexByUserId, (request, response) => {
  const { body, findUserIndex } = request;
  mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...body };
  return response.sendStatus(200);
});
/////////////////////////////////// PATCH REQUEST
app.patch("/users/:id", (request, response) => {
  const {
    body,
    params: { id },
  } = request;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    return response.status(400).send({ msg: "bad request. not parsed" });
  }
  const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);

  if (findUserIndex === -1) return response.sendStatus(404);
  mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...body };
});

//////////////////////////////////////////////
app.delete("/users/:id", (request, response) => {
  const {
    params: { id },
  } = request;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) return response.statusCode(400);
  const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);
  if (findUserIndex === -1) return reponse.sendStatus(404);
  mockUsers.splice(findUserIndex, 1);
  return response.sendStatus(200);
});
app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});
