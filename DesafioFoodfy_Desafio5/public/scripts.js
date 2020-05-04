const currentPage = location.pathname
const menuItems = document.querySelectorAll(".menu a")

for ( item of menuItems ) {
    if ( currentPage.includes(item.getAttribute("href")) ){
        item.classList.add("active")
    }
}

// click da receita
const recipes = document.querySelectorAll('.recipe')

if (!document.querySelector('body').classList.contains('admin')){
    
    for (const recipe of recipes) {
        recipe.addEventListener("click", function(){
            let recipeId = recipe.getAttribute("id")
            window.location.href = `/site/recipe/${recipeId}`
        })
    }

} else {
    
    for (const recipe of recipes) {
        recipe.addEventListener("click", function(){
            let recipeId = recipe.getAttribute("id")
            window.location.href = `/admin/recipe/${recipeId}`
        })
    }

}
// click do chef
const chefs = document.querySelectorAll('.chef')

if (!document.querySelector('body').classList.contains('admin')){
    for (const chef of chefs) {
        chef.addEventListener("click", function(){
            let chefId = chef.getAttribute("id")
            window.location.href = `/site/chef/${chefId}`
        })
    }
} else {
    for (const chef of chefs) {
        chef.addEventListener("click", function(){
            let chefId = chef.getAttribute("id")
            window.location.href = `/admin/chef/${chefId}`
        })
    }
}


const wrappers = document.querySelectorAll(".wrapper")  //pega os wrappers de ingredientes, modo de preparo e informações adicionais
for (wrapper of wrappers){                                              //pra cada wrapper (cada um só tem .button e um .button-content)
    const buttonState = wrapper.querySelector(".button")                //pega o elemento do botao mostrar/esconder
    const contentDisplay = wrapper.querySelector(".button-content")     //pega a div que o botao vai esconder/mostrar

    buttonState.addEventListener('click', function(){

    const classes = contentDisplay.classList
    
        if ( classes.contains("show") ) {

            contentDisplay.classList.add("hide")
            contentDisplay.classList.remove("show")
            buttonState.textContent = "mostrar" 
    
        }else if (classes.contains("hide")){

            contentDisplay.classList.add("show")
            contentDisplay.classList.remove("hide")
            buttonState.textContent = "esconder"

        }
    
        
    })
}

function addIngredient() {
  const ingredients = document.querySelector("#ingredients")
  const fieldContainer = document.querySelectorAll(".ingredient")

  // Realiza um clone do último ingrediente adicionado
  const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true)

  // Não adiciona um novo input se o último tem um valor vazio
  if (newField.children[0].value == "") return false

  // Deixa o valor do input vazio
  newField.children[0].value = ""
  ingredients.appendChild(newField)
}

if (document.querySelector(".add-ingredient"))
    document.querySelector(".add-ingredient").addEventListener("click", addIngredient)

function addPreparation() {
  const preparation = document.querySelector("#preparations")
  const fieldContainer = document.querySelectorAll(".preparation")

  // Realiza um clone do último ingrediente adicionado
  const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true)

  // Não adiciona um novo input se o último tem um valor vazio
  if (newField.children[0].value == "") return false

  // Deixa o valor do input vazio
  newField.children[0].value = ""
  preparation.appendChild(newField)
}

if (document.querySelector(".add-preparation-step"))
    document.querySelector(".add-preparation-step").addEventListener("click", addPreparation)

if (document.querySelector("#form-delete")){
    const formDelete = document.querySelector('#form-delete')
    formDelete.addEventListener("submit", function(){
        const confirmation = confirm("Tem certeza que deseja deletar?")
        if (!confirmation){
            event.preventDefault()
        }
    })
}


// paginação

function paginate(selectedPage, totalPages){
    let pages = [],
        oldPage

    for ( let currentPage = 1; currentPage <= totalPages; currentPage++ ){
        
        const firstAndLastPage = currentPage == 1 || currentPage == totalPages
        const pagesAfterSelectedPage = currentPage <= selectedPage + 2
        const pagesBeforeSelectedPage = currentPage >= selectedPage - 2

        if ( firstAndLastPage || pagesBeforeSelectedPage && pagesAfterSelectedPage ){
            if ( oldPage && currentPage - oldPage > 2 ) {
                pages.push("...")
            }

            if ( oldPage && currentPage - oldPage == 2 ) {
                pages.push( oldPage + 1 )
            }

            pages.push(currentPage)

            oldPage = currentPage
        }
    }
    return pages
}
function createPagination(pagination){
    const filter = pagination.dataset.filter
    const page = +pagination.dataset.page
    const total = +pagination.dataset.total
    const pages = paginate(page, total)
    
    let elements = ""
    
    for ( let page of pages ) {
        if ( String(page).includes("...")){
            elements += `<span>...</span>`
        } else {
            if ( filter ){
                elements += `<a href="?page=${page}&filter=${filter}">${page}</a>`
            } else {
                elements += `<a href="?page=${page}">${page}</a>`
            }
        }
    }
    
    pagination.innerHTML = elements
}

const pagination = document.querySelector(".pagination")

if (pagination && pagination.dataset.total > pagination.dataset.limit) { 
    createPagination(pagination)                        // só exibe a paginação se tiver mais de 1 pág
}

if (document.querySelector('#receitas') && document.querySelector('.search-title') ){
    if (window.location.search.includes('filter')){
        document.querySelector('.search-title').classList.add('show')
    } else {
        document.querySelector('.search-title').classList.add('hide')
    }
}