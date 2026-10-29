/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2891920731")

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "number3505794049",
    "max": null,
    "min": null,
    "name": "gems",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "select1056226071",
    "maxSelect": 0,
    "name": "current_mcer_level",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "A1",
      "A2",
      "B1",
      "B2",
      "C1",
      "C2"
    ]
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "number1439612651",
    "max": 5,
    "min": 0,
    "name": "hearts",
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
    "name": "xp",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "number507756871",
    "max": null,
    "min": 0,
    "name": "streak",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "date2658127174",
    "max": "",
    "min": "",
    "name": "last_activity",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2891920731")

  // remove field
  collection.fields.removeById("number3505794049")

  // update field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "select1056226071",
    "maxSelect": 0,
    "name": "current_level",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "A1",
      "A2",
      "B1",
      "B2",
      "C1",
      "C2"
    ]
  }))

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

  // update field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "date2658127174",
    "max": "",
    "min": "",
    "name": "last_activity_day",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
