/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1581634021")

  // remove field
  collection.fields.removeById("select2062397314")

  // add field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "bool1096936437",
    "name": "disable_animations",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "bool4006517269",
    "name": "dark_mode",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "bool1042593233",
    "name": "high_contrast",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "bool1796731730",
    "name": "calm_mode",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "select3631963127",
    "maxSelect": 0,
    "name": "audio_profile",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "FULL_AUDIO",
      "MUTED"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1581634021")

  // add field
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

  // remove field
  collection.fields.removeById("bool1096936437")

  // remove field
  collection.fields.removeById("bool4006517269")

  // remove field
  collection.fields.removeById("bool1042593233")

  // remove field
  collection.fields.removeById("bool1796731730")

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
})
