/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2891920731")

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "number1439612651",
    "max": 5,
    "min": 0,
    "name": "current_hearts",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "number4058751331",
    "max": null,
    "min": 0,
    "name": "total_score",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "number507756871",
    "max": null,
    "min": 0,
    "name": "current_streak",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2891920731")

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "number1439612651",
    "max": 5,
    "min": 0,
    "name": "current_hearts",
    "onlyInt": true,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "number4058751331",
    "max": null,
    "min": 0,
    "name": "total_score",
    "onlyInt": true,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "number507756871",
    "max": null,
    "min": 0,
    "name": "current_streak",
    "onlyInt": true,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
