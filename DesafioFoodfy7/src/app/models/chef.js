const db = require("../../config/db")

const { date } = require('../../lib/utils')


module.exports = {
    all(callback) {
        db.query(`
            SELECT chefs.*, count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
            GROUP BY chefs.id
            ORDER BY total_recipes DESC
            `, function(err, results){
            if (err) throw `Database Error! ${err}`

            callback( results.rows )
        })
    },
    create(data, callback) {
        const query = `
            INSERT INTO chefs (
                name,
                file_id,
                created_at
            ) VALUES ($1, $2, $3)
            RETURNING id
        `
        const values = [
            data.name,
            data.avatar_url, //corrigir
            date(Date.now()).iso
        ]

        db.query(query, values, function(err, results){
            if (err) throw `Database Error! ${err}`

            callback( results.rows[0] )
        })
    },
    find(id, callback){
        db.query(`
            SELECT chefs.*, count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
            WHERE chefs.id= $1
            GROUP BY chefs.id`, [id], function(err, results){
            if (err) throw `Database Error! ${err}`

            callback( results.rows[0] )
        })
    },
    findRecipeByChef(id, callback){
        db.query(`
            SELECT recipes.*, chefs.name as chef_name
            FROM recipes
            LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
            WHERE chefs.id = $1
            `, [id], function(err, results){
            if (err) throw `Database Error! ${err}`
            
            callback( results.rows )
        })
    },
    chefs( callback ) {
        db.query(`SELECT name, id FROM chefs`, function(err, results){
            if (err) throw `Database Error! ${err}`

            callback( results.rows )
        })
    },
    update(data, callback){
        const query = `
            UPDATE chefs SET
                avatar_url=($1),
                name=($2)
            WHERE id = $3
        `

        const values = [
            data.avatar_url,
            data.name,
            parseInt(data.id)
        ]

        db.query(query, values, function(err, results){
            if (err) throw `Database Error! ${err}`

            callback()
        })
    },
    delete(id, callback){
        console.log(id)
        db.query(`DELETE FROM chefs WHERE id= $1`, [parseInt(id)], function(err, results){
            if (err) throw `Database Error! ${err}`

            callback()
        })
    },
    paginate(params){
        const { limit, offset, callback } = params

        let query = `
            SELECT chefs.*,
                 ( SELECT count(*) FROM chefs ) AS total,
                 count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
            GROUP BY chefs.id LIMIT $1 OFFSET $2
            `
            db.query(query, [limit, offset], function(err, results){
                if (err) throw `Database Error! ${err}`
                
            callback( results.rows )
        })

    }
}