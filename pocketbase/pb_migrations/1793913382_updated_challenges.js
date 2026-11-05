/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "select1103511960",
    "maxSelect": 0,
    "name": "target_type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "phrase",
      "sign"
    ]
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2329071722",
    "help": "",
    "hidden": false,
    "id": "relation1653163849",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "relation",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // remove field
  collection.fields.removeById("select1103511960")

  // remove field
  collection.fields.removeById("relation1653163849")

  return app.save(collection)
})
