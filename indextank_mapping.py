itf1 = name
itf2 = gender
itf3 = relationship_status
itf4 = education_index
itf5 = work_index
itf6 = c2
itf7 = h2
itf8 = likes_dummy


birthday_index,
c3, c4
h3, h4




name = me.get('name')
email = me.get('email')
fb_uid = me.get('id')
username = me.get('username')
gender = parse_gender(me.get('gender'))
relationship_status = me.get('relationship_status')
education, education_index = parse_education(me.get('education'))
work, work_index = parse_work(me.get('work'))
birthday, birthday_index = parse_birthday(me.get('birthday'))
interested_in_index = parse_interested_in(me.get('interested_in'))