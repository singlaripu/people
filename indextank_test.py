from myfunctions import get_index_handle

h = get_index_handle()

v1 = {0: 1, 1: 1993, 2: 29.1667, 3: 75.7167, 4: 30, 5: 35, 6: 1, 7: 1}
v2 = {0: 1, 1: 1988, 2: 12.9833, 3: 77.5833, 4: 29.53, 5: 75.02, 6: 0, 7: 0}
variables = {0: 1, 1: 1988, 2: 12, 3: 77, 4: 29, 5: 75, 6: 1, 7: 1}

h.update_variables(540, variables=v1)
h.update_variables(593, variables=v2)

def do_the_do():
	h.update_variables(540, variables=v1)
	res = h.search('ripu', scoring_function=3, variables=variables, fetch_fields=['itf1'])['results']

	for r in res:
		print r['itf1'], r['query_relevance_score']	

do_the_do()

print '\nchanging year towards rajat'
variables[1] = 1993
do_the_do()

print '\nchanging year towards ripu'
variables[1] = 1988
do_the_do()

print '\nchanging year towards 2020'
variables[1] = 2020
do_the_do()

print '\nchanging gender towards rajat'
variables[7] = 0
do_the_do()

print '\nchanging gender towards ripu'
variables[7] = 1
do_the_do()

print '\n increasing votes for rajat'
v1[0] = 10000
do_the_do()

print '\n changing interested in towards rajat'
variables[6] = 0
do_the_do()

print '\n changing interested in towards ripu'
variables[6] = 1
do_the_do()

print '\n changing latlong towards rajat'
variables[4] = 30
variables[5] = 35
do_the_do()

print '\n changing latlong towards ripu'
variables[4] = 29
variables[5] = 75
do_the_do()



