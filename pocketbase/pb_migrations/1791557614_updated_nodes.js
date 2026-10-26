/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3598433047")

  // remove field
  collection.fields.removeById("relation3703245907")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3598433047")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_586599074",
    "help": "",
    "hidden": false,
    "id": "relation3703245907",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "unit",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
