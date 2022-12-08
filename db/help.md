
# DB Migrations

* Create the main db and create schema_migrations table.
```sh
 > node db/seed.js
```

* How to generate a migration file with bare minimum content.
```sh
 > node db/migrate.js --generate createUserTable
```

* Running all pending migrations.
```sh
 > node db/migrate.js
```

* Redo All versions.
```sh
 > node db/migrate.js --redoAll
```

* Running a specific migration version.
```sh
 > node db/migrate.js --up 1649845879511
```

* Reverting a specific migration version.
```sh
 > node db/migrate.js --down 1649845879511
```

* Re-doing a specific migration version.
```sh
 > node db/migrate.js --redo 1649845879511
```
