drop table if exists profile;
create table profile (
  id integer primary key autoincrement,
  uid text not null,
  profile_pic_url text not null
);