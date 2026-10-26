/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_586599074")

  // remove field
  collection.fields.removeById("relation762542831")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_586599074")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1809324929",
    "help": "",
    "hidden": false,
    "id": "relation762542831",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "section",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
