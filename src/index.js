const express = require("express");

const { v4: uuid, validate } = require("uuid");

const app = express();

app.use(express.json());

const repositories = [];

function validateId(request, response, next){
  const { id } = request.params;
  if (!validate(id)) {
    return response.status(400).json({ error: "This id not is valid uuid!" });
  }
  return next()
}

function repositoriesAreadyExists(request, response, next){
  const { id } = request.params;
  const repository = repositories.find(repository => repository.id === id)
  if (!repository) {
    request.nonExistinRepository = false
  } else {
    request.nonExistinRepository = true
  }
  return next()
}

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body
  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };
  repositories.push(repository)
  return response.status(201).json(repository);
});

app.put("/repositories/:id", validateId, repositoriesAreadyExists, (request, response) => {
  const { nonExistinRepository } = request
  if (!nonExistinRepository) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }
  const { id } = request.params;
  const updatedRepository = request.body;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
    delete updatedRepository.likes
  const repository = { ...repositories[repositoryIndex], ...updatedRepository };
  repositories[repositoryIndex] = repository;
  return response.status(200).json(repository);
});

app.delete("/repositories/:id", validateId, repositoriesAreadyExists, (request, response) => {
  const { nonExistinRepository } = request
  if (!nonExistinRepository) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
    repositories.splice(repositoryIndex, 1);
  return response.status(204).send(`id ${id}, deleted!`);
});

app.post("/repositories/:id/like", validateId, repositoriesAreadyExists, (request, response) => {
  const { nonExistinRepository } = request
  if (!nonExistinRepository) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  repositories[repositoryIndex].likes++
  return response.status(200).json(repositories[repositoryIndex].likes);
});

module.exports = app;
