/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_933978439")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4177893232",
    "help": "",
    "hidden": false,
    "id": "relation3607726417",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "challenge",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3548712228",
    "max": 0,
    "min": 0,
    "name": "option_text",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2329071722",
    "help": "",
    "hidden": false,
    "id": "relation2675872254",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "sign",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_933978439")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4177893232",
    "help": "",
    "hidden": false,
    "id": "relation3607726417",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "challenge",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3548712228",
    "max": 0,
    "min": 0,
    "name": "option_text",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2329071722",
    "help": "",
    "hidden": false,
    "id": "relation2675872254",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "sign",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
