const chef = require('../models/chef')

const { date } = require('../../lib/utils')

module.exports = {
    index(req,res){
        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 16
        let offset = limit * (page - 1)

        const params = {
            //filter,
            page,
            limit,
            offset,
            callback(chefs){
                const pagination = {
                    total: Math.ceil( chefs[0].total / limit ),
                    page
                }
                return res.render("admin/chefs/index", { chefs, pagination /*, filter*/ })
            }
        }

        chef.paginate(params)

    },
    create(req,res){
        return res.render("admin/chefs/create")
    },
    post(req,res){
        const keys = Object.keys(req.body)
    
        for (key of keys){
            if (req.body[key] == ""){
                return res.send("Por favor, preencha todos os campos.")
            }
                
        }

        chef.create(req.body, function(chef){
            return res.redirect(`/admin/chef/${chef.id}`)
        })
    },
    show(req,res){
        chef.find(req.params.id, function(chef){
            if (!chef) return res.send("chef not found!")

            const query = require('../models/chef')
            
            query.findRecipeByChef(req.params.id, function(recipesByChef){
                
                const chefsRecipes = require('../models/chef')
                let { filter, page, limit } = req.query

                page = page || 1
                limit = limit || 4
                let offset = limit * (page - 1)

                const params = {
                    //filter,
                    page,
                    limit,
                    offset,
                    callback(chefs){
                        const pagination = {
                            total: Math.ceil( chefs[0].total / limit ),
                            limit: limit,
                            page
                        }
                        return res.render("admin/chefs/show", { chef, pagination, items: recipesByChef })
                    }
                }
                chefsRecipes.paginate(params)
            })
        })
    },
    edit(req,res){
        chef.find(req.params.id, function(chef){
            if (!chef) return res.send("chef not found!")

            chef.created_at = date(chef.created_at).format

            return res.render("admin/chefs/edit", { chef })
        })
    },
    put(req,res){
        const keys = Object.keys(req.body)
    
        for (key of keys){
            if (req.body[key] == ""){
                return res.send("Por favor, preencha todos os campos.")
            }
                
        }

        chef.update(req.body, function(){
            return res.redirect(`/admin/chef/${req.body.id}`)
        })
    },
    delete(req,res){
        console.log(req.body.id)
        chef.delete(req.body.id, function(){
            return res.redirect(`/admin/chefs`)
        })
    },
    list(req, res){
        let { page, limit } = req.query
        
        page = page || 1
        limit = limit || 16
        let offset = limit * (page - 1)

        const params = {
            page,
            limit,
            offset,
            callback(chef){
                const pagination = {
                    total: Math.ceil( chef[0].total / limit ),
                    page
                }
                return res.render("site/chefs", { items: chef, pagination})
            }
        }
        
        chef.paginate(params)
    },
    open(req, res) {
        chef.find(req.params.id, function(chef){
            if (!chef) return res.send("chef not found!")

            const query = require('../models/chef')
            query.findRecipeByChef(req.params.id, function(recipesByChef){
                return res.render("site/chef", { chef, items: recipesByChef })
            })

            
        })
    }
}
