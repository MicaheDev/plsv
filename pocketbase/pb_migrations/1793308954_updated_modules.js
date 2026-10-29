/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219405885")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "",
    "listRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219405885")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null
  }, collection)

  return app.save(collection)
})
