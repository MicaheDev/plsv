/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2862526969")

  // update field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "[a-zA-Z0-9]{50}",
    "help": "",
    "hidden": true,
    "id": "text1815391638",
    "max": 60,
    "min": 30,
    "name": "tokenKey",
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

  // update field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "[a-zA-Z0-9]{50}",
    "help": "",
    "hidden": true,
    "id": "text1815391638",
    "max": 60,
    "min": 30,
    "name": "TokenKey",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
