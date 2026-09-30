/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1809324929")

  // update collection data
  unmarshal({
    "listRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1809324929")

  // update collection data
  unmarshal({
    "listRule": null
  }, collection)

  return app.save(collection)
})
