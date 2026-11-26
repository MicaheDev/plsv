/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2329071722")

  // update field
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
      "NOUN",
      "VERB",
      "ADJECTIVE",
      "ADVERB",
      "PRONOUN",
      "PREPOSITION",
      "CONJUNCTION",
      "INTERJECTION",
      "DETERMINER",
      "CLASSIFIER",
      "NON-MANUAL_MARKER",
      "PHRASE"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2329071722")

  // update field
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
      "verbo",
      "adjetivo",
      "expresion",
      "sustantivo"
    ]
  }))

  return app.save(collection)
})
