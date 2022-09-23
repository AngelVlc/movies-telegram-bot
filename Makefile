TEST_IMAGE_NAME="movies-telegram-bot-test"

build:
	docker build -t ${TEST_IMAGE_NAME} --target base .

console:
	docker run --rm -it ${TEST_IMAGE_NAME} sh

test:
	docker run --rm ${TEST_IMAGE_NAME} npm test