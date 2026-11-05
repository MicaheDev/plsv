/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2920376115")

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "select1704208859",
    "maxSelect": 0,
    "name": "icon",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "faBookOpen",
      "faDumbbell",
      "faFlagCheckered",
      "faHands",
      "faGamepad"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2920376115")

  // remove field
  collection.fields.removeById("select1704208859")

  return app.save(collection)
})
