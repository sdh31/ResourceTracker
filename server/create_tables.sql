USE test_db;
CREATE TABLE IF NOT EXISTS user (user_id INT NOT NULL AUTO_INCREMENT, username varchar(255) NOT NULL UNIQUE, password varchar(255) NOT NULL, permission_level ENUM('admin', 'user'),PRIMARY KEY (user_id));
CREATE TABLE IF NOT EXISTS resource (resource_id INT NOT NULL AUTO_INCREMENT, name varchar(255), description varchar(255), max_users INT, created_by varchar(255) , PRIMARY KEY (resource_id));
CREATE TABLE IF NOT EXISTS reservation (reservation_id INT NOT NULL AUTO_INCREMENT,start_time datetime, end_time datetime, resource_id INT,PRIMARY KEY (reservation_id), FOREIGN KEY (resource_id) REFERENCES resource(resource_id));
CREATE TABLE IF NOT EXISTS tag (tag_id INT NOT NULL, tag_name varchar(255), PRIMARY KEY (tag_id));
CREATE TABLE IF NOT EXISTS user_reservation (user_id INT, reservation_id INT, PRIMARY KEY (user_id, reservation_id), FOREIGN KEY (user_id) REFERENCES user(user_id), FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id));
CREATE TABLE IF NOT EXISTS resource_tag (resource_id INT, tag_id INT, PRIMARY KEY (resource_id, tag_id), FOREIGN KEY (resource_id) REFERENCES resource(resource_id), FOREIGN KEY (tag_id) REFERENCES tag(tag_id));
INSERT IGNORE INTO user (username, password, permission_level) VALUES ('admin', 'admin', 'admin');
