#!/bin/sh

DATABASE_NAME=lft_dev
LATEST_DB_DUMP=$(ls ./database/dumps | sort -V | tail -n 1)

echo "Upserting database $DATABASE_NAME"
docker exec -i --user root db psql -U root -d postgres -c "SELECT *, pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = '$DATABASE_NAME';"
docker exec -i --user root db psql -U root -d postgres -c "DROP DATABASE $DATABASE_NAME"
docker exec -i --user root db psql -U root -d postgres -c "CREATE DATABASE $DATABASE_NAME"


echo "Restoring database with a filename $LATEST_DB_DUMP..."
cat ./database/dumps/$LATEST_DB_DUMP | docker exec -i --user root db psql -U root -d lft_dev

echo "Restoring finished successfully"