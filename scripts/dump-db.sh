#!/bin/sh 

FILE_NAME=dump-lft_dev-"$(date +"%Y_%m_%d_%I_%M_%p").sql"

echo "Dumping database to a file named $FILE_NAME..."

docker exec -t db pg_dump --no-owner -U root lft_dev > ./database/dumps/$FILE_NAME

echo "Dumping of $FILE_NAME finished successfully."