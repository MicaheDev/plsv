/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1325166809")

  // update collection data
  unmarshal({
    "name": "phrases_orchestration"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1325166809")

  // update collection data
  unmarshal({
    "name": "phrases_rchestration"
  }, collection)

  return app.save(collection)
})
