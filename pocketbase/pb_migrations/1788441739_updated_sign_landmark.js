/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4233520272")

  // update collection data
  unmarshal({
    "name": "sign_landmarks"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4233520272")

  // update collection data
  unmarshal({
    "name": "sign_landmark"
  }, collection)

  return app.save(collection)
})
