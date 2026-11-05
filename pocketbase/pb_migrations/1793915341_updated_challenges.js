/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2920376115",
    "help": "",
    "hidden": false,
    "id": "relation4168381683",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "lesson_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update field
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

  return app.save(collection)
})
