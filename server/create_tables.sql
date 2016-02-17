USE test_db;
CREATE TABLE IF NOT EXISTS user (user_id INT NOT NULL AUTO_INCREMENT, username varchar(255) NOT NULL UNIQUE, password varchar(255) NOT NULL, first_name varchar(255) NOT NULL , last_name varchar(255) NOT NULL, email_address varchar(255) NOT NULL, is_shibboleth BOOLEAN DEFAULT 0, emails_enabled BOOLEAN DEFAULT 1, PRIMARY KEY (user_id));
CREATE TABLE IF NOT EXISTS resource (resource_id INT NOT NULL AUTO_INCREMENT,name varchar(255), description varchar(255), max_users INT, created_by varchar(255) , PRIMARY KEY (resource_id));
CREATE TABLE IF NOT EXISTS reservation (reservation_id INT NOT NULL AUTO_INCREMENT,start_time bigint, end_time bigint, resource_id INT,PRIMARY KEY (reservation_id), FOREIGN KEY (resource_id) REFERENCES resource(resource_id)ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS tag (tag_id INT NOT NULL AUTO_INCREMENT,tag_name varchar(255) NOT NULL UNIQUE, PRIMARY KEY (tag_id));
CREATE TABLE IF NOT EXISTS user_reservation (user_id INT, reservation_id INT, PRIMARY KEY (user_id, reservation_id), FOREIGN KEY (user_id) REFERENCES user(user_id)ON DELETE CASCADE,FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS resource_tag (resource_id INT, tag_id INT, PRIMARY KEY (resource_id, tag_id), FOREIGN KEY (resource_id) REFERENCES resource(resource_id)ON DELETE CASCADE, FOREIGN KEY (tag_id) REFERENCES tag(tag_id));
CREATE TABLE IF NOT EXISTS permission_group (group_id INT NOT NULL AUTO_INCREMENT, group_name varchar(255), group_description varchar(255), user_management_permission BOOLEAN DEFAULT 0, resource_management_permission BOOLEAN DEFAULT 0, reservation_management_permission BOOLEAN DEFAULT 0, is_private BOOLEAN DEFAULT 1, PRIMARY KEY (group_id));
CREATE TABLE IF NOT EXISTS user_group (user_id INT , group_id INT, PRIMARY KEY (user_id, group_id), FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE, FOREIGN KEY (group_id) REFERENCES permission_group(group_id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS resource_group (resource_id INT, group_id INT, resource_permission ENUM('view', 'reserve'), PRIMARY KEY (resource_id, group_id), FOREIGN KEY (resource_id) REFERENCES resource(resource_id) ON DELETE CASCADE, FOREIGN KEY (group_id) REFERENCES permission_group(group_id) ON DELETE CASCADE);
