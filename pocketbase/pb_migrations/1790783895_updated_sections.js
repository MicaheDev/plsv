/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1809324929")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && (@request.auth.role = \"ADMIN\" || @request.auth.role = \"TEACHER\")",
    "deleteRule": "@request.auth.id != \"\" && (@request.auth.role = \"ADMIN\" || @request.auth.role = \"TEACHER\")",
    "listRule": "id = @request.auth.id",
    "updateRule": "@request.auth.id != \"\" && (@request.auth.role = \"ADMIN\" || @request.auth.role = \"TEACHER\")",
    "viewRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1809324929")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": "@request.auth.id != \"\" && (@request.auth.role = \"ADMIN\" || @request.auth.role = \"TEACHER\")",
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
