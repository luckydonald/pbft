# pbft
Implementation of the ~~Peters~~ Practical Byzantine Fault Tolerant Algorithm    


## Web GUI

This project supports a web interface to `b e a u t i f u l l y` represent what's going on.

You'll get a overview over all the values the nodes measured.

![image](https://user-images.githubusercontent.com/2737108/33264568-63590e78-d36e-11e7-91e3-d0b2545546ae.png)

You can also get insight which messages get send by which node to which node.

![image](https://user-images.githubusercontent.com/2737108/33264484-06f95a3e-d36e-11e7-9128-e3a2de4c37d5.png)


## Code status

> Please note, the project for which this was made for has reached an end,
> so the code will not be actively maintained any longer.
> However, pull requests with fixes and improvements will be merged.
> Have a look into the bugtracker, if someone else had a similar issue, and already made it work.

#### Java PBFT Node 
[![Build Status](https://travis-ci.org/luckydonald/PBFT-JAVA.svg?branch=master)](https://travis-ci.org/luckydonald/PBFT-JAVA) [![Coverage Status](https://coveralls.io/repos/github/luckydonald/PBFT-JAVA/badge.svg?branch=master)](https://coveralls.io/github/luckydonald/PBFT-JAVA?branch=master)

#### API Server
[![Build Status](https://travis-ci.org/luckydonald/pbft.svg?branch=master)](https://travis-ci.org/luckydonald/pbft) [![Coverage Status](https://coveralls.io/repos/github/luckydonald/pbft/badge.svg?branch=master)](https://coveralls.io/github/luckydonald/pbft?branch=master)


## Get the Code
```bash
git clone --recursive https://github.com/luckydonald/pbft.git
```
If you forget `--recursive`, the `phppgadmin` container won't be available.

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

4. Scale the nodes to use e.g. `4` instances
  - a) Older compose syntax
      ```shell
      $ docker-compose scale node=4
      ```
  - b) Newer compose syntax
      ```shell
      docker-compose up --scale node=4
      ```

5. Start the nodes
    ```shell
    $ docker-compose up -d node
    ```
    
6. Stop & reset everything
    ```shell
    $ docker-compose down
    ```
    - [Remove unused containers](http://stackoverflow.com/a/32723127):
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
