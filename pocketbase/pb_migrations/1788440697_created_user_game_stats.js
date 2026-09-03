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
        "collectionId": "_pb_users_auth_",
        "help": "",
        "hidden": false,
        "id": "relation2375276105",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "user",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select1056226071",
        "maxSelect": 0,
        "name": "current_level",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "A1",
          "A2",
          "B1",
          "B2",
          "C1",
          "C2"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "number1439612651",
        "max": 5,
        "min": null,
        "name": "current_hearts",
        "onlyInt": true,
        "presentable": true,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number4058751331",
        "max": null,
        "min": null,
        "name": "total_score",
        "onlyInt": true,
        "presentable": true,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number507756871",
        "max": null,
        "min": null,
        "name": "current_streak",
        "onlyInt": true,
        "presentable": true,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "date2658127174",
        "max": "",
        "min": "",
        "name": "last_activity_day",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
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
    "id": "pbc_2891920731",
    "indexes": [],
    "listRule": null,
    "name": "user_game_stats",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2891920731");

  return app.delete(collection);
})
