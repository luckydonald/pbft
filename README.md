# pbft
Implementation of the ~~Peters~~ Practical Byzantine Fault Tolerant Algorithm    


## Web GUI

This project supports a web interface to `b e a u t i f u l l y` represent what's going on.

You'll get a overview over all the values the nodes measured.

![image](https://user-images.githubusercontent.com/2737108/33264568-63590e78-d36e-11e7-91e3-d0b2545546ae.png)

You can also get insight which messages get send by which node to which node.

![image](https://user-images.githubusercontent.com/2737108/33264484-06f95a3e-d36e-11e7-9128-e3a2de4c37d5.png)


## Code status

#### Java PBFT Node 
[![Build Status](https://travis-ci.org/luckydonald/PBFT-JAVA.svg?branch=master)](https://travis-ci.org/luckydonald/PBFT-JAVA) [![Coverage Status](https://coveralls.io/repos/github/luckydonald/PBFT-JAVA/badge.svg?branch=master)](https://coveralls.io/github/luckydonald/PBFT-JAVA?branch=master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/ee3937a213e447a79d36f5cc0597d046)](https://www.codacy.com/app/luckydonald/PBFT-JAVA?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=KathrynJaneway/PBFT-JAVA&amp;utm_campaign=Badge_Grade)

#### API Server
[![Build Status](https://travis-ci.org/luckydonald/pbft.svg?branch=master)](https://travis-ci.org/luckydonald/pbft) [![Coverage Status](https://coveralls.io/repos/github/luckydonald/pbft/badge.svg?branch=master)](https://coveralls.io/github/luckydonald/pbft?branch=master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/b83d3a038892446881d75a2dfcb590aa)](https://www.codacy.com/app/luckydonald/pbft?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=luckydonald/pbft&amp;utm_campaign=Badge_Grade)


## Starting everything
You need Docker installed.


```shell
$ docker-compose build
```
 
Because some services need longer to start it is best to start them in the following order:
 
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


## Links
The whole project: https://github.com/luckydonald/pbft

The Java node implementation: https://github.com/luckydonald/PBFT-JAVA

DB Struktur (for debugging and powering the web gui): https://editor.ponyorm.com/user/luckydonald/pbft
![pbft database structure](https://user-images.githubusercontent.com/2737108/33264396-a8310146-d36d-11e7-8ec9-8485d5d625b5.png)
