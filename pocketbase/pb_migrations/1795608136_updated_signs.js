/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2329071722")

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "select14597239",
    "maxSelect": 0,
    "name": "emotion",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "HAPPY",
      "SAD",
      "ANGRY",
      "SURPRISE",
      "FEAR",
      "DISGUST",
      "EXCITED",
      "LOVE",
      "PROUD",
      "THANKFUL",
      "HOPEFUL",
      "INTERESTED",
      "TIRED",
      "BORED",
      "CONFUSED",
      "ANXIOUS",
      "FRUSTRATED",
      "SHY",
      "GUILTY",
      "NEUTRAL",
      "CALM",
      "SERIOUS",
      "THOUGHFUL"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2329071722")

  // remove field
  collection.fields.removeById("select14597239")

  return app.save(collection)
})
