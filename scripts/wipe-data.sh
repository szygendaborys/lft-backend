#!/bin/sh 

export PGPASSWORD='root'; \
export PGUSER='root'; \
export PGDB='lft_dev'; \

BASETBLS="game_config,seeding,league_user,user_games,user,"

echo Deleting tables:${BASETBLS}

for i in $(echo $BASETBLS | sed "s/,/ /g")
do
    echo Deleting ${i}
    psql -h localhost -p 5432 $PGDB --command "DELETE FROM \"$i\" CASCADE;"

    echo "$i"
done
