/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4233520272")

  // update field
  collection.fields.addAt(1, new Field({
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
  const collection = app.findCollectionByNameOrId("pbc_4233520272")

  // update field
  collection.fields.addAt(1, new Field({
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
