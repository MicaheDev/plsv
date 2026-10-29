/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2329071722")

  // remove field
  collection.fields.removeById("relation105650625")

  // remove field
  collection.fields.removeById("select1921774338")

  // add field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "file3309110367",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": [
      "image/jpeg",
      "image/png"
    ],
    "name": "image",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "file463245580",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": [
      "image/jpeg",
      "image/png"
    ],
    "name": "representation_image",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text10602373142",
    "max": 0,
    "min": 0,
    "name": "meaning",
    "pattern": "",
    "presentable": true,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text1843675174",
    "max": 0,
    "min": 0,
    "name": "description",
    "pattern": "",
    "presentable": true,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "select3118882130",
    "maxSelect": 0,
    "name": "gramatical_category",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "verb",
      "adjective",
      "adverb",
      "pronoun",
      "idiom"
    ]
  }))

  // update field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text1060237314",
    "max": 0,
    "min": 0,
    "name": "gloss",
    "pattern": "",
    "presentable": true,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "file1339615683",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": [
      "audio/mp4"
    ],
    "name": "video",
    "presentable": false,
    "protected": false,
    "required": true,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2329071722")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3292755704",
    "help": "",
    "hidden": false,
    "id": "relation105650625",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "category",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "select1921774338",
    "maxSelect": 0,
    "name": "resource_types",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "VIDEO",
      "STATIC_IMAGE",
      "3D"
    ]
  }))

  // remove field
  collection.fields.removeById("file3309110367")

  // remove field
  collection.fields.removeById("file463245580")

  // remove field
  collection.fields.removeById("text10602373142")

  // remove field
  collection.fields.removeById("text1843675174")

  // remove field
  collection.fields.removeById("select3118882130")

  // update field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text1060237314",
    "max": 0,
    "min": 0,
    "name": "meaning",
    "pattern": "",
    "presentable": true,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "file1339615683",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": [
      "audio/mp4",
      "image/jpeg",
      "image/png",
      "model/gltf-binary"
    ],
    "name": "media_file",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})
