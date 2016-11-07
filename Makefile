update:
	git log -1
	git status
	git pull origin master
	git submodule foreach git pull origin master

start:
	docker-compose up -d postgres
	docker-compose up --force-recreate -d postgres_browser
	docker-compose up -d --build api
	docker-compose build node node_java
