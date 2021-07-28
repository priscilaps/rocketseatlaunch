const db = require("../../config/db")
const fs = require('fs')
const { Console } = require("console")

module.exports = {
    async create( {filename, path, recipe_id} ) {
        const query = `
            INSERT INTO files(
                name,
                path
            ) VALUES ($1, $2)
            RETURNING id
        `

        const values = [
            filename,
            path
        ]

        const file_id = await db.query(query, values)

        return db.query( `
            INSERT INTO recipe_files(
                recipe_id,
                file_id
            ) VALUES ($1, $2)
            RETURNING id
            `, [ recipe_id, file_id.rows[0].id])
    },
    async delete(id) {
        
        try{

            const result = await db.query(`
            SELECT * FROM files
            LEFT JOIN recipe_files ON (recipe_files.file_id = files.id)
            WHERE recipe_files.id = $1

                `, [id])
            const file = await result.rows[0]

            fs.unlinkSync(file.path)

            db.query(`
                DELETE FROM recipe_files 
                WHERE id = $1
            `, [id]) 

            //console.log(`Deletei o arquivo ${id} da tabela recipe_files.`)
            
            results = db.query(`
                DELETE FROM files 
                WHERE files.id = $1
            `, [file.file_id]) 
            
            //console.log(`Deletei o arquivo ${file.file_id} da tabela files.`)

            return results
        }catch(err){
            console.error(err)
        }

    },
    async findRecipeFile(id){
        try{

            const result = await db.query(`
                SELECT * 
                FROM files
                LEFT JOIN recipe_files ON (recipe_files.file_id = files.id)
                WHERE recipe_files.recipe_id = $1
                `, [id])
            const files = result.rows
            
            return files

        }catch(err){
            console.error(`Não consegui encontrar recipe file: ${err}`)
        }
    },
}