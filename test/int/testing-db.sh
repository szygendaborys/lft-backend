docker run \
  --rm \
  --name test-db \
  -p 5433:5432 \
  -e POSTGRES_USER=docker \
  -e POSTGRES_PASSWORD=docker \
  -e POSTGRES_DB=lft_dev_test \
  -d postgres:13.2 