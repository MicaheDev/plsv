/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2891920731")

  // update collection data
  unmarshal({
    "name": "gamified_stats"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2891920731")

  // update collection data
  unmarshal({
    "name": "user_game_stats"
  }, collection)

  return app.save(collection)
})
