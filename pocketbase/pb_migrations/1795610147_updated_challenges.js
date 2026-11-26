/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update field
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
      "SIGN",
      "PHRASE"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update field
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

  return app.save(collection)
})
