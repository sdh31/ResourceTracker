FORMAT: 1A
HOST: https://colab-sbx-202.oit.duke.edu

# Scccuuuuuuu

Scccuuuuu is a resource management system for Hypotheticorp, LLC.

# Group User Operations 

##Get All Users [/user/all]

### Get all users [GET]
        
+ Response 200 (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
        
    + Body 
    
            {
                "error":false,
                "results":[
                {
                    "username":"username",
                    "first_name":"Hingle",
                    "last_name":"McCringleberry",
                    "user_id":1,
                    "email_address":"email@gmail.com"
                }],
                "err":""
            }

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

## User APIs [/user{?user_id}{?username}]
### Get User by ID [GET]
+ Parameters
    + username (string, optional) - Username of user to select. If not specified, get logged in user.
+ Request 
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200 (application/json)
    + Body
        
            {
            "error":false,
            "results":{
                "user_id":1,
                "username":"admin",
                "first_name":"admin",
                "last_name":"admin",
                "is_shibboleth":0,
                "password":"",
                "emails_enabled":1,
                "groups":[
                    {
                    "group_id":1,
                    "group_name":"admin_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1",
                    "resource_management_permission":1,
                    "reservation_management_permission":1,
                    "user_management_permission":1,
                    "is_private":1
                    }
                    ],
                "resource_management_permission":1,
                "reservation_management_permission":1,
                "user_management_permission":1
                }
            }
    
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Create a New User [PUT]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "username": "myName",
                "password": "FrodoBaggins123",
                "email_address": "mrg@duke.edu",
                "first_name": "Frodo",
                "last_name": "Swaggins",
                "is_shibboleth": 0
            }

+ Response 200
    + Body
            
                {
                    "insertId": 20   
                }

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Delete User [DELETE]
+ Parameters
    + user_id (number) - ID of the user to delete in integer form
+ Request
    + Headers
    
            Auth-Token: <Your API Token>

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Update User [POST]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "username":"username",
                "newUsername": "username to update to",
                "password":"new Password (Optional)",
                "email_address": "a@a.com (Optional)",
                "emails_enabled": 1
            }

+ Response 200
 
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

## Signin [/user/signin]
### Signin[POST]
+ Request (application/json)
    + Body
    
            {
                "username": "me",
                "password": "S1ckP4ssBr0"
            }

+ Response 200 (application/json)
    + Body
    
            {
                "user_id":1,
                "username":"admin",
                "first_name":"admin",
                "last_name":"admin",
                "is_shibboleth":1,
                "emails_enabled":1, 
                "groups":[{"group_id":1,"group_name":"admin_group"]
            }

+ Response 403 (aplication/json)
    + Body
    
            {
                "err": "Description of the error"
            }

##Signout [/user/signout]
### Signout[POST]
+ Request (applcation/json)
    + Headers
    
            Auth-Token: <Your API Token>

+ Response 403 (application/json)
    + Body
    
            {
                "err": "You aren't signed in."
            }
            
+ Response 200 (application/json)
    + Body
    
            {
                "results": "You are logged out!"
            }

### Get token[POST /user/token]
+ Request (application/json)

+ Response 403
    + Body
        
            {
                "err": "You don't have requisite permissions to do this"
            }

+ Response 200
    + Body
        
            {
              "results": { 
                            "token": "asdf2rr4213424jaosdfakjdnclkdsanmcasd"
                        }
            }

# Group Resource Operations
+ Headers
    
        Auth-Token: <Your API Token>

## Resources [/resource{?resource_id}]

### Create Resource [PUT]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "name": "myResource",
                "description": "a resource"
            }


+ Response 200
    + Body
            
                {
                    "results": {
                            "insertId": 20    
                        }
                }


+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Get Resource[GET]
+ Parameters
    + resource_id (number) - id of resource to select.
+ Request 
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200 (application/json)
    + Body
        
            {
                "error":false,
                "results":{
                    "resource_id":9,
                    "name":"laptop",
                    "description":"just a laptop",
                },
                "err":""
            }
    
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Update Resource[POST]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 4,
                "name": "myResource (Optional)",
                "description": "a resource (Optional)"
            }


+ Response 200


+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Delete Resource[DELETE]
+ Parameters
    + resource_id (number) - ID of the resource to delete in integer form
+ Request
    + Headers
    
            Auth-Token: <Your API Token>

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

## Tags [/tag]
### Get all available tags[GET]
+ Request
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200 (application/json)
    + Body
        
            {
                "error":false,
                "err":"",
                "tags":[
                {
                    "tag_id":1,
                    "tag_name":"computer",
                    "resource_id":13
                },{
                    "tag_id":2,
                    "tag_name":"house",
                    "resource_id":11
                }]
            }
    
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Remove Tag from Resourcce[POST]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 1,
                "deletedTags": ["tag1", "tag2", "tag3"]
            }

+ Response 200

+ Response 403
    + Body
        
            {
                "err": "You don't have requisite permissions to do this"
            }
            
+ Response 400
    + Body
    
            {
                "err": "description of the error"
            }

### Add tag to resource[PUT]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 1,
                "addedTags": ["tag1", "tag2", "tag3"]
            }

+ Response 200

+ Response 403
    + Body
        
            {
                "err": "You don't have requisite permissions to do this"
            }
            
+ Response 400
    + Body
    
            {
                "err": "description of the error"
            }

### Filter Resources By Included and Excluded Tags [POST /tag/filter]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "includedTags": ["tag1", "tag2", "tag3"],
                "excludedTags": ["tag1", "tag2", "tag3"],
                "start_time": 102234543,
                "end_time": 102238543
            }

+ Response 200
    +Body
    
            {
                "error":false,
                "results":[{
                    "reservation_id":1,
                    "start_time":5,
                    "end_time":10,
                    "resource_id":1,
                    "user_id":1,
                    "name":"resource1",
                    "description":"description",
                },{
                    "reservation_id":2,
                    "start_time":3,
                    "end_time":4,
                    "resource_id":1,
                    "user_id":1,
                    "name":"resource2",
                    "description":"huh edited",
                }],
                "err":""
            }

+ Response 403
    + Body
        
            {
                "err": "You don't have requisite permissions to do this"
            }
            
+ Response 400
    + Body
    
            {
                "err": "description of the error"
            }


# Group Permission Operations 
+ Headers
    
        Auth-Token: <Your API Token>

## Groups [/group{?group_id}]
### Get Groups[GET]
+ Parameters
    + group_id (string, optional) - Name of Group to select. If not specified, get all groups.
+ Request
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200 (application/json)
    + Body
        
               {
                   "error":false,
                   "results":[{
                       "group_id":1,
                       "group_name":"group1",
                       "group_description":"description",
                       "user_management_permission":1,
                       "resource_management_permission":1,
                       "reservation_management_permission":1,
                       "is_private":0
                   },{
                       "group_id":8,
                       "group_name":"group2",
                       "group_description":"description",
                       "user_management_permission":0,
                       "resource_management_permission":0,
                       "reservation_management_permission":0,
                       "is_private":1
                   }],
                   "err":""
               }

    
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Create Group[PUT]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "name": "myGroup",
                "description": "this is a group",
                "user_management_permission": 1,
                "resource_management_permission": 0,
                "reservation_management_permission": 1
            }

+ Response 200
    + Body
            
                {
                    "results": {
                            "insertId": 20    
                        }
                }

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Update Group[POST]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
            "group_name": "new name",
            "description": "new group",
            "user_management_permission": 0,
            "resource_management_permission": 1,
            "reservation_management_permission": 0,
            "group_id": 1
            }

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Delete Group[DELETE]
+ Parameters
    + group_id (number) - ID of the group to delete in integer form
+ Request
    + Headers
    
            Auth-Token: <Your API Token>

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Add User to Group [POST /group/addUsers]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "group_id": 3,
                "user_ids": [1, 2]
            }

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Remove User from Group [POST /group/removeUsers]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "group_id": 3,
                "user_ids": [1, 2]
            }

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }


### Add Group Permission To Resource [POST /resource/addPermission]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 5,
                "group_ids": [1, 2, 3],
                "resource_permissions": "Either 'Reserve' or 'View' "
            }

+ Response 200
   
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Delete Group Permission From Resource [POST /resource/removePermission]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 5,
                "group_ids": [1, 2, 3]
            }

+ Response 200
   
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Get Group Permission Associated with Resource [GET /resource/getPermission{?resource_id}]
+ Parameters
    + resource_id (number, required) - ID of resource to get group-resource permissions on.
+ Request
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200
    + Body
    
            {
            "error":false,
            "results":[{
                "resource_id":11,
                "group_id":1,
                "resource_permission":"reserve"
                },{
                "resource_id":11,
                "group_id":13,
                "resource_permission":"view"
            }],
            "err":""}

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }

+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

# Group Reservation Operations
+ Headers
    
        Auth-Token: <Your API Token>

## Reservations [/reservation{?resource_id}{?start_time}{?end_time}{?reservation_id}]
### Get Reservation[GET]
+ Parameters
    + resource_id (number, required) - ID of resource to view reservations on.
    + start_time (number, required) - Start_time of interval over which to view reservations in Unix time (long)
    + end_time (number, required) - End_time of interval in Unix time (long) 
    + reservation_id (number, optional) - Specific reservation to view

+ Request 
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200 (application/json)
    + Body
        
               {
                   "error":false,
                   "results":[{
                       "reservation_id":10,
                       "start_time":3,
                       "end_time":4,
                       "resource_id":9,
                       "user_id":1,
                       "name":"reservation1",
                       "description":"reserving this thing",
                   }],
                   "err":""
               }
    
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Create Reservation[PUT]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 1,
                "start_time": 1045867439 //Unix time,
                "end_time": 1045867539
            }

+ Response 200
    + Body
            
                {
                    "results": {
                            "insertId": 20    
                        }
                }

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Delete Reservation [DELETE]
+ Parameters
    + reservation_id (number) - ID of the reservation to delete in integer form
+ Request
    + Headers
    
            Auth-Token: <Your API Token>

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }








FORMAT: 1A
HOST: https://colab-sbx-202.oit.duke.edu

# Scccuuuuuuu

Polls is a simple API allowing consumers to view polls and vote in them.

# Group User Operations 

##Get All Users [/user/all]

### Get all users [GET]
        
+ Response 200 (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
        
    + Body 
    
            {
                "error":false,
                "results":[
                {
                    "username":"username",
                    "first_name":"Hingle",
                    "last_name":"McCringleberry",
                    "user_id":1,
                    "email_address":"email@gmail.com"
                }],
                "err":""
            }

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

## User APIs [/user{?user_id}{?username}]
### Get User by ID [GET]
+ Parameters
    + username (string, optional) - Username of user to select. If not specified, get logged in user.
+ Request 
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200 (application/json)
    + Body
        
            {
            "error":false,
            "results":{
                "user_id":1,
                "username":"admin",
                "first_name":"admin",
                "last_name":"admin",
                "is_shibboleth":0,
                "password":"",
                "emails_enabled":1,
                "groups":[
                    {
                    "group_id":1,
                    "group_name":"admin_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1",
                    "resource_management_permission":1,
                    "reservation_management_permission":1,
                    "user_management_permission":1,
                    "is_private":1
                    }
                    ],
                "resource_management_permission":1,
                "reservation_management_permission":1,
                "user_management_permission":1
                }
            }
    
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Create a New User [PUT]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "username": "myName",
                "password": "FrodoBaggins123",
                "email_address": "mrg@duke.edu",
                "first_name": "Frodo",
                "last_name": "Swaggins",
                "is_shibboleth": 0
            }

+ Response 200
    + Body
            
                {
                    "insertId": 20   
                }

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Delete User [DELETE]
+ Parameters
    + user_id (number) - ID of the user to delete in integer form
+ Request
    + Headers
    
            Auth-Token: <Your API Token>

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Update User [POST]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "username":"username",
                "newUsername": "username to update to",
                "password":"new Password (Optional)",
                "email_address": "a@a.com (Optional)",
                "emails_enabled": 1
            }

+ Response 200
 
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

## Signin [/user/signin]
### Signin[POST]
+ Request (application/json)
    + Body
    
            {
                "username": "me",
                "password": "S1ckP4ssBr0"
            }

+ Response 200 (application/json)
    + Body
    
            {
                "user_id":1,
                "username":"admin",
                "first_name":"admin",
                "last_name":"admin",
                "is_shibboleth":1,
                "emails_enabled":1, 
                "groups":[{"group_id":1,"group_name":"admin_group"]
            }

+ Response 403 (aplication/json)
    + Body
    
            {
                "err": "Description of the error"
            }

##Signout [/user/signout]
### Signout[POST]
+ Request (applcation/json)
    + Headers
    
            Auth-Token: <Your API Token>

+ Response 403 (application/json)
    + Body
    
            {
                "err": "You aren't signed in."
            }
            
+ Response 200 (application/json)
    + Body
    
            {
                "results": "You are logged out!"
            }

### Get token[POST /user/token]
+ Request (application/json)

+ Response 403
    + Body
        
            {
                "err": "You don't have requisite permissions to do this"
            }

+ Response 200
    + Body
        
            {
              "results": { 
                            "token": "asdf2rr4213424jaosdfakjdnclkdsanmcasd"
                        }
            }

# Group Resource Operations
+ Headers
    
        Auth-Token: <Your API Token>

## Resources [/resource{?resource_id}]

### Create Resource [PUT]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "name": "myResource",
                "description": "a resource"
            }


+ Response 200
    + Body
            
                {
                    "results": {
                            "insertId": 20    
                        }
                }


+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Get Resource[GET]
+ Parameters
    + resource_id (number) - id of resource to select.
+ Request 
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200 (application/json)
    + Body
        
            {
                "error":false,
                "results":{
                    "resource_id":9,
                    "name":"laptop",
                    "description":"just a laptop",
                },
                "err":""
            }
    
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Update Resource[POST]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 4,
                "name": "myResource (Optional)",
                "description": "a resource (Optional)"
            }


+ Response 200


+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Delete Resource[DELETE]
+ Parameters
    + resource_id (number) - ID of the resource to delete in integer form
+ Request
    + Headers
    
            Auth-Token: <Your API Token>

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

## Tags [/tag]
### Get all available tags[GET]
+ Request
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200 (application/json)
    + Body
        
            {
                "error":false,
                "err":"",
                "tags":[
                {
                    "tag_id":1,
                    "tag_name":"computer",
                    "resource_id":13
                },{
                    "tag_id":2,
                    "tag_name":"house",
                    "resource_id":11
                }]
            }
    
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Remove Tag from Resourcce[POST]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 1,
                "deletedTags": ["tag1", "tag2", "tag3"]
            }

+ Response 200

+ Response 403
    + Body
        
            {
                "err": "You don't have requisite permissions to do this"
            }
            
+ Response 400
    + Body
    
            {
                "err": "description of the error"
            }

### Add tag to resource[PUT]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 1,
                "addedTags": ["tag1", "tag2", "tag3"]
            }

+ Response 200

+ Response 403
    + Body
        
            {
                "err": "You don't have requisite permissions to do this"
            }
            
+ Response 400
    + Body
    
            {
                "err": "description of the error"
            }

### Filter Resources By Included and Excluded Tags [POST /tag/filter]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "includedTags": ["tag1", "tag2", "tag3"],
                "excludedTags": ["tag1", "tag2", "tag3"],
                "start_time": 102234543,
                "end_time": 102238543
            }

+ Response 200
    +Body
    
            {
                "error":false,
                "results":[{
                    "reservation_id":1,
                    "start_time":5,
                    "end_time":10,
                    "resource_id":1,
                    "user_id":1,
                    "name":"resource1",
                    "description":"description",
                },{
                    "reservation_id":2,
                    "start_time":3,
                    "end_time":4,
                    "resource_id":1,
                    "user_id":1,
                    "name":"resource2",
                    "description":"huh edited",
                }],
                "err":""
            }

+ Response 403
    + Body
        
            {
                "err": "You don't have requisite permissions to do this"
            }
            
+ Response 400
    + Body
    
            {
                "err": "description of the error"
            }


# Group Permission Operations 
+ Headers
    
        Auth-Token: <Your API Token>

## Groups [/group{?group_id}]
### Get Groups[GET]
+ Parameters
    + group_id (string, optional) - Name of Group to select. If not specified, get all groups.
+ Request
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200 (application/json)
    + Body
        
               {
                   "error":false,
                   "results":[{
                       "group_id":1,
                       "group_name":"group1",
                       "group_description":"description",
                       "user_management_permission":1,
                       "resource_management_permission":1,
                       "reservation_management_permission":1,
                       "is_private":0
                   },{
                       "group_id":8,
                       "group_name":"group2",
                       "group_description":"description",
                       "user_management_permission":0,
                       "resource_management_permission":0,
                       "reservation_management_permission":0,
                       "is_private":1
                   }],
                   "err":""
               }

    
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Create Group[PUT]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "name": "myGroup",
                "description": "this is a group",
                "user_management_permission": 1,
                "resource_management_permission": 0,
                "reservation_management_permission": 1
            }

+ Response 200
    + Body
            
                {
                    "results": {
                            "insertId": 20    
                        }
                }

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Update Group[POST]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
            "group_name": "new name",
            "description": "new group",
            "user_management_permission": 0,
            "resource_management_permission": 1,
            "reservation_management_permission": 0,
            "group_id": 1
            }

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Delete Group[DELETE]
+ Parameters
    + group_id (number) - ID of the group to delete in integer form
+ Request
    + Headers
    
            Auth-Token: <Your API Token>

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Add User to Group [POST /group/addUsers]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "group_id": 3,
                "user_ids": [1, 2]
            }

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Remove User from Group [POST /group/removeUsers]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "group_id": 3,
                "user_ids": [1, 2]
            }

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }


### Add Group Permission To Resource [POST /resource/addPermission]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 5,
                "group_ids": [1, 2, 3],
                "resource_permissions": "Either 'Reserve' or 'View' "
            }

+ Response 200
   
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Delete Group Permission From Resource [POST /resource/removePermission]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 5,
                "group_ids": [1, 2, 3]
            }

+ Response 200
   
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Get Group Permission Associated with Resource [GET /resource/getPermission{?resource_id}]
+ Parameters
    + resource_id (number, required) - ID of resource to get group-resource permissions on.
+ Request
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200
    + Body
    
            {
            "error":false,
            "results":[{
                "resource_id":11,
                "group_id":1,
                "resource_permission":"reserve"
                },{
                "resource_id":11,
                "group_id":13,
                "resource_permission":"view"
            }],
            "err":""}

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }

+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

# Group Reservation Operations
+ Headers
    
        Auth-Token: <Your API Token>

## Reservations [/reservation{?resource_id}{?start_time}{?end_time}{?reservation_id}]
### Get Reservation[GET]
+ Parameters
    + resource_id (number, required) - ID of resource to view reservations on.
    + start_time (number, required) - Start_time of interval over which to view reservations in Unix time (long)
    + end_time (number, required) - End_time of interval in Unix time (long) 
    + reservation_id (number, optional) - Specific reservation to view

+ Request 
    + Headers
    
            Auth-Token: <Your API Token>
+ Response 200 (application/json)
    + Body
        
               {
                   "error":false,
                   "results":[{
                       "reservation_id":10,
                       "start_time":3,
                       "end_time":4,
                       "resource_id":9,
                       "user_id":1,
                       "name":"reservation1",
                       "description":"reserving this thing",
                   }],
                   "err":""
               }
    
+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Create Reservation[PUT]
+ Request (application/json)
    + Headers
    
            Auth-Token: <Your API Token>
    + Body
    
            {
                "resource_id": 1,
                "start_time": 1045867439 //Unix time,
                "end_time": 1045867539
            }

+ Response 200
    + Body
            
                {
                    "results": {
                            "insertId": 20    
                        }
                }

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }
            
+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }

### Delete Reservation [DELETE]
+ Parameters
    + reservation_id (number) - ID of the reservation to delete in integer form
+ Request
    + Headers
    
            Auth-Token: <Your API Token>

+ Response 200

+ Response 403
    + Body
        
                {
                    "err": "You don't have requisite permissions to do this"
                }


+ Response 400
    + Body
    
                {
                    "err": "description of the error"
                }









