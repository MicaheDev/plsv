/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2920376115",
        "help": "",
        "hidden": false,
        "id": "relation4168381683",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "lesson",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select2238795951",
        "maxSelect": 0,
        "name": "challenge_type",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "DEMO",
          "QUIZ_MULTIPLE",
          "REVERSE_QUIZ",
          "MATCHING",
          "CAM_VERIFY",
          "FREE_PRACTICE"
        ]
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3069659470",
        "max": 0,
        "min": 0,
        "name": "question",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
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
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_4177893232",
    "indexes": [],
    "listRule": null,
    "name": "challenges",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232");

  return app.delete(collection);
})
