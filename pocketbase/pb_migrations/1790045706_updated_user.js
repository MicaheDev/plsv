/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2862526969")

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": true,
    "id": "text901924565",
    "max": 0,
    "min": 4,
    "name": "password",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2862526969")

  // remove field
  collection.fields.removeById("text901924565")

  return app.save(collection)
})
