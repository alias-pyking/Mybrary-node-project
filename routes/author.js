const express = require('express');
const router = express.Router();
const Author = require('../models/author');
// All author routes
router.get('/', async (req,response)=>{
    let searchOptions = {};
    if(req.query.name !== null && req.query.name !==''){
        searchOptions.name = new RegExp(req.query.name,'i');
    }
    try {
        const authors = await Author.find(searchOptions);
        response.render('authors/index',{
            authors:authors,
            searchOptions: req.query
        });
    } catch  {
        response.redirect('/');
    }

    

})

//New author router
router.get('/new',(req,response)=>{
    response.render('authors/new',{
        author: new Author()
    });
})
// create new author
router.post('/',async (req,response)=>{
    const author = new Author({
        name:req.body.name,
    });
    try{
        const newAuthor = await author.save();
        // response.redirect(`authors/${newAuthor.id}`);
        response.redirect('authors');
    }
    catch{
        response.render('authors/new',{
            author:author,
            errorMessage:'Something went wrong',
        });
    }
});


module.exports = router;