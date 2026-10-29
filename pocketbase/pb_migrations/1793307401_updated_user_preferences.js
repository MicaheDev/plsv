/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1581634021")

  // remove field
  collection.fields.removeById("number3101357243")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1581634021")

  // add field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "number3101357243",
    "max": null,
    "min": null,
    "name": "daily_goal",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
