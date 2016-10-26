# `GET /get_value`

Returns the latest value the nodes decided on,
and the most recent measured value of each node.
Only considers events in the last 10 seconds.    

##### Returns
An dictionary.
Will have an entry for each node with its latest measured value.
Also contains a `"summary"` field, containing the last value they have agreed on, if any.

##### Note
 If nothing happened in the last 10 seconds, that node / the summary will be missing. 

##### Example
```curl
$ curl http://0.0.0.0/get_value/
```
```json
{
    "1": 0.5,
    "2": 0.6,
    "5": 0.5,
    "6": 0.5,
    "7": 0.5,
    "summary": 0.5
}
```


# `GET /get_data`

Returns list of recent measurements,

##### Optional parameters
- `node`: the node you want to filter for. You can specify this argument multible times. Omit to receive all of them.
- `limit`: will only get the specified count of measurements. 
   **Note**: This is the total count, not per node. So `limit=5` could mean 1 entry in _node 1_ and 4 measurement in _node 2_, depending of the time.


##### Returns
An dictionary with nodes as keys and a subdictionary, with timestaps as keys for the measured values.


##### Example
```curl
$ curl http://0.0.0.0/get_data/
```
```json

{
    "1": {
        "123134":  0.12,
        # timestamp : value
        "123135": 0.5
    },
    "2": {
        "123134":  0.13,
        # timestamp : value
        "123135": 0.8
    }
    "3": {
        "123134":  0.13,
        # timestamp : value
        "123135": 0.5
    }
}
```

##### Example 2

```curl
$ curl http://0.0.0.0/get_data/?node=1&node=2
```
```json

{
    "1": {
        "123134":  0.12,
        # timestamp : value
        "123135": 0.5
    },
    "2": {
        "123134":  0.13,
        # timestamp : value
        "123135": 0.8
    }
}
```

# `PUT /dump`

Sent an json encoded `Message` (same as used internally between the nodes) into the database.
