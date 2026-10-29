/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2920376115",
    "help": "",
    "hidden": false,
    "id": "relation4168381683",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "lesson",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "number1177347317",
    "max": null,
    "min": null,
    "name": "position",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "json657951933",
    "maxSize": 0,
    "name": "challenge_config",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "select2238795951",
    "maxSelect": 0,
    "name": "challenge_type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "DEMO",
      "QUIZ_MULTIPLE",
      "REVERSE_QUIZ",
      "MATCHING",
      "FREE_PRACTICE"
    ]
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3069659470",
    "max": 0,
    "min": 0,
    "name": "sentence",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // remove field
  collection.fields.removeById("relation4168381683")

  // remove field
  collection.fields.removeById("number1177347317")

  // remove field
  collection.fields.removeById("json657951933")

  // update field
  collection.fields.addAt(1, new Field({
    "help": "",
    "hidden": false,
    "id": "select2238795951",
    "maxSelect": 0,
    "name": "challenge_type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "DEMO",
      "QUIZ_MULTIPLE",
      "REVERSE_QUIZ",
      "MATCHING",
      "CAM_VERIFY",
      "FREE_PRACTICE"
    ]
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3069659470",
    "max": 0,
    "min": 0,
    "name": "question",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
