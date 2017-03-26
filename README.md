# pbft
Implementation of the Peters Byzantine Fault Tolerant Algorithm    
(Actually it stands for Practical Byzantine Fault Tolerant) 


#### Java PBFT Node 
[![Build Status](https://travis-ci.org/luckydonald/PBFT-JAVA.svg?branch=master)](https://travis-ci.org/luckydonald/PBFT-JAVA) [![Coverage Status](https://coveralls.io/repos/github/luckydonald/PBFT-JAVA/badge.svg?branch=master)](https://coveralls.io/github/luckydonald/PBFT-JAVA?branch=master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/ee3937a213e447a79d36f5cc0597d046)](https://www.codacy.com/app/luckydonald/PBFT-JAVA?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=KathrynJaneway/PBFT-JAVA&amp;utm_campaign=Badge_Grade)

#### API Server
[![Build Status](https://travis-ci.org/luckydonald/pbft.svg?branch=master)](https://travis-ci.org/luckydonald/pbft) [![Coverage Status](https://coveralls.io/repos/github/luckydonald/pbft/badge.svg?branch=master)](https://coveralls.io/github/luckydonald/pbft?branch=master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/b83d3a038892446881d75a2dfcb590aa)](https://www.codacy.com/app/luckydonald/pbft?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=luckydonald/pbft&amp;utm_campaign=Badge_Grade)


## Starting everything
You need Docker installed.

```shell
$ docker-compose up
```
 
However, because some services need longer to start it is best to start them in the following order:
 
1. Database and Database browser
    ```shell
    $ docker-compose up -d postgres postgres_browser
    ```

2. The API
    ```shell
    $ docker-compose up -d api 
    ```

3. Start the web GUI
    ```shell
    $ docker-compose up -d web
    ```

4. Scale the nodes to use 4 instances
    ```shell
    $ docker-compose scale node=4
    ```

5. Start the nodes
    ```shell
    $ docker-compose up -d node
    ```
    
6. Stop & reset everything
    ```shell
    $ docker-compose down
    ```
    - [Remove unused containers](http://stackoverflow14.com/a/32723127):
        ```shell
        $ docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
        ```

## Standart Ports and URLs
Assuming your docker is publishing it's ports on `localhost`.
 
| Server   | URL                               |
| -------- | --------------------------------- |
| API      | http://localhost:80/              |
| Database | http://localhost:8080/phppgadmin/ |
| Web GUI  | http://localhost:8000/src/        |


