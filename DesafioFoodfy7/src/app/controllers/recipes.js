const recipe = require('../models/recipe')
const File = require('../models/file')

const { date } = require('../../lib/utils')
const file = require('../models/file')

module.exports = {
    index(req,res){
         let { filter, page, limit } = req.query
        page = page || 1
        limit = limit || 10
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(recipes){
                const pagination = {
                    total: Math.ceil( recipes[0].total / limit ),
                    limit: limit,
                    page
                }

                recipes = recipes.map(recipe => ({
                    ...recipe,
                    src: `${req.protocol}://${req.headers.host}${recipe.file_path.replace("public","")}`
                }))
                
                return res.render("admin/recipes/index", { items: recipes, pagination, filter })
            }
        }

        recipe.paginate(params)

    },
    async create(req,res){

        const result = await recipe.chefs()
        const options = result.rows

        return res.render("admin/recipes/create", { chefsOptions: options })
        
    },
    async post(req,res){
        try{
            const keys = Object.keys(req.body)

            for (key of keys){
                if (req.body[key] == ""){
                    
                    return res.send("Por favor, preencha todos os campos.")
                }                    
            } 
            
            if (req.files.length == 0)
                return res.send('Por favor, envie pelo menos uma imagem.')
    
    
            let results = await recipe.create(req.body)
            const recipeID = results.rows[0].id

            const filesPromise = req.files.map(file => File.create({...file, recipe_id: recipeID}))
            await Promise.all(filesPromise)
    
            return res.redirect(`/admin/recipe/${recipeID}`)
        }catch(err){
            console.error(err)
        }
    },
    async show(req,res){
        try{
            const result = await recipe.find(req.params.id)
            const selectedRecipe = result.rows[0]

            if (!selectedRecipe) return res.send("recipe not found!")
            
            const recipe_files = await File.findRecipeFile(selectedRecipe.id)
            const files = recipe_files.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }))
 
            return res.render("admin/recipes/show", { item: selectedRecipe, images: files })
        }catch(err){
            console.error(err)
        }
    },
    async edit(req,res){
        try{
            const keys = Object.keys(req.body)
    
            for (key of keys){
                if (req.body[key] == ""){
                    return res.send("Por favor, preencha todos os campos.")
                }
                    
            }

            let result = await recipe.find(req.params.id)
            const selectedRecipe = result.rows[0]

            if (!selectedRecipe) return res.send("recipe not found!")
                
            selectedRecipe.created_at = date(selectedRecipe.created_at).format

            // pega a lista de chefs pra popular o select
            result = await recipe.chefs()
            const chefsOptions = result.rows

            // pega a lista de imagens pra popular a galeria
            const recipe_files = await File.findRecipeFile(selectedRecipe.id)
            const files = recipe_files.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }))

            return res.render("admin/recipes/edit", { recipe: selectedRecipe, chefsOptions, files })
        }catch(err){
            console.error(err)
        }
    },
    async put(req,res){
        try{
            const keys = Object.keys(req.body)
            
            for (key of keys){
                if (req.body[key] == "" && key !="removed_files"){
                    return res.send("Por favor, preencha todos os campos.")
                }       
            }
            
            if (req.files.length != 0){
                const newFilesPromise = req.files.map(file => File.create({...file, recipe_id: req.body.id}))
                await Promise.all(newFilesPromise)
            }
            
            if (req.body.removed_files){
                
                const removedFiles = req.body.removed_files.split(",")
                const lastIndex = removedFiles.length -1
                removedFiles.splice(lastIndex, 1)

                const removedFilesPromise = removedFiles.map(id => File.delete(id))
                await Promise.all(removedFilesPromise)
            }
    
            recipe.update(req.body)

            return res.redirect(`/admin/recipe/${req.body.id}`)
        }catch(err){
            console.error(err)
        }
    },
    async delete(req,res){
        const recipeHasFiles = await file.findRecipeFile(req.body.id)

        try{

            // deleta todos os arquivos vinculados a receita atual
            if (recipeHasFiles.length > 0){
                const PromiseDeletedFiles = recipeHasFiles.map(async (result) => { await file.delete(result.id) })

                await Promise.all(PromiseDeletedFiles)
            }
                      
            
         }catch(err){
            console.error(err)

        }

        // só quando terminar a promessa deleta a receita
        await recipe.delete(req.body.id)

        // vai pra lista de receitas
        return res.redirect(`/admin/recipes`)
    },
    search(req,res){
        recipe.search(req.params.filter, function(){
            return res.render("site/search")
        })
    },
    siteIndex(req, res){
        recipe.popular(function(popularRecipes){
            return res.render("site/index", { items: popularRecipes })
        })   
    },
    list(req, res){
        let { filter, page, limit } = req.query
        
        page = page || 1
        limit = limit || 12
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(recipe){
                const pagination = {
                    total: Math.ceil( recipe[0].total / limit ),
                    limit: limit,
                    page
                }
                return res.render("site/recipes", { items: recipe, pagination, filter })
            }
        }
        
        recipe.paginate(params)
    },
    open(req, res) {
        recipe.find(req.params.id, function(recipe) {
            if (!recipe) return res.send(`recipe not found! ${req.params.id}`)
            
        return res.render("site/recipe",{ item: recipe })
        })
    }
}

