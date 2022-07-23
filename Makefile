start:
	npm run start:dev

compose-up:
	docker-compose up --build

test-int:
	npm run test:int

test-unit:
	npm run test:unit

dump-db:
	./scripts/dump-db.sh

restore-db:
	./scripts/restore-db.sh

wipe-data:
	./scripts/wipe-data.sh

wait-for-test-db:
	./scripts/wait-for-test-db.sh

test-db-ci:
	docker-compose -f docker-compose.test.int.yml up -d --remove-orphans

test-db:
	./test/int/testing-db.sh