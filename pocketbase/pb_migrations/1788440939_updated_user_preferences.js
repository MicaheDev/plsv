/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1581634021")

  // update field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "select2062397314",
    "maxSelect": 0,
    "name": "level_preference",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "NONE",
      "BASIC",
      "INTERMEDIATE"
    ]
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "select3631963127",
    "maxSelect": 0,
    "name": "audio_mode",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "FULL_AUDIO",
      "NO_VOICE",
      "MUTED"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1581634021")

  // update field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "select2062397314",
    "maxSelect": 0,
    "name": "level_preference",
    "presentable": true,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "NONE",
      "BASIC",
      "INTERMEDIATE"
    ]
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "select3631963127",
    "maxSelect": 0,
    "name": "audio_mode",
    "presentable": true,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "FULL_AUDIO",
      "NO_VOICE",
      "MUTED"
    ]
  }))

  return app.save(collection)
})
