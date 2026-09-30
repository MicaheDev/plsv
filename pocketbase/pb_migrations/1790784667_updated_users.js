/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "id = @request.auth.id || @request.auth.role = \"ADMIN\"",
    "listRule": "id = @request.auth.id || @request.auth.role = \"ADMIN\" || @request.auth.role = \"TEACHER\"",
    "updateRule": "id = @request.auth.id || @request.auth.role = \"ADMIN\"",
    "viewRule": "id = @request.auth.id || @request.auth.role = \"ADMIN\" || @request.auth.role = \"TEACHER\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "id = @request.auth.id",
    "listRule": "id = @request.auth.id",
    "updateRule": "id = @request.auth.id",
    "viewRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
})
