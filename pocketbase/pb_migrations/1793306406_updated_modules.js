/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219405885")

  // remove field
  collection.fields.removeById("relation1605454759")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219405885")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2822314327",
    "help": "",
    "hidden": false,
    "id": "relation1605454759",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "level_id",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
